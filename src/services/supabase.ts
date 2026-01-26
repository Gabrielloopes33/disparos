// Using Netlify function proxy for secure API calls
const SUPABASE_PROXY_URL = '/.netlify/functions/supabase-proxy';

async function supabaseRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null; count?: number }> {
  try {
    const clientHeaders =
      options.headers && !(options.headers instanceof Headers)
        ? options.headers
        : undefined;
    const response = await fetch(SUPABASE_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        method: options.method || 'GET',
        body: options.body ? JSON.parse(options.body as string) : undefined,
        headers: clientHeaders,
      }),
    });

    const rawText = await response.text();
    const parsed = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      const errorMessage = parsed?.error || `HTTP error! status: ${response.status}`;
      return { data: null, error: new Error(errorMessage) };
    }

    return { data: parsed.data ?? null, error: null, count: parsed.count };
  } catch (error) {
    console.error('Supabase request error:', error);
    return { data: null, error: error as Error };
  }
}

// Types for dispatch queue - matching Supabase table structure
export interface QueueLead {
  id?: string;
  created_at?: string;
  name?: string;
  email?: string;
  ddi?: number;
  phone?: number;
  complete_phone?: string;
  organization_name?: string;
  tags?: string;
  status?: string;
  stage?: string;
  value?: string;
  user_email?: string;
  user_name?: string;
  origin?: string;
  valid_phone?: boolean;
  segmento_de_mercado?: string;
  faturamento?: string;
  instagram_da_empresa?: string;
  // Allow any other fields from the table
  [key: string]: any;
}

export interface SentLead extends QueueLead {
  "ULTIMA MENSAGEM ENVIADA"?: string;
}

export interface QueueStats {
  pending: number;
  sent: number;
  total: number;
}

