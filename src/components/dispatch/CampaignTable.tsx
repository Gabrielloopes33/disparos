import { useState } from "react";
import { ExternalLink, Download, CheckCircle2, Clock, AlertCircle, Trash2, Eye, Users, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDispatchLogs } from "@/hooks/useDispatchLogs";
import { DispatchLog } from "@/types/evolution";
import { toast } from "sonner";

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: "Concluído",
    color: "text-success",
    bg: "bg-success/10 border-success/30",
  },
  running: {
    icon: Clock,
    label: "Em andamento",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
  },
  pending: {
    icon: Clock,
    label: "Pendente",
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
  },
  failed: {
    icon: AlertCircle,
    label: "Falhou",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
  },
};

function DispatchDetails({ log }: { log: DispatchLog }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Instância</p>
          <p className="font-medium">{log.instanceName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Tipo</p>
          <p className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {log.type === 'groups' ? 'Grupos' : 'Contatos'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Iniciado em</p>
          <p className="font-medium">
            {new Date(log.startedAt).toLocaleString('pt-BR')}
          </p>
        </div>
        {log.completedAt && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Finalizado em</p>
            <p className="font-medium">
              {new Date(log.completedAt).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Mensagem</p>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{log.message}</p>
        </div>
        {log.mentionEveryone && (
          <Badge variant="outline" className="text-xs">
            @everyone ativado
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Destinatários ({log.sentCount}/{log.totalTargets} enviados)
        </p>
        <ScrollArea className="h-[200px] border rounded-lg">
          <div className="p-2 space-y-1">
            {log.targets.map((target) => (
              <div
                key={target.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md text-sm",
                  target.status === 'sent' && "bg-success/10",
                  target.status === 'failed' && "bg-destructive/10",
                  target.status === 'pending' && "bg-muted"
                )}
              >
                <span className="truncate flex-1">{target.name}</span>
                <div className="flex items-center gap-2">
                  {target.status === 'sent' && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  {target.status === 'failed' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  {target.status === 'pending' && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function CampaignTable() {
  const { logs, deleteLog, clearAllLogs, isLoading } = useDispatchLogs();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (id: string) => {
    deleteLog(id);
    toast.success("Disparo removido do histórico");
  };

  const handleClearAll = () => {
    clearAllLogs();
    toast.success("Histórico limpo com sucesso");
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const headers = ['Nome', 'Instância', 'Tipo', 'Total', 'Enviados', 'Falhas', 'Status', 'Data'];
    const rows = logs.map(log => [
      log.name,
      log.instanceName,
      log.type === 'groups' ? 'Grupos' : 'Contatos',
      log.totalTargets,
      log.sentCount,
      log.failedCount,
      log.status,
      new Date(log.startedAt).toLocaleString('pt-BR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disparos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Relatório exportado com sucesso");
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card animate-fade-in p-8 text-center">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-2" />
        <p className="text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Histórico de Disparos</h2>
            <p className="text-sm text-muted-foreground">
              {logs.length} {logs.length === 1 ? 'disparo realizado' : 'disparos realizados'}
            </p>
          </div>
          <div className="flex gap-2">
            {logs.length > 0 && (
              <>
                <Button variant="outline" className="gap-2" onClick={exportToCSV}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Limpar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os registros de disparos serão removidos permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Limpar tudo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">Nenhum disparo realizado</h3>
          <p className="text-sm text-muted-foreground">
            Os disparos que você realizar aparecerão aqui
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8"></TableHead>
              <TableHead>Disparo</TableHead>
              <TableHead>Instância</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const config = statusConfig[log.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              const progress = (log.sentCount / log.totalTargets) * 100;
              const successRate =
                log.sentCount > 0
                  ? (((log.sentCount - log.failedCount) / log.sentCount) * 100).toFixed(1)
                  : 0;
              const isExpanded = expandedRows.has(log.id);

              return (
                <>
                  <TableRow key={log.id} className="cursor-pointer" onClick={() => toggleRow(log.id)}>
                    <TableCell>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.type === 'groups' ? 'Grupos' : 'Contatos'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.instanceName}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2 w-24" />
                        <span className="text-xs text-muted-foreground">
                          {log.sentCount}/{log.totalTargets}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-medium",
                          Number(successRate) >= 95 ? "text-success" :
                          Number(successRate) >= 80 ? "text-warning" : "text-destructive"
                        )}
                      >
                        {successRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1.5", config.bg, config.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.startedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Ver detalhes">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{log.name}</DialogTitle>
                              <DialogDescription>
                                Detalhes do disparo
                              </DialogDescription>
                            </DialogHeader>
                            <DispatchDetails log={log} />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir disparo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O registro deste disparo será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(log.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${log.id}-expanded`}>
                      <TableCell colSpan={8} className="bg-muted/30 p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Mensagem:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-background p-3 rounded-lg border">
                              {log.message.length > 200 ? log.message.substring(0, 200) + '...' : log.message}
                            </p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Enviados: </span>
                              <span className="text-success font-medium">{log.sentCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Falhas: </span>
                              <span className="text-destructive font-medium">{log.failedCount}</span>
                            </div>
                            {log.mentionEveryone && (
                              <Badge variant="outline" className="text-xs">
                                @everyone
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
