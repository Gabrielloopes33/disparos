# Documento de Implementacao - Dashboard de Campanhas WhatsApp
# Documento de Implementacao - Dashboard de Campanhas WhatsApp

## Resumo Executivo

Este documento detalha todas as implementacoes realizadas para melhorar o Dashboard de Campanhas WhatsApp, incluindo rastreamento de metricas, modelagem de dados, e integracao com Supabase.

---

## Status Geral: EM FINALIZACAO

### Etapas Concluidas: 5/6

| Etapa | Status | Descricao |
|-------|--------|-----------|
| 1. Componentes de Dashboard | ✅ Concluido | KPIs, Funil, Tabela de Contatos |
| 2. Metricas Gerais e Ranking | ✅ Concluido | Stats globais, filtros de data, ranking |
| 3. Exibicao de Mensagens | ✅ Concluido | Rows expansiveis com preview |
| 4. Selecao Multipla de Templates | ✅ Concluido | Array de templates na campanha |
| 5. Agendamento de Disparos | ✅ Concluido | UI + Supabase + n8n workflow |
| 6. Integracao com Dados Reais | ✅ Concluido | Hooks e services conectados |

---

## Etapa 1: Componentes do Dashboard

### Arquivos Criados/Modificados

#### `src/components/campaigns/CampaignMetrics.tsx`
- **Funcao**: Exibe 6 KPI cards com metricas da campanha
- **Metricas**: Total Enviados, Entregues, Lidos, Interacoes Positivas, Opt-outs, Cliques em Links
- **Features**: Calculo automatico de taxas (entrega, leitura, interacao)

#### `src/components/campaigns/CampaignFunnel.tsx`
- **Funcao**: Visualizacao em funil do processo de engajamento
- **Biblioteca**: Recharts (FunnelChart)
- **Etapas**: Enviados → Entregues → Lidos → Interagiram

#### `src/components/campaigns/CampaignContactsTable.tsx`
- **Funcao**: Tabela detalhada de contatos com status individual
- **Features**:
  - Busca por telefone/nome
  - Filtro por status (enviado, entregue, lido, falhou)
  - Filtro por tipo de interacao (nenhuma, respondeu, interesse, opt-out, clicou)
  - Paginacao
  - Rows expansiveis para ver mensagem enviada

#### `src/pages/CampaignDetails.tsx`
- **Funcao**: Pagina de detalhes da campanha
- **Rota**: `/campaigns/:id`
- **Componentes**: CampaignMetrics + CampaignFunnel + CampaignContactsTable

---

## Etapa 2: Metricas Gerais e Ranking

### Arquivos Criados/Modificados

#### `src/components/campaigns/GlobalCampaignStats.tsx`
- **Funcao**: Metricas consolidadas de todas as campanhas
- **Features**:
  - Filtro por periodo (Hoje, 7 dias, 30 dias, Mes, 90 dias, Todo periodo)
  - Seletor de calendario customizado
  - 8 KPI cards com dados agregados
  - Contagem de campanhas no periodo

#### `src/components/campaigns/ContactsRanking.tsx`
- **Funcao**: Ranking de contatos por engajamento
- **Tabs**:
  1. **Mais Engajados**: Ranking por score (respostas positivas, cliques, leituras)
  2. **Opt-outs**: Lista de contatos que pediram para sair
- **Features**: Icones de ranking (coroa, medalhas), score colorido, rows expansiveis

---

## Etapa 3: Exibicao de Mensagens

### Modificacoes

- **CampaignContactsTable**: Adicionado campo `messageSent` e rows expansiveis
- **ContactsRanking**: Adicionado campo `last_message_sent` com expansao
- **Interface ContactLog**: Campo `messageSent?: string`

### UX
- Icone de seta para expandir/colapsar
- Preview da mensagem em box estilizado
- Indicador visual de linha expandida

---

## Etapa 4: Selecao Multipla de Templates

### Arquivos Modificados

#### `src/components/campaigns/CampaignCreator.tsx`
- Mudanca de `selectedTemplate` (string) para `selectedTemplates` (array)
- Funcoes: `handleToggleTemplate()`, `handleSelectAll()`
- Exibicao de contador de templates selecionados
- Review step mostra todas variacoes selecionadas

