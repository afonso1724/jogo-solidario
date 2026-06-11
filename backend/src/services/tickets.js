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
  return crypto.createHash('sha256').update(`${Date.now()}-${Math.random()}-${crypto.randomUUID()}`).digest('hex');
}

function getStatusInicial(tipo) {
  return tipo === 'reserva' ? 'reservado' : 'pendente';
}

function buildTicketPayload({ usuarioId, quantidade, tipo, status, valorUnitario, valorTotal, comprovanteUrl, reservaExpiraEm }) {
  return {
    usuario_id: usuarioId,
    quantidade,
    tipo,
    status,
    valor_unitario: valorUnitario,
    valor_total: valorTotal,
    comprovante_url: comprovanteUrl,
    evento_data: config.eventoData,
    reserva_expira_em: reservaExpiraEm,
    status_pagamento: 'PENDENTE',
  };
}

async function insertTicketRecord(supabase, payload) {
  try {
    const { data, error } = await supabase.from('tickets').insert(payload).select().single();
    if (error) throw error;
    return { data };
  } catch (error) {
    const message = error?.message || '';
    if (message.includes('status_pagamento') || message.includes('hash_validacao') || message.includes('does not exist')) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.status_pagamento;
      delete fallbackPayload.hash_validacao;
      const { data, error: fallbackError } = await supabase.from('tickets').insert(fallbackPayload).select().single();
      if (fallbackError) throw new Error(fallbackError.message);
      return { data };
    }
    throw error;
  }
}

async function updateTicketRecord(supabase, id, payload) {
  try {
    const { data, error } = await supabase.from('tickets').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return { data };
  } catch (error) {
    const message = error?.message || '';
    if (message.includes('status_pagamento') || message.includes('hash_validacao') || message.includes('does not exist')) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.status_pagamento;
      delete fallbackPayload.hash_validacao;
      const { data, error: fallbackError } = await supabase.from('tickets').update(fallbackPayload).eq('id', id).select().single();
      if (fallbackError) throw new Error(fallbackError.message);
      return { data };
    }
    throw error;
  }
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
  const status = getStatusInicial(tipo);

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

    const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(path);

    comprovanteUrl = urlData.publicUrl;
  }

  const ticketPayload = buildTicketPayload({
    usuarioId: usuario.id,
    quantidade,
    tipo,
    status,
    valorUnitario,
    valorTotal,
    comprovanteUrl,
    reservaExpiraEm: tipo === 'reserva' ? calcReservaExpira() : null,
  });

  const { data: ticket } = await insertTicketRecord(supabase, ticketPayload);

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
  const { data: updated } = await updateTicketRecord(supabase, ticketId, {
    status: 'aprovado',
    status_pagamento: 'APROVADO',
    hash_unico: hash,
    hash_validacao: hash,
  });

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
    await supabase.from('tickets').update({ validado_por: adminId }).eq('id', ticketId);
  }

  return updated;
}

export async function validarNaPortaria(hash, adminId) {
  const supabase = getSupabase();

  let ticket = null;
  let error = null;

  const { data: byHashUnico, error: hashUnicoError } = await supabase
    .from('tickets')
    .select('*, usuario:usuarios(*)')
    .eq('hash_unico', hash)
    .single();

  if (!hashUnicoError && byHashUnico) {
    ticket = byHashUnico;
  } else {
    const { data: byHashValidacao, error: hashValidacaoError } = await supabase
      .from('tickets')
      .select('*, usuario:usuarios(*)')
      .eq('hash_validacao', hash)
      .single();
    ticket = byHashValidacao;
    error = hashValidacaoError;
  }

  if (error || !ticket) {
    return { ok: false, message: 'Ingresso não encontrado.' };
  }

  const statusPagamento = ticket.status_pagamento || (ticket.status === 'aprovado' ? 'APROVADO' : null);
  const alreadyUsed = ticket.utilizado === true || ticket.utilizado === 'SIM' || ticket.utilizado === 'sim';

  if (ticket.status !== 'aprovado' && statusPagamento !== 'APROVADO') {
    return { ok: false, message: `Ingresso com status "${ticket.status}". Não autorizado.` };
  }

  if (alreadyUsed) {
    const usedAt = ticket.utilizado_em ? new Date(ticket.utilizado_em).toLocaleString('pt-PT') : 'desconhecido';
    return { ok: false, message: `ALERTA: Este ingresso já foi utilizado em ${usedAt}!` };
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

  return {
    ok: true,
    message: 'Entrada Liberada!',
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
