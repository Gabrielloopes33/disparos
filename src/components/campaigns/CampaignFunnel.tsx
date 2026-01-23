import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

export interface FunnelData {
  totalSent: number;
  delivered: number;
  read: number;
  interacted: number;
}

interface CampaignFunnelProps {
  data: FunnelData;
  loading?: boolean;
}

const COLORS = {
  sent: "hsl(var(--primary))",
  delivered: "hsl(142, 71%, 45%)",
  read: "hsl(217, 91%, 60%)",
  interacted: "hsl(142, 76%, 36%)",
};

const LABELS = {
  sent: "Enviados",
  delivered: "Entregues",
  read: "Lidos",
  interacted: "Interagiram",
};

export function CampaignFunnel({ data, loading = false }: CampaignFunnelProps) {
  const chartData = [
    { name: "Enviados", value: data.totalSent, color: COLORS.sent, key: "sent" },
    { name: "Entregues", value: data.delivered, color: COLORS.delivered, key: "delivered" },
    { name: "Lidos", value: data.read, color: COLORS.read, key: "read" },
    { name: "Interagiram", value: data.interacted, color: COLORS.interacted, key: "interacted" },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  const getConversionRate = (current: number, previous: number) => {
    if (previous === 0) return "0%";
    return `${((current / previous) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="glass-strong rounded-2xl border border-border/50 p-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-[280px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Funil de Conversao
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Jornada do lead na campanha
        </p>
      </div>

      {/* Visual Funnel */}
      <div className="space-y-3 mb-6">
        {chartData.map((item, index) => {
          const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const prevValue = index > 0 ? chartData[index - 1].value : item.value;
          const conversion = getConversionRate(item.value, prevValue);

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {item.value.toLocaleString('pt-BR')}
                  </span>
                  {index > 0 && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      parseFloat(conversion) >= 50
                        ? "bg-green-500/10 text-green-500"
                        : parseFloat(conversion) >= 25
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-red-500/10 text-red-500"
                    )}>
                      {conversion}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-8 bg-muted/50 rounded-lg overflow-hidden relative">
                <div
                  className="h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.max(widthPercent, 5)}%`,
                    backgroundColor: item.color,
                  }}
                >
                  {widthPercent > 20 && (
                    <span className="text-xs font-medium text-white">
                      {widthPercent.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Summary */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Entrega</p>
          <p className="text-lg font-bold text-green-500">
            {getConversionRate(data.delivered, data.totalSent)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Leitura</p>
          <p className="text-lg font-bold text-blue-500">
            {getConversionRate(data.read, data.delivered)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Interacao</p>
          <p className="text-lg font-bold text-emerald-500">
            {getConversionRate(data.interacted, data.read)}
          </p>
        </div>
      </div>
    </div>
  );
}
