-- =============================================================================
-- SCRIPT: Atualizar tabela import_clint_jafoi para ponto de controle completo
-- =============================================================================
-- IMPORTANTE: Faca backup antes de executar!
-- Execute cada secao separadamente se preferir mais seguranca
-- =============================================================================


-- =============================================================================
-- PARTE 1: REMOVER COLUNAS NAO UTILIZADAS
-- =============================================================================

ALTER TABLE import_clint_jafoi
DROP COLUMN IF EXISTS value,
DROP COLUMN IF EXISTS lost_status,
DROP COLUMN IF EXISTS user_link,
DROP COLUMN IF EXISTS won_at,
DROP COLUMN IF EXISTS tempo_de_existencia,
DROP COLUMN IF EXISTS utm,
DROP COLUMN IF EXISTS id_rd_station,
DROP COLUMN IF EXISTS vertical_cade,
DROP COLUMN IF EXISTS url_de_cadastro,
DROP COLUMN IF EXISTS vertical_cade_1,
DROP COLUMN IF EXISTS origem_da_conversao,
DROP COLUMN IF EXISTS ultima_conversao_no,
DROP COLUMN IF EXISTS contact_notes,
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS duplicate_phone,
DROP COLUMN IF EXISTS faturamento_3,
DROP COLUMN IF EXISTS abordagem_ig,
DROP COLUMN IF EXISTS "procedência",
DROP COLUMN IF EXISTS anotacoes_do_sdr,
DROP COLUMN IF EXISTS segment,
DROP COLUMN IF EXISTS tempo_de_existencia_1,
DROP COLUMN IF EXISTS mercado,
DROP COLUMN IF EXISTS instagram_da_empresa,
DROP COLUMN IF EXISTS link_publico_spotter,
DROP COLUMN IF EXISTS qual_seu_cargo_no_es,
DROP COLUMN IF EXISTS bonus,
DROP COLUMN IF EXISTS "transcrição",
DROP COLUMN IF EXISTS pre_vendedor,
DROP COLUMN IF EXISTS link_do_contrato,
DROP COLUMN IF EXISTS "plano contratado",
DROP COLUMN IF EXISTS aditivo_de_contrato,
DROP COLUMN IF EXISTS condicoes_de_pagamento,
DROP COLUMN IF EXISTS deal_notes,
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS user_id;


-- =============================================================================
-- PARTE 2: ADICIONAR NOVAS COLUNAS PARA RASTREAMENTO
-- =============================================================================

-- ID da campanha que enviou a mensagem
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- ID da mensagem retornado pela Evolution API (para rastrear status via webhook)
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS evolution_message_id TEXT;

-- Status de entrega da mensagem
-- Valores: 'sent', 'delivered', 'read', 'failed'
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent';

-- Tipo de interacao do contato
-- Valores: 'none', 'reply', 'positive_reply', 'opt-out', 'click'
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS interaction_type TEXT DEFAULT 'none';

-- Data/hora da ultima atualizacao de status
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Nome da campanha (para facilitar consultas sem JOIN)
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS campaign_name TEXT;

-- Data/hora do envio da mensagem
ALTER TABLE import_clint_jafoi
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- =============================================================================
-- PARTE 3: CRIAR INDICES PARA PERFORMANCE
-- =============================================================================

-- Indice para buscar por campanha
CREATE INDEX IF NOT EXISTS idx_jafoi_campaign_id
ON import_clint_jafoi(campaign_id);

-- Indice para buscar por status de entrega
CREATE INDEX IF NOT EXISTS idx_jafoi_delivery_status
ON import_clint_jafoi(delivery_status);

-- Indice para buscar por tipo de interacao
CREATE INDEX IF NOT EXISTS idx_jafoi_interaction_type
ON import_clint_jafoi(interaction_type);

-- Indice para buscar por evolution_message_id (usado pelos webhooks)
CREATE INDEX IF NOT EXISTS idx_jafoi_evolution_message_id
ON import_clint_jafoi(evolution_message_id);

-- Indice composto para metricas por campanha
CREATE INDEX IF NOT EXISTS idx_jafoi_campaign_status
ON import_clint_jafoi(campaign_id, delivery_status, interaction_type);


