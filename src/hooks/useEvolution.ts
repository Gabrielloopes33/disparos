import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { evolutionAPI } from '@/services/evolution';
import { EvolutionInstance, EvolutionWebhook, EvolutionSettings, EvolutionStats, Campaign, ActivityLog, ApiResponse } from '@/types/evolution';

// Instance Hooks
export function useInstances(options?: UseQueryOptions<EvolutionInstance[], Error>) {
  return useQuery({
    queryKey: ['evolution', 'instances'],
    queryFn: async () => {
      try {
        const response = await evolutionAPI.getInstances();
        if (response.status === 'error') {
          throw new Error(response.error || 'Failed to fetch instances');
        }
        return response.response || [];
      } catch (error) {
        // Fallback to empty array if API is not available
        console.warn('Evolution API not available, returning empty instances');
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Disable retries to avoid infinite loop
    ...options,
  });
}

export function useCreateInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      instanceName,
      number,
      webhookUrl,
    }: {
      instanceName: string;
      number?: string;
      webhookUrl?: string;
    }) => {
      const response = await evolutionAPI.createInstance(instanceName, number, webhookUrl);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to create instance');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'instances'] });
    },
  });
}

export function useConnectInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instanceName: string) => {
      const response = await evolutionAPI.connectInstance(instanceName);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to connect instance');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'instances'] });
    },
  });
}

export function useDisconnectInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instanceName: string) => {
      const response = await evolutionAPI.disconnectInstance(instanceName);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to disconnect instance');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'instances'] });
    },
  });
}

export function useDeleteInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instanceName: string) => {
      const response = await evolutionAPI.deleteInstance(instanceName);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to delete instance');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'instances'] });
    },
  });
}

export function useQRCode(instanceName: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['evolution', 'qrcode', instanceName],
    queryFn: async () => {
      const response = await evolutionAPI.getQRCode(instanceName);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to get QR code');
      }
      return response.response;
    },
    enabled,
    refetchInterval: 5000, // Refresh QR code every 5 seconds
  });
}

// Webhook Hooks
export function useWebhook(instanceName: string) {
  return useQuery({
    queryKey: ['evolution', 'webhook', instanceName],
    queryFn: async () => {
      const response = await evolutionAPI.getWebhook(instanceName);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to fetch webhook');
      }
      return response.response;
    },
    enabled: !!instanceName,
  });
}

export function useUpdateWebhook(instanceName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhook: EvolutionWebhook) => {
      const response = await evolutionAPI.updateWebhook(instanceName, webhook);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to update webhook');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'webhook', instanceName] });
    },
  });
}

// Settings Hooks
export function useSettings(instanceName: string) {
  return useQuery({
    queryKey: ['evolution', 'settings', instanceName],
    queryFn: async () => {
      const response = await evolutionAPI.getSettings(instanceName);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to fetch settings');
      }
      return response.response;
    },
    enabled: !!instanceName,
  });
}

export function useUpdateSettings(instanceName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: EvolutionSettings) => {
      const response = await evolutionAPI.updateSettings(instanceName, settings);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to update settings');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'settings', instanceName] });
    },
  });
}

// Stats Hook
export function useEvolutionStats(options?: UseQueryOptions<EvolutionStats, Error>) {
  return useQuery({
    queryKey: ['evolution', 'stats'],
    queryFn: async () => {
      try {
        const response = await evolutionAPI.getStats();
        if (response.status === 'error') {
          throw new Error(response.error || 'Failed to fetch stats');
        }
        return response.response || {
          totalMessages: 0,
          totalChats: 0,
          connectedInstances: 0,
          totalInstances: 0,
          messagesToday: 0,
          errorsCount: 0,
        };
      } catch (error) {
        // Fallback to default stats if API is not available
        console.warn('Evolution API not available, returning default stats');
        return {
          totalMessages: 0,
          totalChats: 0,
          connectedInstances: 0,
          totalInstances: 0,
          messagesToday: 0,
          errorsCount: 0,
        };
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    retry: false, // Disable retries to avoid infinite loop
    ...options,
  });
}

// Campaign Hooks
export function useCampaigns() {
  return useQuery({
    queryKey: ['evolution', 'campaigns'],
    queryFn: async () => {
      const response = await evolutionAPI.getCampaigns();
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to fetch campaigns');
      }
      return response.response || [];
    },
    refetchInterval: 30000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await evolutionAPI.createCampaign(campaign);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to create campaign');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'campaigns'] });
    },
  });
}

export function useStartCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await evolutionAPI.startCampaign(campaignId);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to start campaign');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'campaigns'] });
    },
  });
}

export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await evolutionAPI.pauseCampaign(campaignId);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to pause campaign');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await evolutionAPI.deleteCampaign(campaignId);
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to delete campaign');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'campaigns'] });
    },
  });
}

// Activity Logs Hooks
export function useActivityLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['evolution', 'logs', 'activity', limit],
    queryFn: async () => {
      try {
        const response = await evolutionAPI.getActivityLogs(limit);
        if (response.status === 'error') {
          throw new Error(response.error || 'Failed to fetch activity logs');
        }
        return response.response || [];
      } catch (error) {
        // Fallback to empty array if API is not available
        console.warn('Evolution API not available, returning empty logs');
        return [];
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: false, // Disable retries to avoid infinite loop
  });
}

// Message Hooks
export function useSendMessage(instanceName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      number,
      text,
      options,
    }: {
      number: string;
      text: string;
      options?: {
        delay?: number;
        presence?: 'composing' | 'recording';
        linkPreview?: boolean;
        quotedMessageId?: string;
      };
    }) => {
      const response = await evolutionAPI.sendTextMessage(instanceName, {
        number,
        text,
        ...options,
      });
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to send message');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'stats'] });
    },
  });
}

export function useSendMediaMessage(instanceName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      number,
      mediaType,
      media,
      caption,
    }: {
      number: string;
      mediaType: 'image' | 'video' | 'document' | 'audio';
      media: string | File;
      caption?: string;
    }) => {
      const response = await evolutionAPI.sendMediaMessage(instanceName, {
        number,
        mediatype: mediaType,
        media,
        caption,
      });
      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to send media message');
      }
      return response.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'stats'] });
    },
  });
}