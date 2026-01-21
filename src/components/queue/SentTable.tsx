import { useState } from "react";
import { Loader2, Search, RefreshCw, CheckCircle2, MessageSquare, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSentLeads } from "@/hooks/useDispatchQueue";
import { SentLead } from "@/services/supabase";

export function SentTable() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<SentLead | null>(null);
  const limit = 50;

  const { data, isLoading, isError, error, refetch } = useSentLeads(limit, page * limit);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("pt-BR");
    } catch {
      return dateString;
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
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ServerCrash className="h-12 w-12 mb-4 text-destructive" />
          <p className="text-lg font-medium text-destructive">Erro ao carregar enviados</p>
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
          <CheckCircle2 className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Nenhum envio ainda</p>
          <p className="text-sm">Os leads enviados aparecerão aqui</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nome</TableHead>
                  <TableHead className="min-w-[180px]">Email</TableHead>
                  <TableHead className="min-w-[140px]">Telefone</TableHead>
                  <TableHead className="min-w-[150px]">Empresa</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Stage</TableHead>
                  <TableHead className="min-w-[120px]">Origem</TableHead>
                  <TableHead className="min-w-[150px]">Enviado em</TableHead>
                  <TableHead className="w-24">Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {lead.name || "-"}
                      </div>
                    </TableCell>
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
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      {lead["ULTIMA MENSAGEM ENVIADA"] ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Mensagem Enviada</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Para: {lead.name} ({formatPhone(lead.ddi, lead.phone, lead.complete_phone)})
                              </p>
                              <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm max-h-[400px] overflow-y-auto">
                                {lead["ULTIMA MENSAGEM ENVIADA"]}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredLeads.length} de {totalCount} leads enviados
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
