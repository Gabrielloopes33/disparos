import { useState } from "react";
import { Loader2, Trash2, Search, RefreshCw, AlertTriangle, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useQueue, useRemoveLead, useRemoveLeads, useClearQueue } from "@/hooks/useDispatchQueue";
import { toast } from "sonner";

export function QueueTable() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const limit = 50;

  const { data, isLoading, isError, error, refetch } = useQueue(limit, page * limit);
  const removeLead = useRemoveLead();
  const removeLeads = useRemoveLeads();
  const clearQueue = useClearQueue();

  const leads = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const filteredLeads = searchQuery
    ? leads.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(lead.phone)?.includes(searchQuery) ||
          lead.complete_phone?.includes(searchQuery) ||
          lead.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leads;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id!).filter(Boolean));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      await removeLeads.mutateAsync(selectedIds);
      toast.success(`${selectedIds.length} leads removidos da fila`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Erro ao remover leads");
    }
  };

  const handleRemoveSingle = async (id: string) => {
    try {
      await removeLead.mutateAsync(id);
      toast.success("Lead removido da fila");
    } catch (error) {
      toast.error("Erro ao remover lead");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearQueue.mutateAsync();
      toast.success("Fila limpa com sucesso");
      setSelectedIds([]);
    } catch (error) {
      toast.error("Erro ao limpar fila");
    }
  };

  const formatPhone = (ddi?: number, phone?: number, complete?: string) => {
    if (complete) return complete;
    if (ddi && phone) return `${ddi}${phone}`;
    if (phone) return String(phone);
    return "-";
  };

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveSelected}
                disabled={removeLeads.isPending}
              >
                {removeLeads.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remover ({selectedIds.length})
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Limpar Fila
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar toda a fila?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover todos os {totalCount} leads da fila de disparos.
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {clearQueue.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Limpar Tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ServerCrash className="h-12 w-12 mb-4 text-destructive" />
          <p className="text-lg font-medium text-destructive">Erro ao carregar fila</p>
          <p className="text-sm text-center max-w-md mt-2">
            {error?.message?.includes('503')
              ? "Servidor Supabase indisponível. Verifique se os serviços estão rodando."
              : error?.message || "Erro de conexão com o banco de dados"
            }
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ListTodoIcon className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Fila vazia</p>
          <p className="text-sm">Importe um CSV para adicionar leads</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 sticky left-0 bg-card">
                    <Checkbox
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[150px]">Nome</TableHead>
                  <TableHead className="min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[140px]">Telefone</TableHead>
                  <TableHead className="min-w-[150px]">Empresa</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Stage</TableHead>
                  <TableHead className="min-w-[120px]">Origem</TableHead>
                  <TableHead className="min-w-[120px]">Tags</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="sticky left-0 bg-card">
                      <Checkbox
                        checked={selectedIds.includes(lead.id!)}
                        onCheckedChange={() => toggleSelect(lead.id!)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.email || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPhone(lead.ddi, lead.phone, lead.complete_phone)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.organization_name || "-"}
                    </TableCell>
                    <TableCell>
                      {lead.status ? (
                        <Badge variant="outline" className="text-xs">
                          {lead.status}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {lead.stage ? (
                        <Badge variant="secondary" className="text-xs">
                          {lead.stage}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {lead.origin || "-"}
                    </TableCell>
                    <TableCell>
                      {lead.tags ? (
                        <span className="text-xs text-muted-foreground truncate max-w-[100px] block">
                          {lead.tags}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSingle(lead.id!)}
                        disabled={removeLead.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredLeads.length} de {totalCount} leads
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page + 1} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ListTodoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="5" width="6" height="6" rx="1" />
      <path d="m3 17 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}
