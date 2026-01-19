# Evolution n8n Manager - Integração com Dados Reais

## 🚀 Como Conectar com suas APIs

Este projeto está agora totalmente integrado com a **Evolution API** e **n8n** para exibir dados em tempo real.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

1. **n8n** rodando (geralmente na porta `5678`)
2. **Evolution API** rodando (geralmente na porta `8080`)
3. Tokens e chaves de acesso das APIs

---

## ⚙️ Configuração Passo a Passo

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# API Configuration
VITE_N8N_API_URL=http://localhost:5678
VITE_N8N_API_TOKEN=seu_token_aqui
VITE_EVOLUTION_API_URL=http://localhost:8080
VITE_EVOLUTION_API_KEY=sua_chave_aqui
```

### 2. Obter Token da API n8n

1. Acesse sua instância n8n (http://localhost:5678)
2. Vá em **Configurações > Usuários**
3. Clique no seu usuário > **Gerar Token**
4. Copie o token gerado

### 3. Obter Chave da Evolution API

1. Acesse seu servidor Evolution
2. Verifique o arquivo de configuração ou ambiente
3. Localize a variável `APIKEY` ou configure uma nova
4. Copie a chave

---

## 🌐 Como Usar a Interface

### Dashboard com Dados Reais

Após configurar, o dashboard exibirá:

- **Instâncias WhatsApp**: Status reais das conexões
- **Mensagens**: Estatísticas de envio do dia
- **Taxa de Sucesso**: Calculada com base em erros/total
- **Execuções n8n**: Workflows e automações rodando

### Gerenciamento de Instâncias

- **Status em tempo real**: Conectado/Desconectando/Desconectado
- **QR Code**: Escaneie diretamente pela interface
- **Actions**: Conectar, desconectar, excluir instâncias

### Logs de Atividade

- **Tempo real**: Atualizações automáticas a cada 10 segundos
- **Filtrado**: Por instância e tipo de ação
- **Detalhado**: Timestamps e metadados completos

---

## 📡 Endpoints da API

### Evolution API Integration

A aplicação se conecta automaticamente aos seguintes endpoints:

- `GET /instance/fetchInstances` - Listar instâncias
- `POST /instance/connect/{name}` - Conectar instância
- `DELETE /instance/logout/{name}` - Desconectar instância
- `GET /instance/qrcode/{name}` - Obter QR Code
- `GET /stats` - Estatísticas gerais
- `GET /logs/activity` - Logs de atividades

### n8n API Integration

Endpoints utilizados:

- `GET /rest/workflows` - Listar workflows
- `GET /rest/executions` - Listar execuções
- `GET /healthz` - Health check
- `GET /rest/users` - Gerenciar usuários
- `POST /rest/workflows` - Criar workflows

---

## 🔧 Recursos Disponíveis

### Dashboard
- ✅ Estatísticas em tempo real
- ✅ Status das APIs
- ✅ Logs de atividades recentes
- ✅ Preview das instâncias

### Instâncias
- ✅ Listagem completa
- ✅ QR Code viewer
- ✅ Conectar/Desconectar
- ✅ Excluir instâncias

### Configurações
- ✅ Teste de conexão
- ✅ Salvar credenciais
- ✅ Validação de APIs
- ✅ Status indicators

---

## 🔄 Refresh Automático

- **Estatísticas**: A cada 15 segundos
- **Instâncias**: A cada 30 segundos  
- **Logs**: A cada 10 segundos
- **Execuções**: A cada 15 segundos

---

## 🐛 Troubleshooting

### Falha na Conexão n8n

1. Verifique se n8n está rodando: `http://localhost:5678`
2. Confirme o token da API
3. Verifique CORS no n8n

### Falha na Conexão Evolution

1. Confirme se Evolution está rodando: `http://localhost:8080`
2. Verifique a API Key configurada
3. Teste manualmente: `curl http://localhost:8080/instance/fetchInstances`

### Dados Não Aparecem

1. Reinicie a aplicação após alterar .env
2. Abra o console do navegador (F12) para verificar erros
3. Verifique os logs de rede na aba Network

---

## 📱 Exemplo de Uso

### Criar Nova Instância

```javascript
// Através da API:
POST http://localhost:8080/instance/createInstance
{
  "instanceName": "Marketing-Q1",
  "qrcode": true,
  "webhook": "http://localhost:5678/webhook/whatsapp"
}
```

### Enviar Mensagem

```javascript
// Através da API:
POST http://localhost:8080/message/sendText/Marketing-Q1
{
  "number": "5531998765432",
  "text": "Olá! Mensagem de teste."
}
```

---

## 🔐 Segurança

- **Tokens**: Nunca compartilhe seus tokens de API
- **HTTPS**: Use HTTPS em produção
- **Firewall**: Configure firewall adequadamente
- **Ambiente**: Mantenha .env seguro e fora do versionamento

---

## 📈 Monitoramento

A aplicação monitora:

- ✅ Status das APIs (health checks)
- ✅ Performance (tempo de resposta)
- ✅ Taxa de sucesso (mensagens/workflows)
- ✅ Logs de erros e warnings

---

## 🚀 Próximos Passos

1. **Autenticação 2FA**: Implementar login seguro
2. **WebSocket**: Atualizações em tempo real
3. **Dashboard Avançado**: Mais métricas e gráficos
4. **Mobile App**: Versão mobile nativa

---

## 📞 Suporte

Se precisar de ajuda:

1. Verifique os logs no console do navegador
2. Confirme suas configurações de API
3. Consulte a documentação oficial:
   - [Evolution API](https://doc.evolution-api.com/)
   - [n8n](https://docs.n8n.io/)

---

**🎉 Parabéns!** Sua aplicação agora está totalmente integrada com dados reais do WhatsApp e n8n!