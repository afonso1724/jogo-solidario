import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let client = null;

export function getSupabase() {
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.');
  }
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return client;
}
