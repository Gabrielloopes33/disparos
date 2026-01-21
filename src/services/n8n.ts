import { 
  N8nWorkflow, 
  N8nExecution, 
  N8nCredential, 
  N8nWebhook, 
  N8nWorkflowData, 
  N8nUser, 
  N8nTag,
  N8nNode,
  N8nConnection,
  ExecutionStats,
  WhatsAppNodeParameters,
  N8nApiResponse,
  PaginatedN8nResponse
} from '@/types/n8n';

class N8nAPI {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    // Use Netlify function instead of direct API calls
    this.baseUrl = '/.netlify/functions/n8n-proxy';
    this.apiToken = ''; // Not needed anymore, handled server-side
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<N8nApiResponse<T>> {
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
      console.error('n8n API Error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Workflow Management
  async getWorkflows(limit: number = 100): Promise<N8nApiResponse<N8nWorkflow[]>> {
    const response = await this.request<{ data: N8nWorkflow[] }>(`/workflows?limit=${limit}`);
    if (response.error) return { error: response.error };
    return { data: response.data?.data || [] };
  }

  async getWorkflow(id: string): Promise<N8nApiResponse<N8nWorkflow>> {
    return this.request<N8nWorkflow>(`/workflows/${id}`);
  }

  async createWorkflow(workflowData: N8nWorkflowData): Promise<N8nApiResponse<N8nWorkflow>> {
    return this.request<N8nWorkflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: `WhatsApp Workflow ${Date.now()}`,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: false,
        tags: ['whatsapp'],
      }),
    });
  }

  async updateWorkflow(id: string, workflowData: N8nWorkflowData): Promise<N8nApiResponse<N8nWorkflow>> {
    return this.request<N8nWorkflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nodes: workflowData.nodes,
        connections: workflowData.connections,
      }),
    });
  }

  async activateWorkflow(id: string): Promise<N8nApiResponse<void>> {
    return this.request<void>(`/workflows/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateWorkflow(id: string): Promise<N8nApiResponse<void>> {
    return this.request<void>(`/workflows/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async deleteWorkflow(id: string): Promise<N8nApiResponse<void>> {
    return this.request<void>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Execution Management
  async getExecutions(limit: number = 50): Promise<N8nApiResponse<N8nExecution[]>> {
    const response = await this.request<{ data: N8nExecution[] }>(`/executions?limit=${limit}`);
    if (response.error) return { error: response.error };
    return { data: response.data?.data || [] };
  }

  async getWorkflowExecutions(workflowId: string, limit: number = 50): Promise<N8nApiResponse<N8nExecution[]>> {
    const response = await this.request<{ data: N8nExecution[] }>(`/executions?workflowId=${workflowId}&limit=${limit}`);
    if (response.error) return { error: response.error };
    return { data: response.data?.data || [] };
  }

  async getExecution(id: string): Promise<N8nApiResponse<N8nExecution>> {
    return this.request<N8nExecution>(`/executions/${id}`);
  }

  async retryExecution(id: string): Promise<N8nApiResponse<N8nExecution>> {
    return this.request<N8nExecution>(`/executions/${id}/retry`, {
      method: 'POST',
    });
  }

  async stopExecution(id: string): Promise<N8nApiResponse<void>> {
    return this.request<void>(`/executions/${id}/stop`, {
      method: 'POST',
    });
  }

  async deleteExecution(id: string): Promise<N8nApiResponse<void>> {
    return this.request<void>(`/executions/${id}`, {
      method: 'DELETE',
    });
  }

  // Credential Management
  async getCredentials(type?: string): Promise<N8nApiResponse<N8nCredential[]>> {
    const endpoint = type ? `/credentials?type=${type}` : '/credentials';
    return this.request<N8nCredential[]>(endpoint);
  }

  async createCredential(
    type: string,
    name: string,
    data: Record<string, any>
  ): Promise<N8nApiResponse<N8nCredential>> {
    return this.request<N8nCredential>('/credentials', {
      method: 'POST',
      body: JSON.stringify({
        name,
        type,
        data: {
          [type]: data,
        },
      }),
    });
  }

  async testCredential(
    type: string,
    data: Record<string, any>
  ): Promise<N8nApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>('/credentials/test', {
      method: 'POST',
      body: JSON.stringify({
        type,
        data: {
          [type]: data,
        },
      }),
    });
  }

  // Webhook Management
  async getWebhooks(workflowId: string): Promise<N8nApiResponse<N8nWebhook[]>> {
    return this.request<N8nWebhook[]>(`/webhooks?workflowId=${workflowId}`);
  }

  async createWebhook(webhookData: N8nWebhook): Promise<N8nApiResponse<N8nWebhook>> {
    return this.request<N8nWebhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async deleteWebhook(webhookId: string): Promise<N8nApiResponse<void>> {
    return this.request<void>(`/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  // User Management
  async getUsers(): Promise<N8nApiResponse<N8nUser[]>> {
    return this.request<N8nUser[]>('/users');
  }

  async createUser(userData: Partial<N8nUser>): Promise<N8nApiResponse<N8nUser>> {
    return this.request<N8nUser>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<N8nUser>): Promise<N8nApiResponse<N8nUser>> {
    return this.request<N8nUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Tag Management
  async getTags(): Promise<N8nApiResponse<N8nTag[]>> {
    return this.request<N8nTag[]>('/tags');
  }

  async createTag(name: string): Promise<N8nApiResponse<N8nTag>> {
    return this.request<N8nTag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // WhatsApp Integration Methods
  async createWhatsAppWorkflow(
    instanceName: string,
    operation: WhatsAppNodeParameters['operation'],
    parameters?: Partial<WhatsAppNodeParameters>
  ): Promise<N8nApiResponse<N8nWorkflow>> {
    const whatsappNode: N8nNode = {
      id: 'whatsapp-node-' + Date.now(),
      name: 'WhatsApp',
      type: 'n8n-nodes-base.evolutionApi',
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        instanceName,
        operation,
        ...parameters,
      },
    };

    // Add webhook trigger node if needed
    const webhookNode: N8nNode | null = operation === 'sendMessage' ? {
      id: 'webhook-trigger-' + Date.now(),
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [60, 300],
      parameters: {
        httpMethod: 'POST',
        path: `whatsapp-${Date.now()}`,
        responseMode: 'onReceived',
        options: {},
      },
    } : null;

    const nodes = webhookNode ? [webhookNode, whatsappNode] : [whatsappNode];
    const connections = webhookNode ? {
      [webhookNode.id]: [
        {
          sourceNode: webhookNode.id,
          targetNode: whatsappNode.id,
          sourceIndex: 0,
          targetIndex: 0,
        },
      ],
    } : {};

    return this.createWorkflow({ nodes, connections });
  }

  // Analytics and Stats
  async getExecutionStats(): Promise<N8nApiResponse<ExecutionStats>> {
    try {
      const executionsResponse = await this.getExecutions(1000);
      const workflowsResponse = await this.getWorkflows(1000);

      if (executionsResponse.error || workflowsResponse.error) {
        throw new Error('Failed to fetch data for stats');
      }

      const executions = executionsResponse.data || [];
      const workflows = workflowsResponse.data || [];

      const successfulExecutions = executions.filter(e => e.status === 'success').length;
      const failedExecutions = executions.filter(e => e.status === 'error').length;
      const activeWorkflows = workflows.filter(w => w.active).length;
      
      const today = new Date().toDateString();
      const executionsToday = executions.filter(e => 
        new Date(e.startedAt).toDateString() === today
      ).length;

      // Calculate average execution time
      const completedExecutions = executions.filter(e => e.stoppedAt);
      const totalTime = completedExecutions.reduce((sum, e) => {
        const start = new Date(e.startedAt).getTime();
        const end = new Date(e.stoppedAt!).getTime();
        return sum + (end - start);
      }, 0);
      const averageExecutionTime = completedExecutions.length > 0 ? totalTime / completedExecutions.length : 0;

      const stats: ExecutionStats = {
        totalExecutions: executions.length,
        successfulExecutions,
        failedExecutions,
        activeWorkflows,
        totalWorkflows: workflows.length,
        executionsToday,
        averageExecutionTime,
      };

      return { data: stats };
    } catch (error) {
      console.error('Error calculating execution stats:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to calculate stats',
        },
      };
    }
  }

  // System Info
  async getSystemInfo(): Promise<N8nApiResponse<any>> {
    return this.request('/system-info');
  }

  async healthCheck(): Promise<N8nApiResponse<{ status: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`);
      if (response.ok) {
        const data = await response.json();
        return { data: { status: data.status === 'ok' ? 'healthy' : data.status } };
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Health check failed',
        },
      };
    }
  }
}

// Create singleton instance
export const n8nAPI = new N8nAPI();
export default n8nAPI;