import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3001,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  adminFrontendUrl: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5173',
  eventoData: process.env.EVENTO_DATA || '2026-06-15T18:00:00Z',
  ticketPreco: Number(process.env.TICKET_PRECO) || 5000,
  reservaHorasAntes: Number(process.env.RESERVA_HORAS_ANTES) || 48,
  iban: process.env.IBAN || 'AO06 0000 0000 0000 0000 0000 0',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@jogosolidario.ao',
  },
};
