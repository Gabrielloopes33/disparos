import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CampaignMetrics, CampaignMetricsData } from "@/components/campaigns/CampaignMetrics";
import { CampaignFunnel, FunnelData } from "@/components/campaigns/CampaignFunnel";
import { CampaignContactsTable, ContactLog } from "@/components/campaigns/CampaignContactsTable";
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
import { cn } from "@/lib/utils";

// Mock data - TODO: Buscar do Supabase baseado no ID
const mockCampaignData = {
  id: "1",
  nome: "Live Marketing 2026",
  tema: "Live de Marketing Digital",
  status: "ativa" as const,
  criadaEm: "2026-01-20T10:30:00Z",
  template: "Ola {{nome}}! Participe da nossa Live de Marketing Digital amanha as 19h. Sera incrivel! Link: https://live.exemplo.com",
};

const mockMetrics: CampaignMetricsData = {
  totalSent: 500,
  delivered: 485,
  read: 312,
  positiveInteractions: 89,
  optOuts: 12,
  linkClicks: 156,
};

const mockFunnelData: FunnelData = {
  totalSent: 500,
  delivered: 485,
  read: 312,
  interacted: 89,
};

const mockContacts: ContactLog[] = [
  {
    id: "1",
    contactNumber: "5511999887766",
    contactName: "Maria Silva",
    status: "read",
    interactionType: "positive_reply",
    lastUpdatedAt: "2026-01-23T14:30:00Z",
    messageSent: "Ola Maria! Tudo bem?\n\nVoce esta convidada para nossa Live de Marketing Digital amanha as 19h. Vamos falar sobre as melhores estrategias para 2026!\n\nPosso te enviar o link?\n\nSe nao quiser mais receber, e so responder SAIR.",
  },
  {
    id: "2",
    contactNumber: "5511988776655",
    contactName: "Joao Santos",
    status: "delivered",
    interactionType: "none",
    lastUpdatedAt: "2026-01-23T14:25:00Z",
    messageSent: "E ai Joao! Beleza?\n\nTemos uma Live especial de Marketing Digital acontecendo amanha as 19h. Vai ser show!\n\nQuer participar? Responde SIM que te mando o link.\n\nPara parar de receber, responda PARAR.",
  },
  {
    id: "3",
    contactNumber: "5511977665544",
    contactName: "Ana Costa",
    status: "read",
    interactionType: "click",
    lastUpdatedAt: "2026-01-23T14:20:00Z",
    messageSent: "Oi Ana!\n\nAmanha as 19h teremos uma Live imperdivel sobre Marketing Digital. Vamos revelar as tendencias que vao dominar 2026!\n\nQuer saber mais? Me avisa!\n\nSe preferir nao receber mais mensagens, responda SAIR.",
  },
  {
    id: "4",
    contactNumber: "5511966554433",
    status: "read",
    interactionType: "opt-out",
    lastUpdatedAt: "2026-01-23T14:15:00Z",
    messageSent: "Ola! Tudo bem?\n\nConvite especial: Live de Marketing Digital amanha as 19h!\n\nInteressado? Responde aqui!\n\nPara nao receber mais, responda PARAR.",
  },
  {
    id: "5",
    contactNumber: "5511955443322",
    contactName: "Pedro Lima",
    status: "failed",
    interactionType: "none",
    lastUpdatedAt: "2026-01-23T14:10:00Z",
    messageSent: "Fala Pedro!\n\nLive de Marketing Digital amanha as 19h - vai perder essa?\n\nQuer o link? Me avisa!\n\nResponda SAIR para nao receber mais.",
  },
  {
    id: "6",
    contactNumber: "5511944332211",
    contactName: "Carla Mendes",
    status: "read",
    interactionType: "reply",
    lastUpdatedAt: "2026-01-23T14:05:00Z",
    messageSent: "Oi Carla! Como voce esta?\n\nAmanha tem Live de Marketing Digital as 19h. Conteudo exclusivo sobre estrategias que funcionam!\n\nPosso contar com voce? Responde SIM!\n\nSe nao quiser mais receber, responda PARAR.",
  },
  {
    id: "7",
    contactNumber: "5511933221100",
    contactName: "Lucas Ferreira",
    status: "delivered",
    interactionType: "none",
    lastUpdatedAt: "2026-01-23T14:00:00Z",
    messageSent: "E ai Lucas!\n\nConvite VIP: Live de Marketing Digital amanha 19h!\n\nBora? Me avisa que mando o link.\n\nPara parar, responda SAIR.",
  },
  {
    id: "8",
    contactNumber: "5511922110099",
    contactName: "Julia Almeida",
    status: "read",
    interactionType: "positive_reply",
    lastUpdatedAt: "2026-01-23T13:55:00Z",
    messageSent: "Ola Julia!\n\nPrepara que amanha as 19h tem Live de Marketing Digital! Vou compartilhar insights que vao transformar seus resultados.\n\nQuer participar? Responda SIM!\n\nSe preferir nao receber mais, e so mandar PARAR.",
  },
];

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // TODO: Buscar dados reais do Supabase
  const campaign = mockCampaignData;
  const metrics = mockMetrics;
  const funnelData = mockFunnelData;
  const contacts = mockContacts;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pausada":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "finalizada":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativa":
        return "Em andamento";
      case "pausada":
        return "Pausada";
      case "finalizada":
        return "Finalizada";
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
                <h1 className="text-3xl font-bold">{campaign.nome}</h1>
                <Badge variant="outline" className={getStatusColor(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{campaign.tema}</p>
            </div>

            <div className="flex items-center gap-2">
              {campaign.status === "ativa" && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
              )}
              {campaign.status === "pausada" && (
                <Button variant="outline" size="sm" className="gap-2 text-green-600 border-green-600 hover:bg-green-50">
                  <Play className="h-4 w-4" />
                  Retomar
                </Button>
              )}
              {campaign.status === "finalizada" && (
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
                <p className="font-medium">{formatDate(campaign.criadaEm)}</p>
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
                <p className="font-medium truncate max-w-[200px]" title={campaign.template}>
                  {campaign.template.substring(0, 30)}...
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
                  {campaign.template}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Table */}
        <div className="animate-fade-in">
          <CampaignContactsTable
            contacts={contacts}
            loading={loading}
            page={page}
            pageSize={20}
            onPageChange={setPage}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CampaignDetails;
