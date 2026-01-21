import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService, QueueLead } from '@/services/supabase';

// Get queue leads
export function useQueue(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['dispatch-queue', limit, offset],
    queryFn: () => queueService.getQueue(limit, offset),
    refetchInterval: (query) => {
      // Stop auto-refetch if there's a server error (503, etc)
      if (query.state.error?.message?.includes('503')) return false;
      return 30000;
    },
    retry: (failureCount, error) => {
      // Don't retry on 503 errors - server is down
      if (error?.message?.includes('503')) return false;
      return failureCount < 2;
    },
    retryDelay: 5000,
  });
}

// Get sent leads
export function useSentLeads(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['dispatch-sent', limit, offset],
    queryFn: () => queueService.getSentLeads(limit, offset),
    refetchInterval: (query) => {
      if (query.state.error?.message?.includes('503')) return false;
      return 30000;
    },
    retry: (failureCount, error) => {
      if (error?.message?.includes('503')) return false;
      return failureCount < 2;
    },
    retryDelay: 5000,
  });
}

// Get queue stats
export function useQueueStats() {
  return useQuery({
    queryKey: ['dispatch-stats'],
    queryFn: () => queueService.getStats(),
    refetchInterval: (query) => {
      if (query.state.error?.message?.includes('503')) return false;
      return 10000;
    },
    retry: (failureCount, error) => {
      if (error?.message?.includes('503')) return false;
      return failureCount < 2;
    },
    retryDelay: 5000,
  });
}

// Add single lead
export function useAddLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lead: Omit<QueueLead, 'id' | 'created_at'>) => queueService.addLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-stats'] });
    },
  });
}

// Add multiple leads (bulk import)
export function useAddLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leads: Omit<QueueLead, 'id' | 'created_at'>[]) => queueService.addLeads(leads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-stats'] });
    },
  });
}

// Remove single lead
export function useRemoveLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => queueService.removeLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-stats'] });
    },
  });
}

// Remove multiple leads
export function useRemoveLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => queueService.removeLeads(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-stats'] });
    },
  });
}

// Clear entire queue
export function useClearQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => queueService.clearQueue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-stats'] });
    },
  });
}

// Search queue
export function useSearchQueue(query: string) {
  return useQuery({
    queryKey: ['dispatch-queue-search', query],
    queryFn: () => queueService.searchQueue(query),
    enabled: query.length >= 2,
  });
}

// Check if phone exists
export function useCheckPhone() {
  return useMutation({
    mutationFn: (phone: string) => queueService.checkPhoneExists(phone),
  });
}
