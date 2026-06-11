import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import ticketsRouter from './routes/tickets.js';
import adminRouter from './routes/admin.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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

app.use('/api/tickets', ticketsRouter);
app.use('/api/admin', adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(config.port, () => {
  console.log(`API Jogo Solidário em http://localhost:${config.port}`);
});
