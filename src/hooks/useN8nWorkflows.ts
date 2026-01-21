import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { n8nAPI } from '@/services/n8n';

// Get all workflows
export function useWorkflows() {
  return useQuery({
    queryKey: ['n8n-workflows'],
    queryFn: async () => {
      const response = await n8nAPI.getWorkflows();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Get single workflow
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['n8n-workflow', id],
    queryFn: async () => {
      const response = await n8nAPI.getWorkflow(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!id,
  });
}

// Activate workflow
export function useActivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.activateWorkflow(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n-workflows'] });
    },
  });
}

// Deactivate workflow
export function useDeactivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.deactivateWorkflow(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n-workflows'] });
    },
  });
}

// Get executions
export function useExecutions(limit = 50) {
  return useQuery({
    queryKey: ['n8n-executions', limit],
    queryFn: async () => {
      const response = await n8nAPI.getExecutions(limit);
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Get workflow executions
export function useWorkflowExecutions(workflowId: string, limit = 50) {
  return useQuery({
    queryKey: ['n8n-workflow-executions', workflowId, limit],
    queryFn: async () => {
      const response = await n8nAPI.getWorkflowExecutions(workflowId, limit);
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    enabled: !!workflowId,
    refetchInterval: 5000,
  });
}

// Stop execution
export function useStopExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.stopExecution(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n-executions'] });
      queryClient.invalidateQueries({ queryKey: ['n8n-workflow-executions'] });
    },
  });
}

// Retry execution
export function useRetryExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.retryExecution(id);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n-executions'] });
      queryClient.invalidateQueries({ queryKey: ['n8n-workflow-executions'] });
    },
  });
}

// Get execution stats
export function useExecutionStats() {
  return useQuery({
    queryKey: ['n8n-stats'],
    queryFn: async () => {
      const response = await n8nAPI.getExecutionStats();
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Health check
export function useN8nHealth() {
  return useQuery({
    queryKey: ['n8n-health'],
    queryFn: async () => {
      const response = await n8nAPI.healthCheck();
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    refetchInterval: 15000,
    retry: 1,
  });
}
