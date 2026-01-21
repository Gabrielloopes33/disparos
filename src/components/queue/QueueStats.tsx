import { ListTodo, CheckCircle2, Users, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useQueueStats } from "@/hooks/useDispatchQueue";
import { Button } from "@/components/ui/button";

export function QueueStats() {
  const { data: stats, isLoading, isError, error, refetch } = useQueueStats();

  const statCards = [
    {
      label: "Na Fila",
      value: stats?.pending || 0,
      icon: ListTodo,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Já Enviados",
      value: stats?.sent || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Processados",
      value: stats?.total || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  if (isError) {
    const is503 = error?.message?.includes('503');
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Erro de Conexão com Supabase</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {is503
                ? "O servidor Supabase está indisponível (503). Verifique se os serviços estão rodando na VPS."
                : `Erro ao conectar: ${error?.message || 'Erro desconhecido'}`
              }
            </p>
            {is503 && (
              <p className="text-xs text-muted-foreground mt-2">
                Dica: Verifique se os containers do Supabase (PostgREST, Kong, etc.) estão ativos.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
