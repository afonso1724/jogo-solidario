import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getSupabase } from '../lib/supabase.js';
import { authAdmin } from '../middleware/auth.js';
import { aprovarTicket, validarNaPortaria, expirarReservasAntigas } from '../services/tickets.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'E-mail e senha obrigatórios' });
    }

    const supabase = getSupabase();
    const { data: admin, error } = await supabase
      .from('administradores')
      .select('*')
      .eq('email', email)
      .eq('ativo', true)
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(senha, admin.senha_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nome: admin.nome },
      config.jwtSecret,
      { expiresIn: '12h' }
    );

    res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } });
  } catch (err) {
    console.error('[admin/login]', err);
    res.status(500).json({ message: 'Erro no login' });
  }
});

router.get('/dashboard', authAdmin, async (req, res) => {
  try {
    await expirarReservasAntigas();

    const supabase = getSupabase();

    const { data: statsRow } = await supabase.from('vw_dashboard_stats').select('*').single();

    const { data: transacoes, error } = await supabase
      .from('tickets')
      .select('*, usuario:usuarios(nome, email, telefone)')
      .order('criado_em', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    res.json({
      stats: statsRow || {
        total_vendidos: 0,
        total_reservas: 0,
        valor_arrecadado: 0,
        compras_pendentes: 0,
      },
      transacoes: transacoes || [],
    });
  } catch (err) {
    console.error('[admin/dashboard]', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/tickets/:id/aprovar', authAdmin, async (req, res) => {
  try {
    const ticket = await aprovarTicket(req.params.id, req.admin.id);
    res.json({
      message: 'Compra validada. PDF com QR Code enviado por e-mail.',
      ticket,
    });
  } catch (err) {
    console.error('[admin/aprovar]', err);
    res.status(400).json({ message: err.message });
  }
});

router.post('/validar/:hash', authAdmin, async (req, res) => {
  try {
    const result = await validarNaPortaria(req.params.hash, req.admin.id);
    res.status(result.ok ? 200 : 403).json(result);
  } catch (err) {
    console.error('[admin/validar]', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

export default router;
