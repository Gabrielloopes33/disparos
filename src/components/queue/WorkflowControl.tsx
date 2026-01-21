import { useState } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  StopCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useWorkflows,
  useActivateWorkflow,
  useDeactivateWorkflow,
  useExecutions,
  useStopExecution,
  useRetryExecution,
  useN8nHealth,
} from "@/hooks/useN8nWorkflows";
import { toast } from "sonner";
import { N8nWorkflow, N8nExecution } from "@/types/n8n";

export function WorkflowControl() {
  const { data: workflows, isLoading: loadingWorkflows, refetch: refetchWorkflows } = useWorkflows();
  const { data: executions, isLoading: loadingExecutions, refetch: refetchExecutions } = useExecutions(20);
  const { data: health } = useN8nHealth();

  const activateWorkflow = useActivateWorkflow();
  const deactivateWorkflow = useDeactivateWorkflow();
  const stopExecution = useStopExecution();
  const retryExecution = useRetryExecution();

  // Create a map of workflow IDs to names
  const workflowNames = workflows?.reduce((acc, wf) => {
    acc[wf.id] = wf.name;
    return acc;
  }, {} as Record<string, string>) || {};

  const getWorkflowName = (workflowId: string) => {
    return workflowNames[workflowId] || `Workflow ${workflowId}`;
  };

  const handleToggleWorkflow = async (workflow: N8nWorkflow) => {
    try {
      if (workflow.active) {
        await deactivateWorkflow.mutateAsync(workflow.id);
        toast.success(`Workflow "${workflow.name}" desativado`);
      } else {
        await activateWorkflow.mutateAsync(workflow.id);
        toast.success(`Workflow "${workflow.name}" ativado`);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar workflow");
    }
  };

  const handleStopExecution = async (executionId: string) => {
    try {
      await stopExecution.mutateAsync(executionId);
      toast.success("Execução parada");
    } catch (error: any) {
      toast.error(error.message || "Erro ao parar execução");
    }
  };

  const handleRetryExecution = async (executionId: string) => {
    try {
      await retryExecution.mutateAsync(executionId);
      toast.success("Execução reiniciada");
    } catch (error: any) {
      toast.error(error.message || "Erro ao reiniciar execução");
    }
  };

  const getStatusBadge = (status: N8nExecution["status"]) => {
    const statusConfig = {
      success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Sucesso" },
      error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Erro" },
      running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Rodando", animate: true },
      waiting: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Aguardando" },
      canceled: { icon: StopCircle, color: "text-gray-500", bg: "bg-gray-500/10", label: "Cancelado" },
      crashed: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Crash" },
      new: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Novo" },
      unknown: { icon: AlertTriangle, color: "text-gray-500", bg: "bg-gray-500/10", label: "Desconhecido" },
    };

    const config = statusConfig[status] || statusConfig.unknown;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0 gap-1`}>
        <Icon className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "-";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const isN8nOnline = health?.status === "healthy";
  const activeWorkflowsCount = workflows?.filter((w) => w.active).length || 0;
  const runningExecutions = executions?.filter((e) => e.status === "running").length || 0;

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isN8nOnline ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <Activity className={`h-5 w-5 ${isN8nOnline ? "text-green-500" : "text-red-500"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status n8n</p>
                <p className={`text-lg font-bold ${isN8nOnline ? "text-green-500" : "text-red-500"}`}>
                  {isN8nOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Workflows Ativos</p>
                <p className="text-lg font-bold">
                  {activeWorkflowsCount} / {workflows?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${runningExecutions > 0 ? "bg-blue-500/10" : "bg-muted"}`}>
                {runningExecutions > 0 ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Executando Agora</p>
                <p className="text-lg font-bold">{runningExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Workflows
            </CardTitle>
            <CardDescription>Gerencie seus workflows de disparo</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchWorkflows()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loadingWorkflows ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !workflows?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum workflow encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${workflow.active ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {workflow.id} • Atualizado: {formatDate(workflow.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={workflow.active ? "default" : "secondary"}>
                      {workflow.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Switch
                      checked={workflow.active}
                      onCheckedChange={() => handleToggleWorkflow(workflow)}
                      disabled={activateWorkflow.isPending || deactivateWorkflow.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Execuções Recentes
            </CardTitle>
            <CardDescription>Histórico das últimas execuções</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchExecutions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loadingExecutions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !executions?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma execução encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Modo</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">
                        {getWorkflowName(execution.workflowId)}
                      </TableCell>
                      <TableCell>{getStatusBadge(execution.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(execution.startedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDuration(execution.startedAt, execution.stoppedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {execution.mode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {execution.status === "running" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600"
                                  onClick={() => handleStopExecution(execution.id)}
                                  disabled={stopExecution.isPending}
                                >
                                  <StopCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Parar</TooltipContent>
                            </Tooltip>
                          )}
                          {execution.status === "error" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleRetryExecution(execution.id)}
                                  disabled={retryExecution.isPending}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Tentar Novamente</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
