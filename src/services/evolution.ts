import { EvolutionInstance, EvolutionWebhook, EvolutionSettings, EvolutionChatsResponse, EvolutionMessage, EvolutionSendTextParams, EvolutionSendMediaParams, EvolutionStats, Campaign, ActivityLog, ApiResponse, PaginatedResponse } from '@/types/evolution';

class EvolutionAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080';
    this.apiKey = import.meta.env.VITE_EVOLUTION_API_KEY || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'success',
        response: data,
      };
    } catch (error) {
      console.error('Evolution API Error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Instance Management
  async getInstances(): Promise<ApiResponse<EvolutionInstance[]>> {
    return this.request('/instance/fetchInstances');
  }

  async createInstance(
    instanceName: string,
    number?: string,
    webhookUrl?: string,
    qrcode: boolean = true
  ): Promise<ApiResponse<EvolutionInstance>> {
    return this.request('/instance/createInstance', {
      method: 'POST',
      body: JSON.stringify({
        instanceName,
        number,
        qrcode,
        webhook: webhookUrl,
      }),
    });
  }

  async connectInstance(instanceName: string): Promise<ApiResponse<any>> {
    return this.request(`/instance/connect/${instanceName}`, {
      method: 'POST',
    });
  }

  async disconnectInstance(instanceName: string): Promise<ApiResponse<any>> {
    return this.request(`/instance/logout/${instanceName}`, {
      method: 'DELETE',
    });
  }

  async deleteInstance(instanceName: string): Promise<ApiResponse<any>> {
    return this.request(`/instance/delete/${instanceName}`, {
      method: 'DELETE',
    });
  }

  async getInstanceConnectionState(instanceName: string): Promise<ApiResponse<{ state: string; qrcode?: string }>> {
    return this.request(`/instance/connectionState/${instanceName}`);
  }

  async getQRCode(instanceName: string): Promise<ApiResponse<{ base64: string; asciiQR: string }>> {
    return this.request(`/instance/qrcode/${instanceName}`);
  }

  // Webhook Management
  async getWebhook(instanceName: string): Promise<ApiResponse<EvolutionWebhook>> {
    return this.request(`/webhook/find/${instanceName}`);
  }

  async updateWebhook(
    instanceName: string,
    webhook: EvolutionWebhook
  ): Promise<ApiResponse<any>> {
    return this.request(`/webhook/update/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  // Settings Management
  async getSettings(instanceName: string): Promise<ApiResponse<EvolutionSettings>> {
    return this.request(`/settings/find/${instanceName}`);
  }

  async updateSettings(
    instanceName: string,
    settings: EvolutionSettings
  ): Promise<ApiResponse<any>> {
    return this.request(`/settings/update/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // Chat Management
  async getChats(instanceName: string): Promise<ApiResponse<EvolutionChatsResponse>> {
    return this.request(`/chat/fetchChats/${instanceName}`);
  }

  async getChatMessages(
    instanceName: string,
    jid: string,
    limit: number = 100
  ): Promise<ApiResponse<EvolutionMessage[]>> {
    return this.request(`/chat/fetchMessages/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        remoteJid: jid,
        limit,
      }),
    });
  }

  // Message Management
  async sendTextMessage(
    instanceName: string,
    params: EvolutionSendTextParams
  ): Promise<ApiResponse<EvolutionMessage>> {
    return this.request(`/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async sendMediaMessage(
    instanceName: string,
    params: EvolutionSendMediaParams
  ): Promise<ApiResponse<EvolutionMessage>> {
    return this.request(`/message/sendMedia/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async sendMessageToMultiple(
    instanceName: string,
    numbers: string[],
    message: string,
    delay: number = 1000
  ): Promise<ApiResponse<EvolutionMessage[]>> {
    return this.request(`/message/sendTextMultiple/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        numbers,
        message,
        delay,
      }),
    });
  }

  // Campaign Management
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.request('/campaign/list');
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Campaign>> {
    return this.request('/campaign/create', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.request(`/campaign/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    });
  }

  async deleteCampaign(id: string): Promise<ApiResponse<any>> {
    return this.request(`/campaign/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async startCampaign(id: string): Promise<ApiResponse<any>> {
    return this.request(`/campaign/start/${id}`, {
      method: 'POST',
    });
  }

  async pauseCampaign(id: string): Promise<ApiResponse<any>> {
    return this.request(`/campaign/pause/${id}`, {
      method: 'POST',
    });
  }

  // Analytics and Stats
  async getStats(): Promise<ApiResponse<EvolutionStats>> {
    return this.request('/stats');
  }

  async getInstanceStats(instanceName: string): Promise<ApiResponse<any>> {
    return this.request(`/stats/instance/${instanceName}`);
  }

  // Activity Logs
  async getActivityLogs(limit: number = 50): Promise<ApiResponse<ActivityLog[]>> {
    return this.request(`/logs/activity?limit=${limit}`);
  }

  async getInstanceLogs(instanceName: string, limit: number = 50): Promise<ApiResponse<ActivityLog[]>> {
    return this.request(`/logs/instance/${instanceName}?limit=${limit}`);
  }

  // Phone Number Validation
  async validatePhoneNumber(number: string): Promise<ApiResponse<{ isValid: boolean; formatted: string }>> {
    return this.request('/utils/validateNumber', {
      method: 'POST',
      body: JSON.stringify({ number }),
    });
  }

  // File Upload
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; key: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set multipart/form-data headers
    });
  }
}

// Create singleton instance
export const evolutionAPI = new EvolutionAPI();
export default evolutionAPI;