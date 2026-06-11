/**
 * Criar primeiro administrador:
 * node scripts/seed-admin.js admin@exemplo.ao senha123 "Nome Admin"
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws'; // Importa o suporte a WebSocket para o Node 20
import 'dotenv/config';

const [email, senha, nome = 'Administrador'] = process.argv.slice(2);

if (!email || !senha) {
  console.error('Uso: node scripts/seed-admin.js <email> <senha> [nome]');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || "https://kwbcbapabhjyuchvlift.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3YmNiYXBhYmhqeXVjaHZsaWZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE5NDk4NywiZXhwIjoyMDk2NzcwOTg3fQ.lkoACg9vVA9SwGTfEve82brx0LbPUmI0lrcjxKtkpx8";

// Inicializa o cliente injetando o transporte do WebSocket requisitado pelo erro
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  try {
    console.log('Gerando hash bcrypt...');
    const senha_hash = await bcrypt.hash(senha, 12);

    console.log('Inserindo no Supabase...');
    const { data, error } = await supabase
      .from('administradores')
      .insert({ email, senha_hash, nome })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erro do Supabase:', error.message);
      process.exit(1);
    }

    console.log('🚀 Sucesso absoluto! Admin criado:', data ? data.email : email);
  } catch (err) {
    console.error('Erro inesperado:', err.message);
  }
}

run();