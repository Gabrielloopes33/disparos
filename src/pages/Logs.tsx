import { MainLayout } from "@/components/layout/MainLayout";
import { CampaignTable } from "@/components/dispatch/CampaignTable";
import { useDispatchLogs } from "@/hooks/useDispatchLogs";
import { Send, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

const Logs = () => {
  const { getStats } = useDispatchLogs();
  const stats = getStats();

  const statCards = [
    {
      title: "Total de Disparos",
      value: stats.totalDispatches,
      icon: Send,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Mensagens Enviadas",
      value: stats.totalMessagesSent,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Falhas",
      value: stats.totalMessagesFailed,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "Disparos Hoje",
      value: stats.dispatchesToday,
      icon: Calendar,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Logs & Relatórios</h1>
          <p className="text-muted-foreground">Histórico completo dos seus disparos</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-card p-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Campaign Table */}
        <CampaignTable />
      </div>
    </MainLayout>
  );
};

export default Logs;
