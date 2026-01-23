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
    const systemPrompt = `Você é um especialista em copywriting para WhatsApp marketing.
Sua tarefa é gerar variações de mensagens para campanhas de disparo em massa.

REGRAS IMPORTANTES:
1. Mensagens devem ser curtas e diretas (máximo 500 caracteres cada)
2. Usar linguagem natural e conversacional
3. Variar saudações, tons e CTAs para evitar detecção de spam
4. SEMPRE incluir opção de opt-out no final
5. Personalizar com {nome} onde apropriado
6. Usar emojis com moderação (máximo 2-3 por mensagem)
7. NÃO incluir links diretamente - pedir permissão primeiro

FORMATO DE RESPOSTA (JSON):
{
  "templates": [
    {
      "id": 1,
      "nome": "Nome descritivo do template",
      "tom": "casual|formal|urgente|curioso",
      "saudacoes": ["Oi", "Olá", "E aí"],
      "corpo": ["versão 1 do corpo", "versão 2 do corpo", "versão 3 do corpo"],
      "cta": ["CTA versão 1", "CTA versão 2"],
      "optout": ["texto opt-out 1", "texto opt-out 2"]
    }
  ]
}`;

    const userPrompt = prompt || `Gere 3 templates de mensagem para a seguinte campanha:

Tema: ${campaignData?.tema || 'Campanha de marketing'}
Objetivo: ${campaignData?.objetivo || 'Engajar leads'}
Data/Evento: ${campaignData?.dataEvento || 'Não especificado'}
Link: ${campaignData?.link || 'Será enviado após confirmação de interesse'}
Detalhes adicionais: ${campaignData?.detalhes || 'Nenhum'}

Gere variações criativas mantendo o tom profissional mas amigável.`;

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
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
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
