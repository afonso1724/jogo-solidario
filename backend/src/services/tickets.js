import crypto from 'crypto';
import { config } from '../config.js';
import { getSupabase } from '../lib/supabase.js';
import { enviarEmail, templateConfirmacao, templateBilheteAprovado } from './email.js';
import { gerarBilhetePDF } from './pdf.js';

function calcReservaExpira() {
  const evento = new Date(config.eventoData);
  const expira = new Date(evento);
  expira.setHours(expira.getHours() - config.reservaHorasAntes);
  return expira.toISOString();
}

export function gerarHash() {
  return crypto.randomBytes(32).toString('hex');
}

export async function criarTicket({
  nome,
  email,
  telefone,
  quantidade,
  tipo,
  comprovanteFile,
}) {
  const supabase = getSupabase();
  const valorUnitario = config.ticketPreco;
  const valorTotal = quantidade * valorUnitario;

  const { data: usuario, error: userErr } = await supabase
    .from('usuarios')
    .insert({ nome, email, telefone })
    .select()
    .single();

  if (userErr) throw new Error(userErr.message);

  let comprovanteUrl = null;
  let status = tipo === 'reserva' ? 'reservado' : 'pendente';

  if (tipo === 'compra' && comprovanteFile) {
    const ext = comprovanteFile.originalname.split('.').pop();
    const path = `${usuario.id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('comprovantes')
      .upload(path, comprovanteFile.buffer, {
        contentType: comprovanteFile.mimetype,
        upsert: false,
      });

    if (uploadErr) throw new Error(`Upload comprovativo: ${uploadErr.message}`);

    const { data: urlData } = supabase.storage
      .from('comprovantes')
      .getPublicUrl(path);

    comprovanteUrl = urlData.publicUrl;
  }

  const ticketPayload = {
    usuario_id: usuario.id,
    quantidade,
    tipo,
    status,
    valor_unitario: valorUnitario,
    valor_total: valorTotal,
    comprovante_url: comprovanteUrl,
    evento_data: config.eventoData,
    reserva_expira_em: tipo === 'reserva' ? calcReservaExpira() : null,
  };

  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .insert(ticketPayload)
    .select()
    .single();

  if (ticketErr) throw new Error(ticketErr.message);

  const referencia = ticket.id.slice(0, 8).toUpperCase();

  await enviarEmail({
    para: email,
    assunto: `Jogo Solidário — ${tipo === 'reserva' ? 'Reserva' : 'Compra'} confirmada`,
    html: templateConfirmacao({
      nome,
      tipo,
      status,
      quantidade,
      valorTotal,
      referencia,
    }),
  });

  return {
    ticket,
    referencia,
    message:
      tipo === 'reserva'
        ? 'Reserva efectuada! Pague no local antes do prazo. Confirmação enviada por e-mail.'
        : 'Compra registada! Aguarde validação do comprovativo. Confirmação enviada por e-mail.',
  };
}

export async function aprovarTicket(ticketId, adminId) {
  const supabase = getSupabase();

  const { data: ticket, error: fetchErr } = await supabase
    .from('tickets')
    .select('*, usuario:usuarios(*)')
    .eq('id', ticketId)
    .single();

  if (fetchErr || !ticket) throw new Error('Ticket não encontrado');
  if (ticket.status !== 'pendente') {
    throw new Error('Apenas compras pendentes podem ser validadas');
  }

  const hash = gerarHash();

  const { data: updated, error: updateErr } = await supabase
    .from('tickets')
    .update({
      status: 'aprovado',
      hash_unico: hash,
    })
    .eq('id', ticketId)
    .select('*, usuario:usuarios(*)')
    .single();

  if (updateErr) throw new Error(updateErr.message);

  const usuario = updated.usuario;
  const pdfBuffer = await gerarBilhetePDF({
    nome: usuario.nome,
    email: usuario.email,
    quantidade: updated.quantidade,
    hash,
    valorTotal: updated.valor_total,
  });

  await enviarEmail({
    para: usuario.email,
    assunto: 'Jogo Solidário — O seu ingresso está pronto!',
    html: templateBilheteAprovado({ nome: usuario.nome, hash }),
    anexos: [
      {
        filename: `bilhete-${hash.slice(0, 8)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  if (adminId) {
    await supabase
      .from('tickets')
      .update({ validado_por: adminId })
      .eq('id', ticketId);
  }

  return updated;
}

export async function validarNaPortaria(hash, adminId) {
  const supabase = getSupabase();

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*, usuario:usuarios(*)')
    .eq('hash_unico', hash)
    .single();

  if (error || !ticket) {
    return { ok: false, message: 'Ingresso não encontrado.' };
  }

  if (ticket.status !== 'aprovado') {
    return { ok: false, message: `Ingresso com status "${ticket.status}". Não autorizado.` };
  }

  if (ticket.utilizado) {
    return { ok: false, message: 'Este ingresso já foi utilizado.' };
  }

  const { error: updateErr } = await supabase
    .from('tickets')
    .update({
      utilizado: true,
      utilizado_em: new Date().toISOString(),
      validado_por: adminId || ticket.validado_por,
    })
    .eq('id', ticket.id)
    .eq('utilizado', false);

  if (updateErr) {
    return { ok: false, message: 'Erro ao marcar ingresso como utilizado.' };
  }

  const { data: check } = await supabase
    .from('tickets')
    .select('utilizado')
    .eq('id', ticket.id)
    .single();

  if (!check?.utilizado) {
    return { ok: false, message: 'Entrada já registada por outro dispositivo.' };
  }

  return {
    ok: true,
    message: 'Entrada autorizada com sucesso!',
    ticket: {
      nome: ticket.usuario?.nome,
      quantidade: ticket.quantidade,
    },
  };
}

export async function expirarReservasAntigas() {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  await supabase
    .from('tickets')
    .update({ status: 'expirado' })
    .eq('status', 'reservado')
    .lt('reserva_expira_em', now);
}
