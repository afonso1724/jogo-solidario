# Jogo Solidário — Reserva e Venda de Ingressos

Sistema completo de reserva e venda de ingressos para evento solidário.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide React
- **Backend:** Node.js + Express (Render)
- **Dados:** Supabase (PostgreSQL + Storage)

## Estrutura

```
jogo_solidario/
├── frontend/          # SPA React
├── backend/           # API Express
└── supabase/          # schema.sql
```

## Configuração

### 1. Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. Executar `supabase/schema.sql` no SQL Editor
3. Criar bucket `comprovantes` (Storage)
4. Copiar URL e chaves para `.env`

### 2. Backend (`backend/.env`)

```env
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
ADMIN_FRONTEND_URL=http://localhost:5173
EVENTO_DATA=2026-06-15T18:00:00Z
TICKET_PRECO=5000
RESERVA_HORAS_ANTES=48
IBAN=AO06 0000 0000 0000 0000 0000 0
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@jogosolidario.ao
```

### 3. Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
VITE_EVENTO_DATA=2026-06-15T18:00:00Z
```

## Desenvolvimento

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Deploy

- **Frontend:** Vercel / Netlify / Render Static
- **Backend:** Render Web Service
- **DB:** Supabase (já hospedado)