// Queue Operations
export const queueService = {
  // Get all leads in queue
  async getQueue(limit = 100, offset = 0): Promise<{ data: QueueLead[]; count: number }> {
    const { data, error, count } = await supabaseRequest<QueueLead[]>(
      `/import_clint_01?select=*&order=created_at.desc&offset=${offset}&limit=${limit}`
    );

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get sent leads
  async getSentLeads(limit = 100, offset = 0): Promise<{ data: SentLead[]; count: number }> {
    const { data, error, count } = await supabaseRequest<SentLead[]>(
      `/import_clint_jafoi?select=*&order=created_at.desc&offset=${offset}&limit=${limit}`
    );

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get queue stats
  async getStats(): Promise<QueueStats> {
    const [queueResult, sentResult] = await Promise.all([
      supabaseRequest<QueueLead[]>(`/import_clint_01?select=id`),
      supabaseRequest<SentLead[]>(`/import_clint_jafoi?select=id`),
    ]);

    const pending = queueResult.count || queueResult.data?.length || 0;
    const sent = sentResult.count || sentResult.data?.length || 0;

    return {
      pending,
      sent,
      total: pending + sent,
    };
  },

  // Add single lead to queue
  async addLead(lead: Omit<QueueLead, 'id' | 'created_at'>): Promise<QueueLead> {
    const completePhone = `${lead.ddi}${lead.phone}`;
    const { data, error } = await supabaseRequest<QueueLead[]>(
      `/import_clint_01?select=*`,
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...lead, complete_phone: completePhone }),
      }
    );

    if (error) throw error;
    return data?.[0] as QueueLead;
  },

  // Add multiple leads to queue (bulk import)
  async addLeads(leads: Omit<QueueLead, 'id' | 'created_at'>[]): Promise<{ inserted: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize).map(lead => ({
        ...lead,
        complete_phone: `${lead.ddi}${lead.phone}`,
      }));

      const { data, error } = await supabaseRequest<QueueLead[]>(
        `/import_clint_01`,
        {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(batch),
        }
      );

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        inserted += data?.length || batch.length;
      }
    }

    return { inserted, errors };
  },

  // Remove lead from queue
  async removeLead(id: string): Promise<void> {
    const { error } = await supabaseRequest(
      `/import_clint_01?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );

    if (error) throw error;
  },

  // Remove multiple leads from queue
  async removeLeads(ids: string[]): Promise<void> {
    const encodedIds = ids.map(id => `"${id}"`).join(',');
    const { error } = await supabaseRequest(
      `/import_clint_01?id=in.(${encodedIds})`,
      { method: 'DELETE' }
    );

    if (error) throw error;
  },

  // Clear entire queue
  async clearQueue(): Promise<void> {
    const { error } = await supabaseRequest(
      `/import_clint_01?id=neq.0`,
      { method: 'DELETE' }
    );

    if (error) throw error;
  },

  // Search leads in queue
  async searchQueue(query: string): Promise<QueueLead[]> {
    const { data, error } = await supabaseRequest<QueueLead[]>(
      `/import_clint_01?select=*&or=(name.ilike.*${query}*,email.ilike.*${query}*,phone.ilike.*${query}*)&limit=50`
    );

    if (error) throw error;
    return data || [];
  },

  // Check if phone already exists in queue or sent
  async checkPhoneExists(phone: string): Promise<{ inQueue: boolean; alreadySent: boolean }> {
    const [queueResult, sentResult] = await Promise.all([
      supabaseRequest<QueueLead[]>(`/import_clint_01?select=id&complete_phone=eq.${phone}&limit=1`),
      supabaseRequest<SentLead[]>(`/import_clint_jafoi?select=id&complete_phone=eq.${phone}&limit=1`),
    ]);

    return {
      inQueue: (queueResult.data?.length || 0) > 0,
      alreadySent: (sentResult.data?.length || 0) > 0,
    };
  },
};

// Types for scheduled dispatches
export interface ScheduledDispatch {
  id?: string;
  created_at?: string;
  instance_name: string;
  scheduled_for: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message: string;
  media_type?: string | null;
  media_base64?: string | null;
  media_filename?: string | null;
  media_mimetype?: string | null;
  mention_everyone: boolean;
  groups: { id: string; name: string }[];
  total_groups: number;
  sent_count?: number;
  error_count?: number;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface ScheduledDispatchInput {
  instance_name: string;
  scheduled_for: string;
  message: string;
  media_type?: string | null;
  media_base64?: string | null;
  media_filename?: string | null;
  media_mimetype?: string | null;
  mention_everyone: boolean;
  groups: { id: string; name: string }[];
}

// Scheduled Dispatches Operations
export const scheduledDispatchService = {
  // Get all scheduled dispatches
  async getScheduledDispatches(limit = 50, offset = 0): Promise<{ data: ScheduledDispatch[]; count: number }> {
    const { data, error, count } = await supabaseRequest<ScheduledDispatch[]>(
      `/scheduled_dispatches?select=*&order=scheduled_for.asc&offset=${offset}&limit=${limit}`
    );

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get pending dispatches (for execution)
  async getPendingDispatches(): Promise<ScheduledDispatch[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabaseRequest<ScheduledDispatch[]>(
      `/scheduled_dispatches?select=*&status=eq.pending&scheduled_for=lte.${now}&order=scheduled_for.asc`
    );

    if (error) throw error;
    return data || [];
  },

  // Get upcoming dispatches
  async getUpcomingDispatches(): Promise<ScheduledDispatch[]> {
    const { data, error } = await supabaseRequest<ScheduledDispatch[]>(
      `/scheduled_dispatches?select=*&status=eq.pending&order=scheduled_for.asc&limit=20`
    );

    if (error) throw error;
    return data || [];
  },

  // Create a new scheduled dispatch
  async createScheduledDispatch(dispatch: ScheduledDispatchInput): Promise<ScheduledDispatch> {
    const payload = {
      ...dispatch,
      status: 'pending',
      total_groups: dispatch.groups.length,
      sent_count: 0,
      error_count: 0,
    };

    const { data, error } = await supabaseRequest<ScheduledDispatch[]>(
      `/scheduled_dispatches?select=*`,
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      }
    );

    if (error) throw error;
    return data?.[0] as ScheduledDispatch;
  },

  // Update dispatch status
  async updateDispatchStatus(
    id: string,
    status: ScheduledDispatch['status'],
    updates?: Partial<ScheduledDispatch>
  ): Promise<void> {
    const payload = {
      status,
      ...updates,
      ...(status === 'completed' || status === 'failed' ? { completed_at: new Date().toISOString() } : {}),
    };

    const { error } = await supabaseRequest(
      `/scheduled_dispatches?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );

    if (error) throw error;
  },

  // Cancel a scheduled dispatch
  async cancelDispatch(id: string): Promise<void> {
    await this.updateDispatchStatus(id, 'cancelled');
  },

  // Delete a scheduled dispatch
  async deleteDispatch(id: string): Promise<void> {
    const { error } = await supabaseRequest(
      `/scheduled_dispatches?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );

    if (error) throw error;
  },

  // Update progress during execution
  async updateProgress(id: string, sentCount: number, errorCount: number): Promise<void> {
    const { error } = await supabaseRequest(
      `/scheduled_dispatches?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ sent_count: sentCount, error_count: errorCount }),
      }
    );

    if (error) throw error;
  },
};

