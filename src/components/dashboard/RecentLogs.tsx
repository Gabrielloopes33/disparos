import { Clock, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const logs = [
  {
    id: "log_001",
    timestamp: "2026-01-15T18:45:00Z",
    action: "bulk_dispatch_started",
    description: "Disparo em massa iniciado para Lista Marketing Q1",
    status: "processing",
  },
  {
    id: "log_002",
    timestamp: "2026-01-15T18:30:00Z",
    action: "instance_connected",
    description: "Instância Vendas01 reconectada com sucesso",
    status: "success",
  },
  {
    id: "log_003",
    timestamp: "2026-01-15T18:15:00Z",
    action: "campaign_completed",
    description: "Campanha Black Friday finalizada - 2.450 mensagens",
    status: "success",
  },
  {
    id: "log_004",
    timestamp: "2026-01-15T18:00:00Z",
    action: "dispatch_error",
    description: "45 números inválidos detectados na lista Promoções",
    status: "error",
  },
  {
    id: "log_005",
    timestamp: "2026-01-15T17:45:00Z",
    action: "instance_created",
    description: "Nova instância Suporte02 criada",
    status: "success",
  },
];

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
          const config = statusConfig[log.status as keyof typeof statusConfig];
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
                log.status === "processing" && "animate-pulse-slow"
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
                {log.status === "processing" && "Em andamento"}
                {log.status === "success" && "Concluído"}
                {log.status === "error" && "Erro"}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
