import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { n8nAPI } from '@/services/n8n';
import { N8nWorkflow, N8nExecution, N8nCredential, N8nUser, ExecutionStats, N8nApiResponse } from '@/types/n8n';

// Workflow Hooks
export function useWorkflows(options?: UseQueryOptions<N8nWorkflow[], Error>) {
  return useQuery({
    queryKey: ['n8n', 'workflows'],
    queryFn: async () => {
      const response = await n8nAPI.getWorkflows();
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch workflows');
      }
      return response.data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    ...options,
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['n8n', 'workflows', id],
    queryFn: async () => {
      const response = await n8nAPI.getWorkflow(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch workflow');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowData: any) => {
      const response = await n8nAPI.createWorkflow(workflowData);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create workflow');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows'] });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, workflowData }: { id: string; workflowData: any }) => {
      const response = await n8nAPI.updateWorkflow(id, workflowData);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update workflow');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows'] });
    },
  });
}

export function useActivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.activateWorkflow(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to activate workflow');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows', id] });
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows'] });
    },
  });
}

export function useDeactivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.deactivateWorkflow(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to deactivate workflow');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows', id] });
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows'] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.deleteWorkflow(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete workflow');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows'] });
    },
  });
}

// Execution Hooks
export function useExecutions(workflowId?: string) {
  return useQuery({
    queryKey: ['n8n', 'executions', workflowId],
    queryFn: async () => {
      const response = workflowId 
        ? await n8nAPI.getWorkflowExecutions(workflowId)
        : await n8nAPI.getExecutions();
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch executions');
      }
      return response.data || [];
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ['n8n', 'executions', id],
    queryFn: async () => {
      const response = await n8nAPI.getExecution(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch execution');
      }
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 5000, // Refresh frequently for running executions
  });
}

export function useRetryExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.retryExecution(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to retry execution');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'executions', id] });
      queryClient.invalidateQueries({ queryKey: ['n8n', 'executions'] });
    },
  });
}

export function useStopExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await n8nAPI.stopExecution(id);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to stop execution');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'executions', id] });
      queryClient.invalidateQueries({ queryKey: ['n8n', 'executions'] });
    },
  });
}

// Credential Hooks
export function useCredentials(type?: string) {
  return useQuery({
    queryKey: ['n8n', 'credentials', type],
    queryFn: async () => {
      const response = await n8nAPI.getCredentials(type);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch credentials');
      }
      return response.data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, name, data }: { type: string; name: string; data: any }) => {
      const response = await n8nAPI.createCredential(type, name, data);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create credential');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'credentials'] });
    },
  });
}

export function useTestCredential() {
  return useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      const response = await n8nAPI.testCredential(type, data);
      if (response.error) {
        throw new Error(response.error.message || 'Credential test failed');
      }
      return response.data;
    },
  });
}

// User Hooks
export function useUsers() {
  return useQuery({
    queryKey: ['n8n', 'users'],
    queryFn: async () => {
      const response = await n8nAPI.getUsers();
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch users');
      }
      return response.data || [];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<N8nUser>) => {
      const response = await n8nAPI.createUser(userData);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create user');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<N8nUser> }) => {
      const response = await n8nAPI.updateUser(id, userData);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update user');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['n8n', 'users'] });
    },
  });
}

// Stats Hooks
export function useN8nStats(options?: UseQueryOptions<ExecutionStats, Error>) {
  return useQuery({
    queryKey: ['n8n', 'stats'],
    queryFn: async () => {
      const response = await n8nAPI.getExecutionStats();
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch n8n stats');
      }
      return response.data || {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        activeWorkflows: 0,
        totalWorkflows: 0,
        executionsToday: 0,
        averageExecutionTime: 0,
      };
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    ...options,
  });
}

// System Info Hooks
export function useSystemInfo() {
  return useQuery({
    queryKey: ['n8n', 'system-info'],
    queryFn: async () => {
      const response = await n8nAPI.getSystemInfo();
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch system info');
      }
      return response.data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['n8n', 'health'],
    queryFn: async () => {
      const response = await n8nAPI.healthCheck();
      if (response.error) {
        throw new Error(response.error.message || 'Health check failed');
      }
      return response.data;
    },
    refetchInterval: 30000, // Check health every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
}

// WhatsApp Integration Hooks
export function useCreateWhatsAppWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      instanceName,
      operation,
      parameters,
    }: {
      instanceName: string;
      operation: any;
      parameters?: any;
    }) => {
      const response = await n8nAPI.createWhatsAppWorkflow(instanceName, operation, parameters);
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create WhatsApp workflow');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['n8n', 'workflows'] });
    },
  });
}