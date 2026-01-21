import { DispatchLog, DispatchTarget } from '@/types/evolution';

const STORAGE_KEY = 'dispatch_logs';

class DispatchLogsService {
  private getStoredLogs(): DispatchLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading dispatch logs from localStorage:', error);
      return [];
    }
  }

  private saveLogs(logs: DispatchLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving dispatch logs to localStorage:', error);
    }
  }

  getLogs(): DispatchLog[] {
    return this.getStoredLogs().sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  getLog(id: string): DispatchLog | undefined {
    return this.getStoredLogs().find(log => log.id === id);
  }

  createLog(params: {
    instanceName: string;
    type: 'groups' | 'contacts';
    message: string;
    targets: { id: string; name: string }[];
    mentionEveryone: boolean;
  }): DispatchLog {
    const now = new Date().toISOString();
    const log: DispatchLog = {
      id: `dispatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Disparo ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      instanceName: params.instanceName,
      type: params.type,
      message: params.message,
      targets: params.targets.map(t => ({
        id: t.id,
        name: t.name,
        status: 'pending' as const,
      })),
      totalTargets: params.targets.length,
      sentCount: 0,
      failedCount: 0,
      status: 'running',
      startedAt: now,
      mentionEveryone: params.mentionEveryone,
    };

    const logs = this.getStoredLogs();
    logs.push(log);
    this.saveLogs(logs);

    return log;
  }

  updateTargetStatus(
    logId: string,
    targetId: string,
    status: 'sent' | 'failed',
    error?: string
  ): DispatchLog | undefined {
    const logs = this.getStoredLogs();
    const logIndex = logs.findIndex(l => l.id === logId);

    if (logIndex === -1) return undefined;

    const log = logs[logIndex];
    const targetIndex = log.targets.findIndex(t => t.id === targetId);

    if (targetIndex === -1) return undefined;

    log.targets[targetIndex] = {
      ...log.targets[targetIndex],
      status,
      sentAt: new Date().toISOString(),
      error,
    };

    if (status === 'sent') {
      log.sentCount++;
    } else {
      log.failedCount++;
    }

    logs[logIndex] = log;
    this.saveLogs(logs);

    return log;
  }

  completeLog(logId: string, status: 'completed' | 'failed'): DispatchLog | undefined {
    const logs = this.getStoredLogs();
    const logIndex = logs.findIndex(l => l.id === logId);

    if (logIndex === -1) return undefined;

    logs[logIndex] = {
      ...logs[logIndex],
      status,
      completedAt: new Date().toISOString(),
    };

    this.saveLogs(logs);
    return logs[logIndex];
  }

  deleteLog(id: string): boolean {
    const logs = this.getStoredLogs();
    const filteredLogs = logs.filter(log => log.id !== id);

    if (filteredLogs.length === logs.length) {
      return false;
    }

    this.saveLogs(filteredLogs);
    return true;
  }

  clearAllLogs(): void {
    this.saveLogs([]);
  }

  // Get summary stats
  getStats() {
    const logs = this.getStoredLogs();
    const today = new Date().toDateString();

    const todayLogs = logs.filter(
      log => new Date(log.startedAt).toDateString() === today
    );

    return {
      totalDispatches: logs.length,
      totalMessagesSent: logs.reduce((sum, log) => sum + log.sentCount, 0),
      totalMessagesFailed: logs.reduce((sum, log) => sum + log.failedCount, 0),
      dispatchesToday: todayLogs.length,
      messagesSentToday: todayLogs.reduce((sum, log) => sum + log.sentCount, 0),
    };
  }
}

export const dispatchLogsService = new DispatchLogsService();
export default dispatchLogsService;
