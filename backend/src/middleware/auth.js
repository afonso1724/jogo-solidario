import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function authAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
