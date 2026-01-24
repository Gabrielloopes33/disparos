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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Star,
  MessageCircle,
  UserX,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Crown,
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTopEngagedContacts, useOptOutList } from "@/hooks/useCampaigns";

interface ContactsRankingProps {
  loading?: boolean;
}

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
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRankIcon(position: number) {
  switch (position) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{position}</span>;
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (score >= 60) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (score >= 40) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-slate-500/10 text-slate-500 border-slate-500/20";
}

export function ContactsRanking({ loading: externalLoading = false }: ContactsRankingProps) {
  const [activeTab, setActiveTab] = useState("engaged");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: topEngaged = [], isLoading: loadingEngaged } = useTopEngagedContacts(10);
  const { data: optOutList, isLoading: loadingOptOuts } = useOptOutList(20);

  const loading = externalLoading || loadingEngaged || loadingOptOuts;

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

  if (loading) {
    return (
      <div className="glass-strong rounded-2xl border border-border/50 p-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20">
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Ranking de Contatos</h3>
          <p className="text-sm text-muted-foreground">
            Engajamento e controle de opt-outs
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="engaged" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Mais Engajados
          </TabsTrigger>
          <TabsTrigger value="optouts" className="gap-2">
            <UserX className="h-4 w-4" />
            Opt-outs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engaged">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Interacoes</TableHead>
                  <TableHead className="text-center">Respostas</TableHead>
                  <TableHead className="text-center">Interesse</TableHead>
                  <TableHead className="text-right">Ultima Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEngaged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum contato com interacoes registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  topEngaged.map((contact, index) => {
                    const isExpanded = expandedRows.has(contact.complete_phone);
                    // Calculate total interactions from available fields
                    const totalInteractions = contact.read_count + contact.reply_count + contact.positive_count;
                    return (
                      <>
                        <TableRow
                          key={contact.complete_phone}
                          className={cn(
                            "hover:bg-muted/30 cursor-pointer",
                            isExpanded && "bg-muted/20"
                          )}
                          onClick={() => contact.last_message_sent && toggleRowExpansion(contact.complete_phone)}
                        >
                          <TableCell className="w-10">
                            {contact.last_message_sent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(contact.complete_phone);
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
                            <div className="flex items-center justify-center">
                              {getRankIcon(index + 1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {contact.name || formatPhoneNumber(contact.complete_phone)}
                              </p>
                              {contact.name && (
                                <p className="text-xs text-muted-foreground">
                                  {formatPhoneNumber(contact.complete_phone)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn("font-bold", getScoreColor(contact.score))}>
                              {contact.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 text-amber-500" />
                              <span>{totalInteractions}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MessageCircle className="h-3 w-3 text-blue-500" />
                              <span>{contact.reply_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MousePointerClick className="h-3 w-3 text-green-500" />
                              <span>{contact.positive_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {contact.last_sent_at ? formatDate(contact.last_sent_at) : '-'}
                          </TableCell>
                        </TableRow>
                        {/* Expanded row with message */}
                        {isExpanded && contact.last_message_sent && (
                          <TableRow key={`${contact.complete_phone}-expanded`}>
                            <TableCell colSpan={8} className="bg-muted/10 p-0">
                              <div className="p-4 border-l-4 border-primary/50">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="space-y-1 flex-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Ultima Mensagem Enviada
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded-lg border">
                                      {contact.last_message_sent}
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

          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Como o Score e calculado
            </h4>
            <p className="text-xs text-muted-foreground">
              O score considera: respostas positivas (3 pts), cliques em links (2 pts),
              leitura de mensagens (1 pt), e frequencia de interacao.
              Contatos com score alto sao leads quentes ideais para conversao.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="optouts">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Contato</TableHead>
                  <TableHead>Ultima Campanha</TableHead>
                  <TableHead className="text-center">Msgs Recebidas</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Data Opt-out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!optOutList?.data || optOutList.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum opt-out registrado no periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  optOutList.data.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {contact.name || formatPhoneNumber(contact.complete_phone)}
                          </p>
                          {contact.name && (
                            <p className="text-xs text-muted-foreground">
                              {formatPhoneNumber(contact.complete_phone)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{contact.last_campaign_name || '-'}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                          -
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact.reason ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            {contact.reason}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {contact.created_at ? formatDate(contact.created_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-500">
              <TrendingDown className="h-4 w-4" />
              Contatos na lista de bloqueio
            </h4>
            <p className="text-xs text-muted-foreground">
              Estes contatos solicitaram nao receber mais mensagens.
              Eles sao automaticamente removidos de futuros disparos para garantir
              conformidade e manter a saude da sua base de contatos.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
