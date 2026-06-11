function normalizeApiUrl(value) {
  const trimmed = (value || '').toString().trim().replace(/\/+$|\s+$/g, '');
  if (!trimmed) {
    return '';
  }
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://jogo-solidario.onrender.com/api')
);

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  return data;
}

export async function criarInscricao(formData) {
  return request('/tickets', {
    method: 'POST',
    body: formData,
  });
}

export async function adminLogin(email, senha) {
  return request('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
}

export async function getDashboard(token) {
  return request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function validarCompra(token, ticketId) {
  return request(`/admin/tickets/${ticketId}/aprovar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function validarPortaria(hash) {
  const token = localStorage.getItem('admin_token');
  return request(`/admin/validar/${hash}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
