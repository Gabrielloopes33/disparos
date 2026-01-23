-- Script para criar a tabela de disparos agendados no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela scheduled_dispatches
CREATE TABLE IF NOT EXISTS scheduled_dispatches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Configuracoes do disparo
  instance_name TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

  -- Conteudo da mensagem
  message TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'document', NULL)),
  media_base64 TEXT,
  media_filename TEXT,
  media_mimetype TEXT,
  mention_everyone BOOLEAN DEFAULT true,

  -- Grupos destinatarios (armazenado como JSONB)
  groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_groups INTEGER NOT NULL DEFAULT 0,

  -- Progresso e resultado
  sent_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Criar indices para melhor performance
CREATE INDEX IF NOT EXISTS idx_scheduled_dispatches_status ON scheduled_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_dispatches_scheduled_for ON scheduled_dispatches(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_dispatches_status_scheduled ON scheduled_dispatches(status, scheduled_for);

-- Habilitar Row Level Security (RLS)
ALTER TABLE scheduled_dispatches ENABLE ROW LEVEL SECURITY;

-- Politica para permitir todas as operacoes (ajuste conforme necessario para seu caso de uso)
CREATE POLICY "Allow all operations on scheduled_dispatches" ON scheduled_dispatches
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentarios na tabela
COMMENT ON TABLE scheduled_dispatches IS 'Tabela para armazenar disparos agendados de mensagens WhatsApp';
COMMENT ON COLUMN scheduled_dispatches.instance_name IS 'Nome da instancia Evolution API';
COMMENT ON COLUMN scheduled_dispatches.scheduled_for IS 'Data/hora programada para execucao';
COMMENT ON COLUMN scheduled_dispatches.status IS 'Status: pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN scheduled_dispatches.groups IS 'Array JSON de grupos {id, name}';
COMMENT ON COLUMN scheduled_dispatches.mention_everyone IS 'Se deve mencionar todos os participantes';
