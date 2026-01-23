import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCheck,
  Eye,
  Send,
  XCircle,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserX,
  Clock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageStatus = "sent" | "delivered" | "read" | "failed";
export type InteractionType = "none" | "reply" | "positive_reply" | "opt-out" | "click";

export interface ContactLog {
  id: string;
  contactNumber: string;
  contactName?: string;
  status: MessageStatus;
  interactionType: InteractionType;
  lastUpdatedAt: string;
  messageSent?: string;
}

interface CampaignContactsTableProps {
  contacts: ContactLog[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const STATUS_CONFIG: Record<MessageStatus, { label: string; icon: React.ElementType; className: string }> = {
  sent: {
    label: "Enviado",
    icon: Send,
    className: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  },
  delivered: {
    label: "Entregue",
    icon: CheckCheck,
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  read: {
    label: "Lido",
    icon: Eye,
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

const INTERACTION_CONFIG: Record<InteractionType, { label: string; icon: React.ElementType; className: string }> = {
  none: {
    label: "Nenhuma",
    icon: Clock,
    className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  reply: {
    label: "Respondeu",
    icon: MessageCircle,
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  positive_reply: {
    label: "Interesse",
    icon: MessageCircle,
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  "opt-out": {
    label: "Opt-out",
    icon: UserX,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  click: {
    label: "Clicou",
    icon: Eye,
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
};

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CampaignContactsTable({
  contacts,
  loading = false,
  totalCount,
  page = 1,
  pageSize = 20,
  onPageChange,
}: CampaignContactsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [interactionFilter, setInteractionFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
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

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      search === "" ||
      contact.contactNumber.includes(search) ||
      contact.contactName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;

    const matchesInteraction =
      interactionFilter === "all" || contact.interactionType === interactionFilter;

    return matchesSearch && matchesStatus && matchesInteraction;
  });

  const total = totalCount ?? filteredContacts.length;
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="glass-strong rounded-2xl border border-border/50 p-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Detalhes por Contato
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Status individual de cada mensagem enviada
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por telefone ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="read">Lido</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>
        <Select value={interactionFilter} onValueChange={setInteractionFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Interacao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas interacoes</SelectItem>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="reply">Respondeu</SelectItem>
            <SelectItem value="positive_reply">Interesse</SelectItem>
            <SelectItem value="opt-out">Opt-out</SelectItem>
            <SelectItem value="click">Clicou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10"></TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interacao</TableHead>
              <TableHead className="text-right">Atualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum contato encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => {
                const statusConfig = STATUS_CONFIG[contact.status];
                const interactionConfig = INTERACTION_CONFIG[contact.interactionType];
                const StatusIcon = statusConfig.icon;
                const InteractionIcon = interactionConfig.icon;
                const isExpanded = expandedRows.has(contact.id);

                return (
                  <>
                    <TableRow
                      key={contact.id}
                      className={cn(
                        "hover:bg-muted/30 cursor-pointer",
                        isExpanded && "bg-muted/20"
                      )}
                      onClick={() => contact.messageSent && toggleRowExpansion(contact.id)}
                    >
                      <TableCell className="w-10">
                        {contact.messageSent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(contact.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatPhoneNumber(contact.contactNumber)}
                          </p>
                          {contact.contactName && (
                            <p className="text-xs text-muted-foreground">
                              {contact.contactName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("gap-1", statusConfig.className)}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("gap-1", interactionConfig.className)}
                        >
                          <InteractionIcon className="h-3 w-3" />
                          {interactionConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(contact.lastUpdatedAt)}
                      </TableCell>
                    </TableRow>
                    {/* Expanded row with message */}
                    {isExpanded && contact.messageSent && (
                      <TableRow key={`${contact.id}-expanded`}>
                        <TableCell colSpan={5} className="bg-muted/10 p-0">
                          <div className="p-4 border-l-4 border-primary/50">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="space-y-1 flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Mensagem Enviada
                                </p>
                                <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded-lg border">
                                  {contact.messageSent}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
