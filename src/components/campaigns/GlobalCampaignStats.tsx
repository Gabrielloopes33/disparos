import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  CheckCheck,
  Eye,
  MessageCircle,
  UserX,
  Link2,
  CalendarIcon,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface GlobalMetrics {
  totalSent: number;
  delivered: number;
  read: number;
  positiveInteractions: number;
  optOuts: number;
  linkClicks: number;
  totalCampaigns: number;
}

interface GlobalCampaignStatsProps {
  loading?: boolean;
}

// Mock data - TODO: Buscar do Supabase com filtro de data
const getMockMetrics = (dateRange: DateRange | undefined): GlobalMetrics => {
  // Simular variação baseada no período
  const multiplier = dateRange?.from && dateRange?.to
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24 * 7))
    : 4;

  return {
    totalSent: 12500 * multiplier,
    delivered: 12125 * multiplier,
    read: 8750 * multiplier,
    positiveInteractions: 2100 * multiplier,
    optOuts: 187 * multiplier,
    linkClicks: 3420 * multiplier,
    totalCampaigns: 15 + multiplier,
  };
};

const PRESET_RANGES = [
  { label: "Hoje", value: "today", getDates: () => ({ from: new Date(), to: new Date() }) },
  { label: "Ultimos 7 dias", value: "7d", getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Ultimos 30 dias", value: "30d", getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Este mes", value: "month", getDates: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Ultimos 90 dias", value: "90d", getDates: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "Todo periodo", value: "all", getDates: () => ({ from: subDays(new Date(), 365), to: new Date() }) },
];

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
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

function MetricCard({ title, value, subtitle, icon: Icon, variant = "default" }: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg group",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
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

export function GlobalCampaignStats({ loading = false }: GlobalCampaignStatsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [presetValue, setPresetValue] = useState("30d");

  const metrics = getMockMetrics(dateRange);

  const deliveryRate = metrics.totalSent > 0
    ? ((metrics.delivered / metrics.totalSent) * 100).toFixed(1)
    : "0.0";

  const readRate = metrics.delivered > 0
    ? ((metrics.read / metrics.delivered) * 100).toFixed(1)
    : "0.0";

  const interactionRate = metrics.read > 0
    ? ((metrics.positiveInteractions / metrics.read) * 100).toFixed(1)
    : "0.0";

  const optOutRate = metrics.totalSent > 0
    ? ((metrics.optOuts / metrics.totalSent) * 100).toFixed(2)
    : "0.00";

  const handlePresetChange = (value: string) => {
    setPresetValue(value);
    const preset = PRESET_RANGES.find(p => p.value === value);
    if (preset) {
      setDateRange(preset.getDates());
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Selecionar periodo";
    if (!dateRange?.to) return format(dateRange.from, "dd MMM yyyy", { locale: ptBR });
    return `${format(dateRange.from, "dd MMM", { locale: ptBR })} - ${format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Metricas Gerais</h3>
            <p className="text-sm text-muted-foreground">
              Dados consolidados de todas as campanhas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={presetValue} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_RANGES.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{formatDateRange()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setPresetValue("");
                }}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Campaign count badge */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {metrics.totalCampaigns} campanhas no periodo
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Total Enviados"
          value={metrics.totalSent}
          icon={Send}
          variant="default"
        />

        <MetricCard
          title="Entregues"
          value={metrics.delivered}
          subtitle={`${deliveryRate}% taxa de entrega`}
          icon={CheckCheck}
          variant="success"
        />

        <MetricCard
          title="Lidos"
          value={metrics.read}
          subtitle={`${readRate}% taxa de leitura`}
          icon={Eye}
          variant="info"
        />

        <MetricCard
          title="Interacoes"
          value={metrics.positiveInteractions}
          subtitle={`${interactionRate}% taxa`}
          icon={MessageCircle}
          variant="success"
        />

        <MetricCard
          title="Cliques em Links"
          value={metrics.linkClicks}
          icon={Link2}
          variant="warning"
        />

        <MetricCard
          title="Opt-outs"
          value={metrics.optOuts}
          subtitle={`${optOutRate}% do total`}
          icon={UserX}
          variant="destructive"
        />

        <MetricCard
          title="Taxa de Entrega"
          value={`${deliveryRate}%`}
          icon={CheckCheck}
          variant="success"
        />

        <MetricCard
          title="Taxa de Leitura"
          value={`${readRate}%`}
          icon={Eye}
          variant="info"
        />
      </div>
    </div>
  );
}
