import { Smartphone, MessageSquare, CheckCircle, AlertTriangle, Activity, Clock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { MessagesChart } from "@/components/dashboard/MessagesChart";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { InstanceGrid } from "@/components/instances/InstanceGrid";
import { useEvolutionStats, useActivityLogs } from "@/hooks/useEvolution";
import { useN8nStats, useHealthCheck } from "@/hooks/useN8n";
import { useInstances } from "@/hooks/useEvolution";
import { EvolutionInstance } from "@/types/evolution";

const Dashboard = () => {
  const { data: evolutionStats, isLoading: evolutionLoading } = useEvolutionStats();
  const { data: n8nStats, isLoading: n8nLoading } = useN8nStats();
  const { data: health } = useHealthCheck();
  const { data: instances, isLoading: instancesLoading } = useInstances();
  const { data: activityLogs, isLoading: logsLoading } = useActivityLogs();

  // Calculate real-time stats
  const connectedInstances = instances?.filter(i => i.status === 'connected').length || 0;
  const totalInstances = instances?.length || 0;
  const isOnline = health?.status === 'healthy';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>Visão geral do seu ecossistema WhatsApp</span>
            {isOnline ? (
              <span className="flex items-center gap-1 text-success">
                <Activity className="h-4 w-4" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-destructive">
                <Clock className="h-4 w-4" />
                Offline
              </span>
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Instâncias Ativas"
            value={`${connectedInstances}/${totalInstances}`}
            icon={Smartphone}
            variant="default"
            loading={instancesLoading}
          />
          <StatCard
            title="Mensagens Hoje"
            value={evolutionStats?.messagesToday.toLocaleString('pt-BR') || '0'}
            change={{ value: evolutionStats?.messagesToday ? "hoje" : undefined, trend: "up" }}
            icon={MessageSquare}
            variant="default"
            loading={evolutionLoading}
          />
          <StatCard
            title="Taxa de Sucesso"
            value={evolutionStats?.totalMessages && evolutionStats?.errorsCount 
              ? `${((1 - evolutionStats.errorsCount / evolutionStats.totalMessages) * 100).toFixed(1)}%`
              : '95.9%'
            }
            icon={CheckCircle}
            variant="success"
            loading={evolutionLoading}
          />
          <StatCard
            title="Execuções n8n"
            value={n8nStats?.totalExecutions.toLocaleString('pt-BR') || '0'}
            change={{ value: n8nStats?.executionsToday ? `${n8nStats.executionsToday} hoje` : undefined, trend: "up" }}
            icon={AlertTriangle}
            variant="warning"
            loading={n8nLoading}
          />
        </div>

        {/* Charts and Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <MessagesChart />
          </div>
          <div className="xl:col-span-1">
            <RecentLogs />
          </div>
        </div>

        {/* Instances Preview */}
        <div className="pt-6 border-t border-border">
          <InstanceGrid />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
