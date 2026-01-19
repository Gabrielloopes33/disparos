// n8n API Integration Types
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  versionId: string;
  createdAt: string;
  updatedAt: string;
  homePage?: {
    id: string;
    name: string;
  };
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'waiting' | 'crashed' | 'unknown';
  startedAt: string;
  stoppedAt?: string;
  mode: 'manual' | 'trigger' | 'retry' | 'cli' | 'webhook' | 'retry_error' | 'integrated';
  data?: {
    resultData?: {
      runData?: Record<string, any>;
    };
  };
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>;
  accessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface N8nWebhook {
  id: string;
  name: string;
  workflowId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  responseMode: 'onReceived' | 'lastNode' | 'responseNode';
  responseCode?: number;
  responseHeaders?: Record<string, string>;
  responseData?: any;
  restartWebhook?: boolean;
  httpMethod?: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8nConnection {
  sourceNode: string;
  targetNode: string;
  sourceIndex?: number;
  targetIndex?: number;
}

export interface N8nWorkflowData {
  nodes: N8nNode[];
  connections: Record<string, N8nConnection[]>;
}

export interface N8nUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: 'owner' | 'member' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface N8nTag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Custom WhatsApp Node Types for n8n
export interface WhatsAppNodeParameters {
  instanceName: string;
  operation: 'sendMessage' | 'sendMedia' | 'getConnectionStatus' | 'getChats' | 'getMessages';
  number?: string;
  message?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
  mediaUrl?: string;
  caption?: string;
  delay?: number;
  webhookUrl?: string;
}

export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  activeWorkflows: number;
  totalWorkflows: number;
  executionsToday: number;
  averageExecutionTime: number;
}

// API Response Types
export interface N8nApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    httpCode?: number;
  };
}

export interface PaginatedN8nResponse<T> {
  data: T[];
  nextCursor?: string;
  limit: number;
}

// Trigger Types
export interface N8nTrigger {
  id: string;
  type: string;
  nodes: string[];
  active: boolean;
}