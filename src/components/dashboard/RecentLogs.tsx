import { Clock, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActivityLogs } from "@/hooks/useEvolution";
import { ActivityLog } from "@/types/evolution";
import { AlertTriangle, RefreshCw } from "lucide-react";

const statusConfig = {
  processing: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    badge: "bg-warning/20 text-warning border-warning/30",
  },
  success: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    badge: "bg-success/20 text-success border-success/30",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badge: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export function RecentLogs() {
  const { data: logs, isLoading, error } = useActivityLogs(10);

  const mapLogTypeToStatus = (type: string) => {
    if (type === 'error') return 'error';
    if (type === 'warning') return 'processing';
    return 'success';
  };

  if (isLoading) {
    return (
      <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift group">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Atividade Recente
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Últimas ações do sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !logs) {
    return (
      <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift group">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Atividade Recente
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Últimas ações do sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Falha ao carregar logs</p>
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift group">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Atividade Recente
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Últimas ações do sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Atividade Recente
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Últimas ações do sistema</p>
        </div>
        <Badge variant="outline" className="glass-strong border-border/50 px-3 py-1.5 hover-scale">
          Últimas 24h
        </Badge>
      </div>

      <div className="space-y-3">
        {logs.map((log, index) => {
          const status = mapLogTypeToStatus(log.type);
          const config = statusConfig[status as keyof typeof statusConfig];
          const StatusIcon = config.icon;
          const time = new Date(log.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border border-border/30 glass-strong hover:border-primary/30 transition-all duration-300 hover:shadow-md animate-slide-up group",
                status === "processing" && "animate-pulse-slow"
              )}
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

              <Badge variant="outline" className={cn(
                "shrink-0 px-3 py-1 rounded-full border hover-scale transition-transform",
                config.badge
              )}>
                {status === "processing" && "Em andamento"}
                {status === "success" && "Concluído"}
                {status === "error" && "Erro"}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
