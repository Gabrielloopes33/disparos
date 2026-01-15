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
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground">Últimas ações do sistema</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          Últimas 24h
        </Badge>
      </div>

      <div className="space-y-4">
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
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bg)}>
                <StatusIcon className={cn("h-5 w-5", config.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{time}</p>
              </div>

              <Badge variant="outline" className={cn("shrink-0", config.badge)}>
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
