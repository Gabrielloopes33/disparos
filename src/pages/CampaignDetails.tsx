import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CampaignMetrics } from "@/components/campaigns/CampaignMetrics";
import { CampaignFunnel } from "@/components/campaigns/CampaignFunnel";
import { CampaignContactsTable, ContactLog, MessageStatus, InteractionType } from "@/components/campaigns/CampaignContactsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Download,
  Calendar,
  MessageSquare,
  Users,
} from "lucide-react";
import { useCampaign, useCampaignContacts } from "@/hooks/useCampaigns";

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch real data from Supabase
  const { data: campaign, isLoading: loadingCampaign } = useCampaign(id);
  const { data: contactsData, isLoading: loadingContacts } = useCampaignContacts(id, pageSize, (page - 1) * pageSize);

  const loading = loadingCampaign || loadingContacts;

  // Use metrics from the campaign table itself (consolidated metrics)
  const metrics = useMemo(() => ({
    totalSent: campaign?.total_sent || 0,
    delivered: campaign?.delivered_count || 0,
    read: campaign?.read_count || 0,
    positiveInteractions: campaign?.positive_interaction_count || 0,
    optOuts: campaign?.opt_out_count || 0,
    linkClicks: campaign?.link_click_count || 0,
  }), [campaign]);

  const funnelData = useMemo(() => ({
    totalSent: campaign?.total_sent || 0,
    delivered: campaign?.delivered_count || 0,
    read: campaign?.read_count || 0,
    interacted: campaign?.positive_interaction_count || 0,
  }), [campaign]);

  // Transform contacts for the table
  const contacts: ContactLog[] = useMemo(() => {
    if (!contactsData?.data) return [];
    return contactsData.data.map((lead) => ({
      id: lead.id?.toString() || lead.complete_phone || '',
      contactNumber: lead.complete_phone || '',
      contactName: lead.name || undefined,
      status: (lead.delivery_status || 'sent') as MessageStatus,
      interactionType: (lead.interaction_type || 'none') as InteractionType,
      lastUpdatedAt: lead.status_updated_at || lead.sent_at || new Date().toISOString(),
      messageSent: lead["ULTIMA MENSAGEM ENVIADA"],
    }));
  }, [contactsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "draft":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Em andamento";
      case "paused":
        return "Pausada";
      case "completed":
        return "Finalizada";
      case "draft":
        return "Rascunho";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/campaigns")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Campanhas
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{campaign?.name || 'Carregando...'}</h1>
                {campaign && (
                  <Badge variant="outline" className={getStatusColor(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{campaign?.tema || ''}</p>
            </div>

            <div className="flex items-center gap-2">
              {campaign?.status === "active" && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
              )}
              {campaign?.status === "paused" && (
                <Button variant="outline" size="sm" className="gap-2 text-green-600 border-green-600 hover:bg-green-50">
                  <Play className="h-4 w-4" />
                  Retomar
                </Button>
              )}
              {campaign?.status === "completed" && (
                <Button variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reenviar
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Campaign Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Criada em</p>
                <p className="font-medium">{campaign?.created_at ? formatDate(campaign.created_at) : '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Contatos</p>
                <p className="font-medium">{metrics.totalSent.toLocaleString("pt-BR")} leads</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <MessageSquare className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Template</p>
                <p className="font-medium truncate max-w-[200px]" title={campaign?.message_template || ''}>
                  {campaign?.message_template ? campaign.message_template.substring(0, 30) + '...' : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics */}
        <div className="animate-fade-in">
          <CampaignMetrics data={metrics} loading={loading} />
        </div>

        {/* Funnel and Template */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <CampaignFunnel data={funnelData} loading={loading} />

          <Card className="glass-strong border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Mensagem Enviada
              </CardTitle>
              <CardDescription>Template utilizado na campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {campaign?.message_template || 'Nenhum template definido'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Table */}
        <div className="animate-fade-in">
          <CampaignContactsTable
            contacts={contacts}
            loading={loadingContacts}
            totalCount={contactsData?.count}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CampaignDetails;
