import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import ticketsRouter from './routes/tickets.js';
import adminRouter from './routes/admin.js';
import { validarNaPortaria } from './services/tickets.js';

const app = express();
const allowedOrigins = [
  config.frontendUrl,
  'https://jogo-solidario.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'jogo-solidario-api' });
});

app.get('/api/config/public', (_req, res) => {
  res.json({
    iban: config.iban,
    ticketPreco: config.ticketPreco,
    eventoData: config.eventoData,
  });
});

app.get('/api/validar/:hash', async (req, res) => {
  try {
    const result = await validarNaPortaria(req.params.hash);
    res.status(result.ok ? 200 : 403).json(result);
  } catch (err) {
    console.error('[validar]', err);
    res.status(500).json({ ok: false, message: err.message || 'Erro ao validar ingresso' });
  }
});

app.use('/api/tickets', ticketsRouter);
app.use('/api/admin', adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(config.port, () => {
  console.log(`API Jogo Solidário em ${config.publicApiUrl}`);
});
