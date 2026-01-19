// Evolution API Integration Types
export interface EvolutionInstance {
  id: string;
  name: string;
  number?: string;
  profileName?: string;
  profilePictureUrl?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'opening' | 'close' | 'qr';
  qrcode?: {
    base64: string;
    asciiQR: string;
  };
  ownerJid?: string;
  battery?: number;
  plugged?: boolean;
  isLatestWebhook?: boolean;
  webhook?: string;
  token?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvolutionWebhook {
  url: string;
  enabled: boolean;
  events: string[];
  base64: boolean;
}

export interface EvolutionSettings {
  rejectCall: boolean;
  msgCall: string;
  groupsIgnore: boolean;
  alwaysOnline: boolean;
  readMessages: boolean;
  readStatus: boolean;
  syncFullHistory: boolean;
}

export interface EvolutionChatsResponse {
  chats: Chat[];
  total: number;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage?: {
    timestamp: number;
    key: {
      id: string;
    };
    message?: {
      conversation: string;
    };
  };
}

export interface EvolutionMessage {
  key: {
    id: string;
    remoteJid: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
    imageMessage?: {
      caption: string;
      directPath: string;
      mimetype: string;
    };
  };
  messageTimestamp: number;
  pushname?: string;
  participant?: string;
}

export interface EvolutionSendTextParams {
  number: string;
  text: string;
  delay?: number;
  presence?: 'composing' | 'recording';
  linkPreview?: boolean;
  quotedMessageId?: string;
}

export interface EvolutionSendMediaParams {
  number: string;
  mediatype: 'image' | 'video' | 'document' | 'audio';
  media: string | File;
  fileName?: string;
  caption?: string;
  delay?: number;
}

export interface EvolutionStats {
  totalMessages: number;
  totalChats: number;
  connectedInstances: number;
  totalInstances: number;
  messagesToday: number;
  errorsCount: number;
}

// WhatsApp Phone Number Types
export interface PhoneNumber {
  countryCode: string;
  number: string;
  formatted: string;
  isValid: boolean;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  instanceId: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  template?: MessageTemplate;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  type: 'text' | 'media' | 'button' | 'list';
  content: string;
  mediaType?: string;
  mediaUrl?: string;
  caption?: string;
  buttons?: TemplateButton[];
  list?: TemplateList;
}

export interface TemplateButton {
  id: string;
  text: string;
  type: 'reply' | 'url';
  url?: string;
}

export interface TemplateList {
  title: string;
  description: string;
  buttonText: string;
  sections: ListSection[];
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  response?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Log Types
export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action: string;
  description: string;
  instanceId?: string;
  instanceName?: string;
  metadata?: Record<string, any>;
  userId?: string;
}