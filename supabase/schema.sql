-- Jogo Solidário — Schema PostgreSQL (Supabase)
-- Executar no SQL Editor do Supabase

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Administradores do evento
CREATE TABLE IF NOT EXISTS administradores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usuários (compradores — sem login obrigatório)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

-- Tickets / Ingressos
CREATE TYPE ticket_tipo AS ENUM ('reserva', 'compra');
CREATE TYPE ticket_status AS ENUM (
  'reservado',
  'pendente',
  'aprovado',
  'expirado',
  'cancelado'
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  quantidade SMALLINT NOT NULL CHECK (quantidade >= 1 AND quantidade <= 4),
  tipo ticket_tipo NOT NULL,
  status ticket_status NOT NULL DEFAULT 'reservado',
  valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  hash_unico VARCHAR(64) UNIQUE,
  comprovante_url TEXT,
  utilizado BOOLEAN NOT NULL DEFAULT false,
  utilizado_em TIMESTAMPTZ,
  validado_por UUID REFERENCES administradores(id),
  reserva_expira_em TIMESTAMPTZ,
  evento_data TIMESTAMPTZ NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_hash ON tickets (hash_unico);
CREATE INDEX IF NOT EXISTS idx_tickets_usuario ON tickets (usuario_id);

-- Trigger: atualizar updated_at
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_administradores_updated
  BEFORE UPDATE ON administradores
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_tickets_updated
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- RLS (ajustar políticas conforme ambiente)
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para service role (backend usa service key)
-- Em produção, restringir via Supabase service role apenas no servidor

-- Storage bucket para comprovantes (criar no dashboard Supabase)
-- Nome sugerido: comprovantes
-- Política: upload autenticado via backend

-- View para dashboard admin
CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'aprovado') AS total_vendidos,
  COUNT(*) FILTER (WHERE status = 'reservado') AS total_reservas,
  COALESCE(SUM(valor_total) FILTER (WHERE status = 'aprovado'), 0) AS valor_arrecadado,
  COUNT(*) FILTER (WHERE status = 'pendente') AS compras_pendentes
FROM tickets;
