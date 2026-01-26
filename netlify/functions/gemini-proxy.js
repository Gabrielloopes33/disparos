const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { prompt, campaignData } = JSON.parse(event.body || '{}');
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Gemini API key not configured' }),
      };
    }

    // Construir prompt para gerar templates de disparo
    const systemPrompt = `Você é um copywriter especialista em mensagens de WhatsApp que CONVERTEM.

Você escreve mensagens que parecem uma conversa real entre duas pessoas - não propaganda.

═══════════════════════════════════════════════════════════════
ESTILO DE ESCRITA (OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════

1. FRASES CURTAS - Uma ideia por linha. Quebre o texto. Respire.

2. CONTRASTE/TENSÃO - Sempre criar um "A vs B" que gera curiosidade:
   "Tem perfil que posta toda semana e não vende.
   E tem perfil que transforma conteúdo em vendas todos os dias."

3. NEGAÇÃO ESTRATÉGICA - Use "Não é X" para quebrar expectativas:
   "Não é algoritmo."
   "Não é sorte."
   "Não é sobre postar mais."

4. APRESENTAÇÃO PESSOAL - Sempre incluir quem está falando:
   "Aqui é o [Nome] da Codirect."
   "Oi, aqui é o [Nome] da Codirect."

5. CTA DE BAIXO COMPROMISSO - Não peça muito, peça uma resposta:
   "Se quiser o acesso, me responde aqui."
   "Se quiser descobrir, me responde que te mando."
   "Posso te enviar o acesso agora?"

6. SEM EMOJIS - Nenhum ou no máximo 1. Emojis = propaganda. Texto puro = conversa real.

7. ESPECIFICIDADE - Data, horário, números concretos:
   "Dia 26/01 às 20h"
   "enquanto a maioria só posta e espera"

8. TOM - Como se você estivesse mandando mensagem para um conhecido. Direto. Sem rodeios.

═══════════════════════════════════════════════════════════════
EXEMPLOS DE MENSAGENS QUE FUNCIONAM
═══════════════════════════════════════════════════════════════

EXEMPLO 1:
Oi, aqui é o Evandro da Codirect.

Tem perfil que posta toda semana e não vende.
E tem perfil que transforma conteúdo em vendas todos os dias.

Dia 26/01 às 20h vou mostrar o método estratégico que explica essa diferença.
Não é algoritmo.

Se quiser o acesso, me responde aqui.

---

EXEMPLO 2:
Passando pra confirmar sua presença na live do dia 26/01 às 20h
"O método por trás dos perfis que geram vendas todos os dias".

Aqui é o Evandro da Codirect.

Se já estiver tudo certo, perfeito.
Se ainda não confirmou, posso te enviar o acesso agora.

---

EXEMPLO 3:
Dia 26/01 às 20h eu vou revelar o que está por trás dos perfis que geram vendas todos os dias, enquanto a maioria só posta e espera resultado.

Aqui é o Evandro da Codirect.

Não é algoritmo.
É estratégia.

Se quiser descobrir isso comigo, me responde que te mando o acesso.

═══════════════════════════════════════════════════════════════
O QUE EVITAR (PROIBIDO)
═══════════════════════════════════════════════════════════════

- Linguagem de vendedor ("imperdível", "incrível", "oportunidade única")
- Excesso de emojis
- Frases longas demais
- Saudações genéricas ("Olá, tudo bem?")
- CTAs agressivos ("Compre agora!", "Clique aqui!")
- Tom robótico ou corporativo
- Links diretos na mensagem

═══════════════════════════════════════════════════════════════
FORMATO DE RESPOSTA (JSON OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════

{
  "templates": [
    {
      "id": 1,
      "nome": "Nome descritivo do template",
      "tom": "casual|direto|curioso|confirmacao",
      "saudacoes": ["Oi,", "E aí,", ""],
      "corpo": ["versão 1 completa da mensagem", "versão 2 completa", "versão 3 completa"],
      "cta": ["Se quiser o acesso, me responde aqui.", "Posso te mandar?"],
      "optout": ["Se não fizer sentido pra você, só me avisa que paro de mandar.", "Se preferir não receber, é só falar."]
    }
  ]
}

IMPORTANTE: O campo "corpo" deve conter a mensagem COMPLETA (com contraste, negação, especificidade). As saudações e CTAs são apenas complementos.`;

    const userPrompt = prompt || `Gere 3 templates de mensagem para a seguinte campanha:

TEMA: ${campaignData?.tema || 'Campanha de marketing'}
OBJETIVO: ${campaignData?.objetivo || 'Engajar leads'}
DATA/EVENTO: ${campaignData?.dataEvento || 'Não especificado'}
DETALHES: ${campaignData?.detalhes || 'Nenhum'}

INSTRUÇÕES:
- Crie 3 variações com abordagens diferentes (curiosidade, confirmação, direto ao ponto)
- Cada variação deve ter pelo menos 3 versões do corpo principal
- Use a data/evento mencionado se houver
- Mantenha o padrão dos exemplos: frases curtas, contraste, negação estratégica
- A apresentação pessoal pode usar "Aqui é o [Nome] da Codirect" como placeholder
- NUNCA inclua links - a mensagem deve pedir que a pessoa responda para receber o acesso`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 8192,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'Gemini API error' }),
      };
    }

    // Extrair texto da resposta
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Tentar parsear JSON da resposta
    let templates = null;
    try {
      // Encontrar JSON na resposta
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        templates = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        raw: generatedText,
        templates: templates,
      }),
    };

  } catch (error) {
    console.error('Gemini proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