#### `src/components/campaigns/TemplatePreview.tsx`
- Novo prop: `multiSelect?: boolean`
- Novo prop: `isSelected?: boolean`
- Checkbox visual no modo multiSelect
- Visual diferenciado para item selecionado

---

## Etapa 5: Agendamento de Disparos

### Arquivos Criados

#### `src/components/dispatch/ScheduledDispatchesList.tsx`
- Lista de disparos agendados
- Status: Pendente, Processando, Concluido, Falhou, Cancelado
- Acoes: Ver detalhes, Cancelar
- Countdown para proximos disparos

#### `supabase_scheduled_dispatches.sql`
```sql
CREATE TABLE scheduled_dispatches (
  id UUID PRIMARY KEY,
  instance_name TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  message TEXT NOT NULL,
  media_type TEXT,
  media_base64 TEXT,
  groups JSONB NOT NULL,
  total_groups INTEGER,
  sent_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP
);
```

#### `n8n_scheduled_dispatch_workflow.json`
- Workflow para executar disparos agendados
- Trigger: A cada 1 minuto
- Fluxo: Buscar pendentes → Processar → Enviar para grupos → Marcar concluido

### Modificacoes

#### `src/components/dispatch/DispatchForm.tsx`
- Checkbox "Agendar para depois"
- Seletores de data e hora
- Integracao com `scheduledDispatchService`

#### `src/services/supabase.ts`
- Interface `ScheduledDispatch`
- Service `scheduledDispatchService`:
  - `getScheduledDispatches()`
  - `createScheduledDispatch()`
  - `updateDispatchStatus()`
  - `cancelDispatch()`

---

## Etapa 6: Integracao com Dados Reais (Supabase)

### Schema do Banco de Dados

#### Tabela `import_clint_jafoi` (Atualizada)
**Colunas Removidas** (33 colunas nao utilizadas):
- value, lost_status, user_link, won_at, tempo_de_existencia, utm, id_rd_station...

**Colunas Adicionadas**:
```sql
campaign_id UUID                    -- ID da campanha
campaign_name TEXT                  -- Nome da campanha (denormalizado)
evolution_message_id TEXT           -- ID da Evolution API
delivery_status TEXT                -- 'sent', 'delivered', 'read', 'failed'
interaction_type TEXT               -- 'none', 'reply', 'positive_reply', 'opt-out', 'click'
status_updated_at TIMESTAMP         -- Ultima atualizacao via webhook
sent_at TIMESTAMP                   -- Data/hora do envio
```

#### Tabela `campaigns` (Nova)
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  tema TEXT,
  objetivo TEXT,
  message_template TEXT,
  templates_json JSONB,
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  total_sent INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  positive_interaction_count INTEGER DEFAULT 0,
  opt_out_count INTEGER DEFAULT 0,
  link_click_count INTEGER DEFAULT 0
);
```

#### Tabela `contacts_optout` (Nova)
```sql
CREATE TABLE contacts_optout (
  id UUID PRIMARY KEY,
  complete_phone TEXT UNIQUE NOT NULL,
  name TEXT,
  last_campaign_id UUID,
  last_campaign_name TEXT,
  reason TEXT,
  original_message TEXT
);
```

#### View `campaign_metrics`
```sql
CREATE VIEW campaign_metrics AS
SELECT
  campaign_id,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE delivery_status IN ('delivered', 'read')) as delivered_count,
  COUNT(*) FILTER (WHERE delivery_status = 'read') as read_count,
  COUNT(*) FILTER (WHERE interaction_type = 'positive_reply') as positive_interaction_count,
  COUNT(*) FILTER (WHERE interaction_type = 'opt-out') as opt_out_count
