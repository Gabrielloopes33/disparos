import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  Clock,
  Users,
  Trash2,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { scheduledDispatchService, ScheduledDispatch } from "@/services/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScheduledDispatchesListProps {
  onExecuteNow?: (dispatch: ScheduledDispatch) => void;
}

const STATUS_CONFIG: Record<ScheduledDispatch['status'], { label: string; icon: React.ElementType; className: string }> = {
  pending: {
    label: "Agendado",
    icon: Clock,
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  processing: {
    label: "Executando",
    icon: Loader2,
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  completed: {
    label: "Concluido",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  failed: {
    label: "Falhou",
    icon: AlertCircle,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    className: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  },
};

function formatScheduledDate(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return `Hoje as ${format(date, "HH:mm")}`;
  }
  if (isTomorrow(date)) {
    return `Amanha as ${format(date, "HH:mm")}`;
  }
  return format(date, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR });
}

function getTimeUntil(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0) return "Atrasado";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `em ${diffMins} min`;
  if (diffHours < 24) return `em ${diffHours}h`;
  return `em ${diffDays} dia(s)`;
}

export function ScheduledDispatchesList({ onExecuteNow }: ScheduledDispatchesListProps) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch scheduled dispatches
  const { data, isLoading, error } = useQuery({
    queryKey: ['scheduled-dispatches'],
    queryFn: () => scheduledDispatchService.getScheduledDispatches(50, 0),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => scheduledDispatchService.cancelDispatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-dispatches'] });
      toast.success("Disparo cancelado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar disparo", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduledDispatchService.deleteDispatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-dispatches'] });
      toast.success("Disparo excluido com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao excluir disparo", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  const dispatches = data?.data || [];
  const pendingDispatches = dispatches.filter(d => d.status === 'pending');
  const otherDispatches = dispatches.filter(d => d.status !== 'pending');

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">Erro ao carregar agendamentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarClock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Disparos Agendados</h2>
          <p className="text-sm text-muted-foreground">
            {pendingDispatches.length} agendamento(s) pendente(s)
          </p>
        </div>
      </div>

      {dispatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
          <CalendarClock className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="font-medium">Nenhum disparo agendado</p>
          <p className="text-sm text-muted-foreground">
            Use a opcao "Agendar Disparo" para programar envios
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {/* Pending dispatches first */}
          {pendingDispatches.map((dispatch) => (
            <DispatchCard
              key={dispatch.id}
              dispatch={dispatch}
              isExpanded={expandedId === dispatch.id}
              onToggleExpand={() => setExpandedId(expandedId === dispatch.id ? null : dispatch.id!)}
              onCancel={() => dispatch.id && cancelMutation.mutate(dispatch.id)}
              onDelete={() => dispatch.id && deleteMutation.mutate(dispatch.id)}
              onExecuteNow={onExecuteNow}
              isCancelling={cancelMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
          ))}

          {/* Divider if we have both types */}
          {pendingDispatches.length > 0 && otherDispatches.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Historico</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

          {/* Other dispatches (completed, failed, cancelled) */}
          {otherDispatches.map((dispatch) => (
            <DispatchCard
              key={dispatch.id}
              dispatch={dispatch}
              isExpanded={expandedId === dispatch.id}
              onToggleExpand={() => setExpandedId(expandedId === dispatch.id ? null : dispatch.id!)}
              onDelete={() => dispatch.id && deleteMutation.mutate(dispatch.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DispatchCardProps {
  dispatch: ScheduledDispatch;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onExecuteNow?: (dispatch: ScheduledDispatch) => void;
  isCancelling?: boolean;
  isDeleting?: boolean;
}

function DispatchCard({
  dispatch,
  isExpanded,
  onToggleExpand,
  onCancel,
  onDelete,
  onExecuteNow,
  isCancelling,
  isDeleting,
}: DispatchCardProps) {
  const statusConfig = STATUS_CONFIG[dispatch.status];
  const StatusIcon = statusConfig.icon;
  const isOverdue = dispatch.status === 'pending' && isPast(new Date(dispatch.scheduled_for));

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isExpanded ? "bg-muted/30" : "bg-background",
        isOverdue && dispatch.status === 'pending' && "border-amber-500/50"
      )}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("gap-1", statusConfig.className)}>
                  <StatusIcon className={cn("h-3 w-3", dispatch.status === 'processing' && "animate-spin")} />
                  {statusConfig.label}
                </Badge>
                {isOverdue && dispatch.status === 'pending' && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Atrasado
                  </Badge>
                )}
                {dispatch.media_type && (
                  <Badge variant="secondary" className="text-xs">
                    {dispatch.media_type === 'image' ? 'Imagem' : dispatch.media_type === 'video' ? 'Video' : 'Documento'}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatScheduledDate(dispatch.scheduled_for)}</span>
                  {dispatch.status === 'pending' && (
                    <span className="text-primary font-medium">
                      ({getTimeUntil(dispatch.scheduled_for)})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{dispatch.total_groups} grupo(s)</span>
                </div>
              </div>

              <p className="mt-2 text-sm truncate text-muted-foreground">
                {dispatch.message || '(Apenas midia)'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {dispatch.status === 'pending' && onExecuteNow && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onExecuteNow(dispatch)}
                title="Executar agora"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {dispatch.status === 'pending' && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={onCancel}
                disabled={isCancelling}
                title="Cancelar"
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </Button>
            )}
            {(dispatch.status === 'completed' || dispatch.status === 'failed' || dispatch.status === 'cancelled') && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Excluir"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acao nao pode ser desfeita. O registro do agendamento sera removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t space-y-3 animate-fade-in">
          {/* Instance */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Instancia:</span>
            <span className="font-medium">{dispatch.instance_name}</span>
          </div>

          {/* Groups */}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Grupos:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {dispatch.groups.slice(0, 5).map((group, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {group.name}
                </Badge>
              ))}
              {dispatch.groups.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{dispatch.groups.length - 5} mais
                </Badge>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Mensagem:</span>
            <div className="p-3 bg-background rounded-lg border text-sm whitespace-pre-wrap">
              {dispatch.message || '(Sem texto - apenas midia)'}
            </div>
          </div>

          {/* Progress for completed/failed */}
          {(dispatch.status === 'completed' || dispatch.status === 'failed') && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{dispatch.sent_count || 0} enviados</span>
              </div>
              {(dispatch.error_count || 0) > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>{dispatch.error_count} erros</span>
                </div>
              )}
            </div>
          )}

          {/* Error message if failed */}
          {dispatch.status === 'failed' && dispatch.error_message && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {dispatch.error_message}
            </div>
          )}

          {/* Mention everyone */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Mencionar todos:</span>
            <span>{dispatch.mention_everyone ? 'Sim' : 'Nao'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
