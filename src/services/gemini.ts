const GEMINI_PROXY_URL = '/.netlify/functions/gemini-proxy';

export interface CampaignData {
  tema: string;
  objetivo: string;
  dataEvento?: string;
  link?: string;
  detalhes?: string;
}

export interface TemplateVariation {
  id: number;
  nome: string;
  tom: 'casual' | 'formal' | 'urgente' | 'curioso';
  saudacoes: string[];
  corpo: string[];
  cta: string[];
  optout: string[];
}

export interface GeneratedTemplates {
  templates: TemplateVariation[];
}

export interface GeminiResponse {
  success: boolean;
  raw: string;
  templates: GeneratedTemplates | null;
}

class GeminiService {
  async generateTemplates(campaignData: CampaignData): Promise<GeminiResponse> {
    try {
      const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini service error:', error);
      throw error;
    }
  }

  async generateCustom(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini service error:', error);
      throw error;
    }
  }

  // Gera uma mensagem final combinando partes aleatórias do template
  generateMessage(template: TemplateVariation, nome: string): string {
    const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const saudacao = getRandom(template.saudacoes);
    const corpo = getRandom(template.corpo);
    const cta = getRandom(template.cta);
    const optout = getRandom(template.optout);

    // Substituir {nome} pelo nome real
    const mensagem = `${saudacao} ${nome}!\n\n${corpo}\n\n${cta}\n\n${optout}`;
    return mensagem.replace(/\{nome\}/gi, nome);
  }

  // Gera preview de todas as combinações possíveis
  generatePreviews(template: TemplateVariation, nome: string = 'João'): string[] {
    const previews: string[] = [];

    // Gerar algumas combinações de exemplo
    for (let i = 0; i < Math.min(3, template.corpo.length); i++) {
      const saudacao = template.saudacoes[i % template.saudacoes.length];
      const corpo = template.corpo[i];
      const cta = template.cta[i % template.cta.length];
      const optout = template.optout[i % template.optout.length];

      const mensagem = `${saudacao} ${nome}!\n\n${corpo}\n\n${cta}\n\n${optout}`;
      previews.push(mensagem.replace(/\{nome\}/gi, nome));
    }

    return previews;
  }
}

export const geminiService = new GeminiService();
export default geminiService;
