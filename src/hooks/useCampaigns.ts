import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  campaignService,
  metricsService,
  optOutService,
  Campaign,
  CampaignInput,
  GlobalMetrics,
  SentLeadExtended,
  ContactRanking,
  OptOutContact,
} from "@/services/supabase";

// =============================================================================
// CAMPAIGNS HOOKS
// =============================================================================

export function useCampaigns(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['campaigns', limit, offset],
    queryFn: () => campaignService.getCampaigns(limit, offset),
    staleTime: 30000,
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => id ? campaignService.getCampaign(id) : null,
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaign: CampaignInput) => campaignService.createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Campaign> }) =>
      campaignService.updateCampaign(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// =============================================================================
// METRICS HOOKS
// =============================================================================

export function useGlobalMetrics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['global-metrics', startDate, endDate],
    queryFn: () => metricsService.getGlobalMetrics(startDate, endDate),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });
}

export function useCampaignMetrics(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['campaign-metrics', campaignId],
    queryFn: () => campaignId ? metricsService.getCampaignMetrics(campaignId) : null,
    enabled: !!campaignId,
    staleTime: 30000,
  });
}

export function useCampaignContacts(campaignId?: string, limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['campaign-contacts', campaignId, limit, offset],
    queryFn: () => metricsService.getCampaignContacts(campaignId, limit, offset),
    staleTime: 30000,
  });
}

export function useTopEngagedContacts(limit = 10) {
  return useQuery({
    queryKey: ['top-engaged-contacts', limit],
    queryFn: () => metricsService.getTopEngagedContacts(limit),
    staleTime: 60000,
  });
}

export function useOptOutContacts(limit = 20) {
  return useQuery({
    queryKey: ['optout-contacts', limit],
    queryFn: () => metricsService.getOptOutContacts(limit),
    staleTime: 60000,
  });
}

export function useAllSentLeads(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['all-sent-leads', limit, offset],
    queryFn: () => metricsService.getAllSentLeads(limit, offset),
    staleTime: 30000,
  });
}

// =============================================================================
// OPT-OUT HOOKS
// =============================================================================

export function useOptOutList(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['optout-list', limit, offset],
    queryFn: () => optOutService.getOptOutList(limit, offset),
    staleTime: 60000,
  });
}

export function useAddToOptOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contact: Omit<OptOutContact, 'id' | 'created_at'>) =>
      optOutService.addToOptOut(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optout-list'] });
      queryClient.invalidateQueries({ queryKey: ['optout-contacts'] });
    },
  });
}

export function useRemoveFromOptOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => optOutService.removeFromOptOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optout-list'] });
      queryClient.invalidateQueries({ queryKey: ['optout-contacts'] });
    },
  });
}
