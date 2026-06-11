/**
 * Criar primeiro administrador:
 * node scripts/seed-admin.js admin@exemplo.ao senha123 "Nome Admin"
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const [email, senha, nome = 'Administrador'] = process.argv.slice(2);

if (!email || !senha) {
  console.error('Uso: node scripts/seed-admin.js <email> <senha> [nome]');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const senha_hash = await bcrypt.hash(senha, 12);

const { data, error } = await supabase
  .from('administradores')
  .insert({ email, senha_hash, nome })
  .select()
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log('Admin criado:', data.email);