// =============================================================================
// CAMPAIGNS SERVICE
// =============================================================================

export interface Campaign {
  id: string;
  created_at: string;
  name: string;
  tema?: string;
  objetivo?: string;
  data_evento?: string;
  link?: string;
  detalhes?: string;
  message_template?: string;
  templates_json?: any;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  total_sent: number;
  delivered_count: number;
  read_count: number;
  positive_interaction_count: number;
  opt_out_count: number;
  link_click_count: number;
  started_at?: string;
  completed_at?: string;
  instance_name?: string;
  workflow_execution_id?: string;
}

export interface CampaignInput {
  name: string;
  tema?: string;
  objetivo?: string;
  data_evento?: string;
  link?: string;
  detalhes?: string;
  message_template?: string;
  templates_json?: any;
  instance_name?: string;
}

export const campaignService = {
  // Get all campaigns
  async getCampaigns(limit = 50, offset = 0): Promise<{ data: Campaign[]; count: number }> {
    const { data, error, count } = await supabaseRequest<Campaign[]>(
      `/campaigns?select=*&order=created_at.desc&offset=${offset}&limit=${limit}`
    );

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get single campaign by ID
  async getCampaign(id: string): Promise<Campaign | null> {
    const { data, error } = await supabaseRequest<Campaign[]>(
      `/campaigns?id=eq.${encodeURIComponent(id)}&limit=1`
    );

    if (error) throw error;
    return data?.[0] || null;
  },

  // Create a new campaign
  async createCampaign(campaign: CampaignInput): Promise<Campaign> {
    const payload = {
      ...campaign,
      status: 'draft',
      total_sent: 0,
      delivered_count: 0,
      read_count: 0,
      positive_interaction_count: 0,
      opt_out_count: 0,
      link_click_count: 0,
    };

    const { data, error } = await supabaseRequest<Campaign[]>(
      `/campaigns?select=*`,
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      }
    );

    if (error) throw error;
    return data?.[0] as Campaign;
  },

  // Update campaign
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    const { error } = await supabaseRequest(
      `/campaigns?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );

    if (error) throw error;
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabaseRequest(
      `/campaigns?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );

    if (error) throw error;
  },
};

// =============================================================================
// SENT LEADS / MESSAGE LOGS SERVICE (import_clint_jafoi)
// =============================================================================

