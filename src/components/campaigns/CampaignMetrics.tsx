import { Send, CheckCheck, Eye, MessageCircle, UserX, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CampaignMetricsData {
  totalSent: number;
  delivered: number;
  read: number;
  positiveInteractions: number;
  optOuts: number;
  linkClicks: number;
}

interface CampaignMetricsProps {
  data: CampaignMetricsData;
  loading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
  loading?: boolean;
}

const variantStyles = {
  default: "border-border/50 hover:border-primary/30",
  success: "border-green-500/30 hover:border-green-500/50",
  warning: "border-amber-500/30 hover:border-amber-500/50",
  destructive: "border-red-500/30 hover:border-red-500/50",
  info: "border-blue-500/30 hover:border-blue-500/50",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-amber-500/10 text-amber-500",
  destructive: "bg-red-500/10 text-red-500",
  info: "bg-blue-500/10 text-blue-500",
};

function MetricCard({ title, value, subtitle, icon: Icon, variant = "default", loading }: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg group",
        variantStyles[variant],
        loading && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">
            {loading ? (
              <span className="inline-block h-7 w-16 bg-muted animate-pulse rounded" />
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            iconStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function CampaignMetrics({ data, loading = false }: CampaignMetricsProps) {
  const deliveryRate = data.totalSent > 0
    ? ((data.delivered / data.totalSent) * 100).toFixed(1)
    : "0.0";

  const readRate = data.delivered > 0
    ? ((data.read / data.delivered) * 100).toFixed(1)
    : "0.0";

  const interactionRate = data.read > 0
    ? ((data.positiveInteractions / data.read) * 100).toFixed(1)
    : "0.0";

  const optOutRate = data.totalSent > 0
    ? ((data.optOuts / data.totalSent) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Metricas da Campanha
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Enviados"
          value={data.totalSent.toLocaleString('pt-BR')}
          icon={Send}
          variant="default"
          loading={loading}
        />

        <MetricCard
          title="Entregues"
          value={data.delivered.toLocaleString('pt-BR')}
          subtitle={`${deliveryRate}% taxa`}
          icon={CheckCheck}
          variant="success"
          loading={loading}
        />

        <MetricCard
          title="Lidos"
          value={data.read.toLocaleString('pt-BR')}
          subtitle={`${readRate}% taxa`}
          icon={Eye}
          variant="info"
          loading={loading}
        />

        <MetricCard
          title="Interacoes"
          value={data.positiveInteractions.toLocaleString('pt-BR')}
          subtitle={`${interactionRate}% taxa`}
          icon={MessageCircle}
          variant="success"
          loading={loading}
        />

        <MetricCard
          title="Opt-outs"
          value={data.optOuts.toLocaleString('pt-BR')}
          subtitle={`${optOutRate}% taxa`}
          icon={UserX}
          variant="destructive"
          loading={loading}
        />

        <MetricCard
          title="Cliques"
          value={data.linkClicks.toLocaleString('pt-BR')}
          icon={Link2}
          variant="warning"
          loading={loading}
        />
      </div>
    </div>
  );
}
