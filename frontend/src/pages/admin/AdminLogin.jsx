import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { adminLogin } from '../../lib/api';
import Footer from '../../components/Footer';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const { token } = await adminLogin(email, senha);
      localStorage.setItem('admin_token', token);
      navigate('/admin/dashboard');
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-black">
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <form onSubmit={handleSubmit} className="card-surface w-full max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-yellow text-brand-black">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-white">Painel Admin</h1>
          <p className="mt-2 text-center text-sm text-brand-gray-650">
            Acesso exclusivo para organizadores
          </p>

          <div className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {erro && (
            <p className="mt-4 text-sm text-red-400">{erro}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
