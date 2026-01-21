import { EvolutionInstance, EvolutionWebhook, EvolutionSettings, EvolutionChatsResponse, EvolutionMessage, EvolutionSendTextParams, EvolutionSendMediaParams, EvolutionStats, Campaign, ActivityLog, ApiResponse, PaginatedResponse, EvolutionGroup } from '@/types/evolution';

class EvolutionAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Use Netlify function instead of direct API calls
    this.baseUrl = '/.netlify/functions/evolution-proxy';
    this.apiKey = ''; // Not needed anymore, handled server-side
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body as string) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
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

  // Group Management
  async getGroups(instanceName: string): Promise<ApiResponse<EvolutionGroup[]>> {
    const response = await this.request<{ success: boolean; data: EvolutionGroup[] }>(`/group/fetchAllGroups/${instanceName}?getParticipants=false`);
    if (response.status === 'success' && response.response) {
      return {
        status: 'success',
        response: response.response.data || response.response as unknown as EvolutionGroup[],
      };
    }
    return response as unknown as ApiResponse<EvolutionGroup[]>;
  }

  // Send Poll to Group
  async sendPoll(
    instanceName: string,
    params: {
      number: string;
      name: string;
      selectableCount: number;
      values: string[];
      mentionsEveryOne?: boolean;
    }
  ): Promise<ApiResponse<any>> {
    return this.request(`/message/sendPoll/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Update Group Subject (Name)
  async updateGroupSubject(
    instanceName: string,
    groupJid: string,
    subject: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/group/updateGroupSubject/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        groupJid,
        subject,
      }),
    });
  }

  // Send Message to Group
  async sendMessage(
    instanceName: string,
    params: {
      remoteJid: string;
      messageText: string;
      mentionsEveryOne?: boolean;
      linkPreview?: boolean;
    }
  ): Promise<ApiResponse<EvolutionMessage>> {
    return this.request(`/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number: params.remoteJid,
        text: params.messageText,
        options: {
          mentions: params.mentionsEveryOne ? { everyOne: true } : undefined,
          linkPreview: params.linkPreview,
        },
      }),
    });
  }

  // Send Media (Image/Video/Document) to Group
  async sendMediaToGroup(
    instanceName: string,
    params: {
      remoteJid: string;
      mediaType: 'image' | 'video' | 'document';
      media: string; // base64 or URL
      caption?: string;
      fileName?: string;
      mimetype?: string;
      mentionsEveryOne?: boolean;
    }
  ): Promise<ApiResponse<EvolutionMessage>> {
    // Build the request body based on Evolution API format
    const body: Record<string, any> = {
      number: params.remoteJid,
      mediatype: params.mediaType,
      media: params.media,
    };

    if (params.caption) {
      body.caption = params.caption;
    }

    if (params.fileName) {
      body.fileName = params.fileName;
    }

    if (params.mimetype) {
      body.mimetype = params.mimetype;
    }

    // Add mentions if needed
    if (params.mentionsEveryOne) {
      body.mentionsEveryOne = true;
    }

    return this.request(`/message/sendMedia/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
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