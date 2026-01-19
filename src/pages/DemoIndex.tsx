import { Smartphone, MessageSquare, CheckCircle, AlertTriangle, Clock, Activity } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { MessagesChart } from "@/components/dashboard/MessagesChart";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { InstanceGrid } from "@/components/instances/InstanceGrid";
import { cn } from "@/lib/utils";

// Mock data for demonstration when APIs are not available
const mockStats = {
  connectedInstances: 5,
  totalInstances: 8,
  messagesToday: 1250,
  successRate: 94.5,
  errorsCount: 68,
};

const mockActivityLogs = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: "success",
    action: "instance_connected",
    description: "Instância Marketing conectada com sucesso",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: "info",
    action: "campaign_started",
    description: "Campanha Black Friday iniciada",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "warning",
    action: "rate_limit_warning",
    description: "Limite de envio aproximando para instância Vendas",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: "success",
    action: "bulk_completed",
    description: "Disparo em massa concluído - 450 mensagens enviadas",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: "error",
    action: "connection_failed",
    description: "Falha ao conectar instância Suporte",
  },
];

const DemoDashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Demo Banner */}
        <div className="glass-strong rounded-xl border border-border/50 p-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-warning">Modo Demonstração</h3>
              <p className="text-sm text-muted-foreground">
                Conecte suas APIs na página de Configurações para ver dados reais.
              </p>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span>Visão geral do seu ecossistema WhatsApp</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Modo Demo
            </span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Instâncias Ativas"
            value={`${mockStats.connectedInstances}/${mockStats.totalInstances}`}
            icon={Smartphone}
            variant="default"
          />
          <StatCard
            title="Mensagens Hoje"
            value={mockStats.messagesToday.toLocaleString('pt-BR')}
            change={{ value: "hoje", trend: "up" }}
            icon={MessageSquare}
            variant="default"
          />
          <StatCard
            title="Taxa de Sucesso"
            value={`${mockStats.successRate}%`}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Erros Detectados"
            value={mockStats.errorsCount}
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        {/* Charts and Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <MessagesChart />
          </div>
          <div className="xl:col-span-1">
            <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Atividade Recente
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Atividades simuladas</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockActivityLogs.map((log, index) => {
                  const getStatusConfig = () => {
                    switch (log.type) {
                      case 'success':
                        return {
                          icon: CheckCircle,
                          color: 'text-success',
                          bg: 'bg-success/10',
                          badge: 'bg-success/20 text-success border-success/30',
                        };
                      case 'warning':
                        return {
                          icon: AlertTriangle,
                          color: 'text-warning',
                          bg: 'bg-warning/10',
                          badge: 'bg-warning/20 text-warning border-warning/30',
                        };
                      case 'error':
                        return {
                          icon: AlertTriangle,
                          color: 'text-destructive',
                          bg: 'bg-destructive/10',
                          badge: 'bg-destructive/20 text-destructive border-destructive/30',
                        };
                      default:
                        return {
                          icon: Clock,
                          color: 'text-muted-foreground',
                          bg: 'bg-muted/10',
                          badge: 'bg-muted/20 text-muted-foreground border-muted/30',
                        };
                    }
                  };

                  const config = getStatusConfig();
                  const StatusIcon = config.icon;
                  const time = new Date(log.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-border/30 glass-strong hover:border-primary/30 transition-all duration-300 hover:shadow-md animate-slide-up group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300",
                        config.bg
                      )}>
                        <StatusIcon className={cn("h-6 w-6", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </p>
                      </div>

                      <div className={cn(
                        "shrink-0 px-3 py-1 rounded-full border hover-scale transition-transform",
                        config.badge
                      )}>
                        {log.type === 'success' && "Concluído"}
                        {log.type === 'warning' && "Atenção"}
                        {log.type === 'error' && "Erro"}
                        {log.type === 'info' && "Info"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

export default DemoDashboard;