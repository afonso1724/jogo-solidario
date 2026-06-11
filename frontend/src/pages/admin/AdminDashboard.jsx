import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Eye,
  Loader2,
  LogOut,
  Ticket,
  Wallet,
} from 'lucide-react';
import { getDashboard, validarCompra } from '../../lib/api';
import Footer from '../../components/Footer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const token = localStorage.getItem('admin_token');

  const load = async () => {
    if (!token) {
      navigate('/admin');
      return;
    }
    try {
      const res = await getDashboard(token);
      setData(res);
    } catch {
      localStorage.removeItem('admin_token');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAprovar = async (ticketId) => {
    setActionId(ticketId);
    try {
      await validarCompra(token, ticketId);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <Loader2 className="h-10 w-10 animate-spin text-brand-yellow" />
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="flex min-h-screen flex-col bg-brand-black">
      <header className="border-b border-brand-gray-850 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-brand-yellow">Dashboard Admin</h1>
          <button type="button" onClick={logout} className="btn-outline py-2 text-sm">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Ingressos Vendidos', value: stats.total_vendidos ?? 0, icon: Ticket },
            { label: 'Reservas', value: stats.total_reservas ?? 0, icon: Wallet },
            {
              label: 'Valor Arrecadado',
              value: `${Number(stats.valor_arrecadado ?? 0).toLocaleString('pt-AO')} Kz`,
              icon: CheckCircle,
            },
            {
              label: 'Pendentes',
              value: stats.compras_pendentes ?? 0,
              icon: Eye,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-surface">
              <Icon className="h-6 w-6 text-brand-yellow" />
              <p className="mt-2 text-sm text-brand-gray-650">{label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title mt-12">Transações</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-gray-850">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-brand-black-card text-brand-gray-650">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Quantidade</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Comprovativo</th>
                <th className="px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {(data?.transacoes || []).map((t) => (
                <tr key={t.id} className="border-t border-brand-gray-850">
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{t.usuario?.nome}</div>
                    <div className="text-xs text-brand-gray-650">{t.usuario?.email}</div>
                  </td>
                  <td className="px-4 py-3">{t.quantidade}</td>
                  <td className="px-4 py-3 capitalize">{t.tipo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === 'aprovado'
                          ? 'bg-green-500/20 text-green-400'
                          : t.status === 'pendente'
                            ? 'bg-brand-yellow/20 text-brand-yellow'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {Number(t.valor_total).toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="px-4 py-3">
                    {t.comprovante_url ? (
                      <a
                        href={t.comprovante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-yellow hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {t.status === 'pendente' && (
                      <button
                        type="button"
                        disabled={actionId === t.id}
                        onClick={() => handleAprovar(t.id)}
                        className="btn-primary py-1.5 px-3 text-xs"
                      >
                        {actionId === t.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Validar Compra'
                        )}
                      </button>
                    )}
                    {t.utilizado && (
                      <span className="text-xs text-green-400">Utilizado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