FROM import_clint_jafoi
GROUP BY campaign_id;
```

### Services e Hooks

#### `src/services/supabase.ts` - Novos Services

**campaignService**:
- `getCampaigns(limit, offset)` - Lista campanhas
- `getCampaign(id)` - Busca campanha por ID
- `createCampaign(input)` - Cria nova campanha
- `updateCampaign(id, updates)` - Atualiza campanha
- `deleteCampaign(id)` - Remove campanha

**metricsService**:
- `getGlobalMetrics(startDate?, endDate?)` - Metricas globais
- `getCampaignMetrics(campaignId)` - Metricas de uma campanha
- `getCampaignContacts(campaignId, limit, offset)` - Contatos da campanha
- `getTopEngagedContacts(limit)` - Ranking de engajamento
- `getOptOutContacts(limit)` - Contatos que fizeram opt-out
- `getAllSentLeads(limit, offset)` - Todos os leads enviados

**optOutService**:
- `getOptOutList(limit, offset)` - Lista de opt-outs
- `isOptedOut(phone)` - Verifica se telefone esta bloqueado
- `addToOptOut(contact)` - Adiciona ao opt-out
- `removeFromOptOut(id)` - Remove do opt-out

#### `src/hooks/useCampaigns.ts` - React Query Hooks

```typescript
// Campaigns
useCampaigns(limit, offset)
useCampaign(id)
useCreateCampaign()
useUpdateCampaign()
useDeleteCampaign()

// Metrics
useGlobalMetrics(startDate?, endDate?)
useCampaignMetrics(campaignId)
useCampaignContacts(campaignId, limit, offset)
useTopEngagedContacts(limit)
useOptOutContacts(limit)
useAllSentLeads(limit, offset)

// Opt-out
useOptOutList(limit, offset)
useAddToOptOut()
useRemoveFromOptOut()
```

### Componentes Atualizados para Dados Reais

| Componente | Hook Utilizado | Status |
|------------|----------------|--------|
| GlobalCampaignStats | useGlobalMetrics | ✅ |
| ContactsRanking | useTopEngagedContacts, useOptOutList | ✅ |
| CampaignList | useCampaigns, useDeleteCampaign, useUpdateCampaign | ✅ |
| CampaignDetails | useCampaign, useCampaignMetrics, useCampaignContacts | ✅ |

---

## Arquivos de Configuracao SQL

### `supabase_update_import_clint_jafoi.sql`
Script completo para:
1. Remover colunas nao utilizadas
2. Adicionar colunas de rastreamento
3. Criar indices para performance
4. Criar tabela campaigns
5. Criar tabela contacts_optout
6. Criar view campaign_metrics
7. Habilitar RLS

### `supabase_scheduled_dispatches.sql`
Script para criar tabela de agendamentos.

### `n8n_scheduled_dispatch_workflow.json`
Template de workflow n8n para executar disparos agendados.

---

## Proximos Passos (Opcional)

1. **Webhooks**: Implementar endpoints para receber MESSAGES_UPDATE e MESSAGES_UPSERT da Evolution API
2. **Triggers**: Criar triggers no Supabase para atualizar metricas consolidadas automaticamente
3. **Notificacoes**: Adicionar notificacoes quando campanha terminar ou tiver alto opt-out
4. **Exportacao**: Implementar exportacao de dados para CSV/Excel
5. **Graficos de Tendencia**: Adicionar graficos de evolucao ao longo do tempo

---

## Stack Tecnologica

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Graficos**: Recharts
- **Data Fetching**: TanStack React Query
- **Backend**: Supabase (PostgreSQL)
- **Automacao**: n8n
- **Mensageria**: Evolution API (WhatsApp)

---

## Estrutura de Arquivos Relevantes

```
src/
├── components/
│   └── campaigns/
│       ├── CampaignCreator.tsx      # Criador com multi-template
│       ├── CampaignFunnel.tsx       # Grafico de funil
│       ├── CampaignList.tsx         # Lista de campanhas
│       ├── CampaignMetrics.tsx      # KPI cards
│       ├── CampaignContactsTable.tsx # Tabela de contatos
│       ├── ContactsRanking.tsx      # Ranking de engajamento
│       ├── GlobalCampaignStats.tsx  # Metricas globais
│       └── TemplatePreview.tsx      # Preview com multiselect
│   └── dispatch/
│       ├── DispatchForm.tsx         # Form com agendamento
│       └── ScheduledDispatchesList.tsx # Lista de agendados
├── hooks/
│   └── useCampaigns.ts              # React Query hooks
├── services/
│   └── supabase.ts                  # Services e tipos
├── pages/
│   └── CampaignDetails.tsx          # Pagina de detalhes

SQL/
├── supabase_update_import_clint_jafoi.sql
├── supabase_scheduled_dispatches.sql
└── n8n_scheduled_dispatch_workflow.json
```

---

**Documento gerado em**: 26/01/2026
**Versao**: 1.0
