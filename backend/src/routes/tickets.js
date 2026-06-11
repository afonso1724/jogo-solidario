import { Router } from 'express';
import multer from 'multer';
import { criarTicket } from '../services/tickets.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('comprovante'), async (req, res) => {
  try {
    const { nome, email, telefone, quantidade, tipo } = req.body;

    if (!nome || !email || !telefone || !tipo) {
      return res.status(400).json({ message: 'Campos obrigatórios em falta' });
    }

    const qty = Number(quantidade);
    if (!qty || qty < 1 || qty > 4) {
      return res.status(400).json({ message: 'Quantidade deve ser entre 1 e 4' });
    }

    if (!['reserva', 'compra'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    if (tipo === 'compra' && !req.file) {
      return res.status(400).json({ message: 'Comprovativo obrigatório para compra' });
    }

    const result = await criarTicket({
      nome,
      email,
      telefone,
      quantidade: qty,
      tipo,
      comprovanteFile: req.file,
    });

    res.status(201).json({
      message: result.message,
      referencia: result.referencia,
      ticketId: result.ticket.id,
    });
  } catch (err) {
    console.error('[tickets]', err);
    res.status(500).json({ message: err.message || 'Erro ao processar inscrição' });
  }
});

export default router;
