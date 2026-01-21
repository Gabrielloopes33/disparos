// Using Netlify function proxy for secure API calls
const SUPABASE_PROXY_URL = '/.netlify/functions/supabase-proxy';

async function supabaseRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: Error | null; count?: number }> {
  try {
    const response = await fetch(SUPABASE_PROXY_URL, {
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
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { data: null, error: new Error(errorData.error || `HTTP error! status: ${response.status}`) };
    }

    const result = await response.json();
    return { data: result.data, error: null, count: result.count };
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
