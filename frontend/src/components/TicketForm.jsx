import { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Upload,
  Wallet,
} from 'lucide-react';
import { criarInscricao } from '../lib/api';

const MAX_TICKETS = 4;
const IBAN_DISPLAY = import.meta.env.VITE_IBAN || 'AO06 0060.0130.0100.5890.7657.2';
const PRECO = Number(import.meta.env.VITE_TICKET_PRECO) || 1500;
const EXPRESS = Number(import.meta.env.VITE_TICKET_EXPRESS) || 926155070;

export default function TicketForm() {
  const [quantidade, setQuantidade] = useState(1);
  const [tipo, setTipo] = useState('reserva');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [comprovante, setComprovante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState('');

  const valorTotal = quantidade * PRECO;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso(null);

    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (tipo === 'compra' && !comprovante) {
      setErro('Envie o comprovativo bancário para compra imediata.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nome', nome.trim());
      fd.append('email', email.trim());
      fd.append('telefone', telefone.trim());
      fd.append('quantidade', String(quantidade));
      fd.append('tipo', tipo);
      if (comprovante) fd.append('comprovante', comprovante);

      const result = await criarInscricao(fd);
      setSucesso(result);
      setNome('');
      setEmail('');
      setTelefone('');
      setComprovante(null);
      setQuantidade(1);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="card-surface mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-brand-yellow" />
        <h3 className="mt-4 text-xl font-bold text-white">Operação registada!</h3>
        <p className="mt-2 text-brand-gray-650">{sucesso.message}</p>
        {sucesso.referencia && (
          <p className="mt-4 rounded-lg bg-brand-black px-4 py-2 font-mono text-sm text-brand-yellow">
            Ref: {sucesso.referencia}
          </p>
        )}
        <button
          type="button"
          className="btn-outline mt-6"
          onClick={() => setSucesso(null)}
        >
          Nova inscrição
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <div className="card-surface">
        <h3 className="text-lg font-semibold text-white">Quantidade de ingressos</h3>
        <p className="mt-1 text-sm text-brand-gray-650">Máximo {MAX_TICKETS} por operação</p>

        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            disabled={quantidade <= 1}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-brand-gray-750 text-brand-yellow disabled:opacity-40"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="text-4xl font-bold tabular-nums text-brand-yellow">
            {quantidade}
          </span>
          <button
            type="button"
            onClick={() => setQuantidade((q) => Math.min(MAX_TICKETS, q + 1))}
            disabled={quantidade >= MAX_TICKETS}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-brand-gray-750 text-brand-yellow disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          Total:{' '}
          <span className="font-bold text-brand-yellow">
            {valorTotal.toLocaleString('pt-AO')} Kz
          </span>
        </p>
      </div>

      <div className="card-surface space-y-4">
        <h3 className="text-lg font-semibold text-white">Os seus dados</h3>
        <input
          type="text"
          placeholder="Nome completo *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder="E-mail *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="tel"
          placeholder="WhatsApp*"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTipo('reserva')}
          className={`card-surface flex flex-col items-start gap-2 text-left transition-all ${
            tipo === 'reserva'
              ? 'border-brand-yellow ring-1 ring-brand-yellow'
              : 'hover:border-brand-gray-650'
          }`}
        >
          <Wallet className="h-8 w-8 text-brand-yellow" />
          <span className="font-semibold text-white">Reserva</span>
          <span className="text-xs text-brand-gray-650">
            Pague em dinheiro no local. Expira 48h antes do evento.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTipo('compra')}
          className={`card-surface flex flex-col items-start gap-2 text-left transition-all ${
            tipo === 'compra'
              ? 'border-brand-yellow ring-1 ring-brand-yellow'
              : 'hover:border-brand-gray-650'
          }`}
        >
          <Banknote className="h-8 w-8 text-brand-yellow" />
          <span className="font-semibold text-white">Compra imediata</span>
          <span className="text-xs text-brand-gray-650">
            Transferência bancária + envio de comprovativo.
          </span>
        </button>
      </div>

      {tipo === 'compra' && (
        <div className="card-surface space-y-4 border-brand-yellow/30">
          <h3 className="font-semibold text-brand-yellow">Dados bancários</h3>
          <p className="rounded-lg bg-brand-black px-4 py-3 font-mono text-sm tracking-wide text-white">
            IBAN: {IBAN_DISPLAY}
          </p>
          <p className="rounded-lg bg-brand-black px-4 py-3 font-mono text-sm tracking-wide text-white">
            EXPRESS: {EXPRESS}
          </p>
          <p className="text-xs text-brand-gray-650">
            Efetue a transferência do valor total e envie o comprovativo abaixo.
          </p>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-brand-gray-750 px-6 py-8 transition-colors hover:border-brand-yellow">
            <Upload className="h-8 w-8 text-brand-yellow" />
            <span className="text-sm text-gray-400">
              {comprovante ? comprovante.name : 'Foto ou PDF do comprovativo'}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setComprovante(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      )}

      {erro && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {erro}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            A processar...
          </>
        ) : (
          <>Confirmar {tipo === 'reserva' ? 'reserva' : 'compra'}</>
        )}
      </button>
    </form>
  );
}