-- =============================================================================
-- PARTE 4: CRIAR TABELA DE CAMPANHAS (OPCIONAL MAS RECOMENDADO)
-- =============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Informacoes da campanha
  name TEXT NOT NULL,
  tema TEXT,
  objetivo TEXT,
  data_evento TEXT,
  link TEXT,
  detalhes TEXT,

  -- Template usado
  message_template TEXT,
  templates_json JSONB, -- Armazena todos os templates selecionados

  -- Status da campanha
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),

  -- Metricas consolidadas (atualizadas por trigger ou job)
  total_sent INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  positive_interaction_count INTEGER DEFAULT 0,
  opt_out_count INTEGER DEFAULT 0,
  link_click_count INTEGER DEFAULT 0,

  -- Datas
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Configuracoes
  instance_name TEXT,
  workflow_execution_id TEXT
);

-- Indice para buscar campanhas por status
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);


-- =============================================================================
-- PARTE 5: CRIAR TABELA DE OPT-OUTS (LISTA DE BLOQUEIO)
-- =============================================================================

CREATE TABLE IF NOT EXISTS contacts_optout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Dados do contato
  complete_phone TEXT UNIQUE NOT NULL,
  name TEXT,

  -- Contexto do opt-out
  last_campaign_id UUID,
  last_campaign_name TEXT,
  reason TEXT, -- 'parar', 'sair', 'spam', etc

  -- Mensagem original que gerou o opt-out
  original_message TEXT
);

-- Indice para buscar rapidamente se um telefone esta na lista
CREATE INDEX IF NOT EXISTS idx_optout_phone ON contacts_optout(complete_phone);


-- =============================================================================
-- PARTE 6: VIEW PARA METRICAS POR CAMPANHA
-- =============================================================================

CREATE OR REPLACE VIEW campaign_metrics AS
SELECT
  campaign_id,
  campaign_name,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE delivery_status = 'delivered' OR delivery_status = 'read') as delivered_count,
  COUNT(*) FILTER (WHERE delivery_status = 'read') as read_count,
  COUNT(*) FILTER (WHERE interaction_type = 'positive_reply') as positive_interaction_count,
  COUNT(*) FILTER (WHERE interaction_type = 'opt-out') as opt_out_count,
  COUNT(*) FILTER (WHERE interaction_type = 'click') as link_click_count,
  COUNT(*) FILTER (WHERE interaction_type = 'reply' OR interaction_type = 'positive_reply') as total_replies,
  COUNT(*) FILTER (WHERE delivery_status = 'failed') as failed_count,
  ROUND(
    (COUNT(*) FILTER (WHERE delivery_status IN ('delivered', 'read'))::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as delivery_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE delivery_status = 'read')::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE delivery_status IN ('delivered', 'read')), 0)) * 100,
    2
  ) as read_rate
FROM import_clint_jafoi
WHERE campaign_id IS NOT NULL
GROUP BY campaign_id, campaign_name;


-- =============================================================================
-- PARTE 7: HABILITAR RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- Campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);

-- Contacts optout
ALTER TABLE contacts_optout ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on contacts_optout" ON contacts_optout FOR ALL USING (true) WITH CHECK (true);


-- =============================================================================
-- COMENTARIOS PARA DOCUMENTACAO
-- =============================================================================

COMMENT ON COLUMN import_clint_jafoi.campaign_id IS 'ID da campanha que enviou esta mensagem';
COMMENT ON COLUMN import_clint_jafoi.evolution_message_id IS 'ID da mensagem da Evolution API para rastreamento de status';
COMMENT ON COLUMN import_clint_jafoi.delivery_status IS 'Status: sent, delivered, read, failed';
COMMENT ON COLUMN import_clint_jafoi.interaction_type IS 'Tipo: none, reply, positive_reply, opt-out, click';
COMMENT ON COLUMN import_clint_jafoi.status_updated_at IS 'Ultima atualizacao do status (via webhook)';

COMMENT ON TABLE campaigns IS 'Campanhas de disparo com metricas consolidadas';
COMMENT ON TABLE contacts_optout IS 'Lista de contatos que pediram para nao receber mais mensagens';
COMMENT ON VIEW campaign_metrics IS 'View com metricas calculadas por campanha';


-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
-- Apos executar, verifique se:
-- 1. As colunas antigas foram removidas
-- 2. As novas colunas foram adicionadas
-- 3. Os indices foram criados
-- 4. A tabela campaigns foi criada
-- 5. A tabela contacts_optout foi criada
-- 6. A view campaign_metrics esta funcionando
--
-- Teste a view com: SELECT * FROM campaign_metrics;
-- =============================================================================
