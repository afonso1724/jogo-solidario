import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { validarPortaria } from '../../lib/api';
import Footer from '../../components/Footer';

export default function AdminValidar() {
  const { hash } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setResult({ ok: false, message: 'Faça login no painel admin primeiro.' });
      setLoading(false);
      return;
    }

    validarPortaria(hash)
      .then(setResult)
      .catch((err) => setResult({ ok: false, message: err.message }))
      .finally(() => setLoading(false));
  }, [hash]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-black">
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="card-surface max-w-md w-full text-center">
          {loading ? (
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-yellow" />
          ) : result?.ok ? (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" />
              <h1 className="mt-4 text-xl font-bold text-white">Ingresso válido</h1>
              <p className="mt-2 text-brand-gray-650">{result.message}</p>
              {result.ticket && (
                <p className="mt-4 text-sm text-white">
                  {result.ticket.nome} — {result.ticket.quantidade} ingresso(s)
                </p>
              )}
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-400" />
              <h1 className="mt-4 text-xl font-bold text-white">Validação recusada</h1>
              <p className="mt-2 text-red-400">{result?.message}</p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
