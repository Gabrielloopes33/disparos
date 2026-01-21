import { useState, useEffect, useCallback } from 'react';
import { dispatchLogsService } from '@/services/dispatchLogs';
import { DispatchLog } from '@/types/evolution';

export function useDispatchLogs() {
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLogs = useCallback(() => {
    setLogs(dispatchLogsService.getLogs());
  }, []);

  useEffect(() => {
    refreshLogs();
    setIsLoading(false);

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dispatch_logs') {
        refreshLogs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshLogs]);

  const createDispatch = useCallback((params: {
    instanceName: string;
    type: 'groups' | 'contacts';
    message: string;
    targets: { id: string; name: string }[];
    mentionEveryone: boolean;
  }) => {
    const log = dispatchLogsService.createLog(params);
    refreshLogs();
    return log;
  }, [refreshLogs]);

  const updateTarget = useCallback((
    logId: string,
    targetId: string,
    status: 'sent' | 'failed',
    error?: string
  ) => {
    const log = dispatchLogsService.updateTargetStatus(logId, targetId, status, error);
    refreshLogs();
    return log;
  }, [refreshLogs]);

  const completeDispatch = useCallback((logId: string, status: 'completed' | 'failed') => {
    const log = dispatchLogsService.completeLog(logId, status);
    refreshLogs();
    return log;
  }, [refreshLogs]);

  const deleteLog = useCallback((id: string) => {
    const success = dispatchLogsService.deleteLog(id);
    if (success) {
      refreshLogs();
    }
    return success;
  }, [refreshLogs]);

  const clearAllLogs = useCallback(() => {
    dispatchLogsService.clearAllLogs();
    refreshLogs();
  }, [refreshLogs]);

  const getStats = useCallback(() => {
    return dispatchLogsService.getStats();
  }, []);

  return {
    logs,
    isLoading,
    refreshLogs,
    createDispatch,
    updateTarget,
    completeDispatch,
    deleteLog,
    clearAllLogs,
    getStats,
  };
}

export function useDispatchLog(id: string) {
  const [log, setLog] = useState<DispatchLog | undefined>();

  useEffect(() => {
    setLog(dispatchLogsService.getLog(id));
  }, [id]);

  return log;
}