export interface SentLeadExtended extends SentLead {
  campaign_id?: string;
  campaign_name?: string;
  evolution_message_id?: string;
  delivery_status?: 'sent' | 'delivered' | 'read' | 'failed';
  interaction_type?: 'none' | 'reply' | 'positive_reply' | 'opt-out' | 'click';
  status_updated_at?: string;
  sent_at?: string;
}

// Helper to get message sent from lead
export function getMessageSent(lead: SentLeadExtended): string | undefined {
  return lead["ULTIMA MENSAGEM ENVIADA"] || undefined;
}

export interface GlobalMetrics {
  totalSent: number;
  delivered: number;
  read: number;
  positiveInteractions: number;
  optOuts: number;
  linkClicks: number;
  totalCampaigns: number;
  failed: number;
}

export interface ContactRanking {
  complete_phone: string;
  name?: string;
  total_messages: number;
  read_count: number;
  reply_count: number;
  positive_count: number;
  last_message_sent?: string;
  last_sent_at?: string;
}

export const metricsService = {
  // Get global metrics (all campaigns)
  async getGlobalMetrics(startDate?: string, endDate?: string): Promise<GlobalMetrics> {
    let query = `/import_clint_jafoi?select=delivery_status,interaction_type`;

    if (startDate) {
      query += `&sent_at=gte.${startDate}`;
    }
    if (endDate) {
      query += `&sent_at=lte.${endDate}`;
    }

    const { data, error } = await supabaseRequest<SentLeadExtended[]>(query);

    if (error) throw error;

    const leads = data || [];

    // Calculate metrics
    const metrics: GlobalMetrics = {
      totalSent: leads.length,
      delivered: leads.filter(l => l.delivery_status === 'delivered' || l.delivery_status === 'read').length,
      read: leads.filter(l => l.delivery_status === 'read').length,
      positiveInteractions: leads.filter(l => l.interaction_type === 'positive_reply').length,
      optOuts: leads.filter(l => l.interaction_type === 'opt-out').length,
      linkClicks: leads.filter(l => l.interaction_type === 'click').length,
      failed: leads.filter(l => l.delivery_status === 'failed').length,
      totalCampaigns: new Set(leads.map(l => l.campaign_id).filter(Boolean)).size || 1,
    };

    return metrics;
  },

  // Get metrics for a specific campaign
  async getCampaignMetrics(campaignId: string): Promise<GlobalMetrics> {
    const { data, error } = await supabaseRequest<SentLeadExtended[]>(
      `/import_clint_jafoi?select=delivery_status,interaction_type&campaign_id=eq.${encodeURIComponent(campaignId)}`
    );

    if (error) throw error;

    const leads = data || [];

    return {
      totalSent: leads.length,
      delivered: leads.filter(l => l.delivery_status === 'delivered' || l.delivery_status === 'read').length,
      read: leads.filter(l => l.delivery_status === 'read').length,
      positiveInteractions: leads.filter(l => l.interaction_type === 'positive_reply').length,
      optOuts: leads.filter(l => l.interaction_type === 'opt-out').length,
      linkClicks: leads.filter(l => l.interaction_type === 'click').length,
      failed: leads.filter(l => l.delivery_status === 'failed').length,
      totalCampaigns: 1,
    };
  },

  // Get sent leads for a campaign (with message content)
  async getCampaignContacts(
    campaignId?: string,
    limit = 100,
    offset = 0
  ): Promise<{ data: SentLeadExtended[]; count: number }> {
    let query = `/import_clint_jafoi?select=*&order=sent_at.desc&offset=${offset}&limit=${limit}`;

    if (campaignId) {
      query = `/import_clint_jafoi?select=*&campaign_id=eq.${encodeURIComponent(campaignId)}&order=sent_at.desc&offset=${offset}&limit=${limit}`;
    }

    const { data, error, count } = await supabaseRequest<SentLeadExtended[]>(query);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get top engaged contacts (ranking)
  async getTopEngagedContacts(limit = 10): Promise<ContactRanking[]> {
    // Get all sent leads and aggregate by phone
    const { data, error } = await supabaseRequest<SentLeadExtended[]>(
      `/import_clint_jafoi?select=complete_phone,name,delivery_status,interaction_type,"ULTIMA MENSAGEM ENVIADA",sent_at&order=sent_at.desc`
    );

    if (error) throw error;

    const leads = data || [];

    // Aggregate by phone number
    const contactMap = new Map<string, ContactRanking>();

    for (const lead of leads) {
      const phone = lead.complete_phone || '';
      if (!phone) continue;

      const existing = contactMap.get(phone) || {
        complete_phone: phone,
        name: lead.name,
        total_messages: 0,
        read_count: 0,
        reply_count: 0,
        positive_count: 0,
        last_message_sent: undefined,
        last_sent_at: undefined,
      };

      existing.total_messages++;
      if (lead.delivery_status === 'read') existing.read_count++;
      if (lead.interaction_type === 'reply' || lead.interaction_type === 'positive_reply') existing.reply_count++;
      if (lead.interaction_type === 'positive_reply') existing.positive_count++;

      // Keep first (most recent due to order)
      if (!existing.last_message_sent) {
        existing.last_message_sent = lead["ULTIMA MENSAGEM ENVIADA"];
        existing.last_sent_at = lead.sent_at;
      }

      contactMap.set(phone, existing);
    }

    // Sort by engagement score (positive > replies > reads > total)
    const ranked = Array.from(contactMap.values())
      .map(c => ({
        ...c,
        score: c.positive_count * 10 + c.reply_count * 5 + c.read_count * 2 + c.total_messages,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked;
  },

  // Get opt-out contacts
  async getOptOutContacts(limit = 20): Promise<SentLeadExtended[]> {
    const { data, error } = await supabaseRequest<SentLeadExtended[]>(
      `/import_clint_jafoi?select=*&interaction_type=eq.opt-out&order=status_updated_at.desc&limit=${limit}`
    );

    if (error) throw error;
    return data || [];
  },

  // Get all sent leads (for global contacts table)
  async getAllSentLeads(limit = 100, offset = 0): Promise<{ data: SentLeadExtended[]; count: number }> {
    const { data, error, count } = await supabaseRequest<SentLeadExtended[]>(
      `/import_clint_jafoi?select=*&order=sent_at.desc&offset=${offset}&limit=${limit}`
    );

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },
};

// =============================================================================
// OPT-OUT SERVICE
// =============================================================================

export interface OptOutContact {
  id: string;
  created_at: string;
  complete_phone: string;
  name?: string;
  last_campaign_id?: string;
  last_campaign_name?: string;
  reason?: string;
  original_message?: string;
}

export const optOutService = {
  // Get all opt-out contacts
  async getOptOutList(limit = 100, offset = 0): Promise<{ data: OptOutContact[]; count: number }> {
    const { data, error, count } = await supabaseRequest<OptOutContact[]>(
      `/contacts_optout?select=*&order=created_at.desc&offset=${offset}&limit=${limit}`
    );

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Check if phone is in opt-out list
  async isOptedOut(phone: string): Promise<boolean> {
    const { data, error } = await supabaseRequest<OptOutContact[]>(
      `/contacts_optout?select=id&complete_phone=eq.${encodeURIComponent(phone)}&limit=1`
    );

    if (error) throw error;
    return (data?.length || 0) > 0;
  },

  // Add contact to opt-out list
  async addToOptOut(contact: Omit<OptOutContact, 'id' | 'created_at'>): Promise<OptOutContact> {
    const { data, error } = await supabaseRequest<OptOutContact[]>(
      `/contacts_optout?select=*`,
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(contact),
      }
    );

    if (error) throw error;
    return data?.[0] as OptOutContact;
  },

  // Remove from opt-out list
  async removeFromOptOut(id: string): Promise<void> {
    const { error } = await supabaseRequest(
      `/contacts_optout?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );

    if (error) throw error;
  },
};
