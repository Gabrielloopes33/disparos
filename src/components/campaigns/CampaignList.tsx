import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trash2, Eye, MoreVertical, Rocket, BarChart3, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCampaigns, useDeleteCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";

export function CampaignList() {
  const navigate = useNavigate();
  const { data: campaignsData, isLoading } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  const campaigns = campaignsData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'paused':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'draft':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em andamento';
      case 'paused':
        return 'Pausada';
      case 'completed':
        return 'Finalizada';
      case 'draft':
        return 'Rascunho';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handlePause = (id: string) => {
    updateCampaign.mutate({ id, updates: { status: 'paused' } });
  };

  const handleResume = (id: string) => {
    updateCampaign.mutate({ id, updates: { status: 'active' } });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      deleteCampaign.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando campanhas...</p>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Rocket className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma campanha criada</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Crie sua primeira campanha de disparo com templates gerados por IA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const total = campaign.total_sent || 1;
        const delivered = campaign.delivered_count || 0;
        const progress = total > 0 ? (delivered / total) * 100 : 0;

        return (
          <Card
            key={campaign.id}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(`/campaigns/${campaign.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{campaign.name}</h3>
                    <Badge variant="outline" className={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{campaign.tema || campaign.objetivo || 'Sem descricao'}</p>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{delivered.toLocaleString('pt-BR')} entregues</span>
                      <span>{total.toLocaleString('pt-BR')} enviados</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(progress)}% entregues
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  {campaign.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handlePause(campaign.id)}
                      disabled={updateCampaign.isPending}
                    >
                      <Pause className="h-3 w-3" />
                      Pausar
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleResume(campaign.id)}
                      disabled={updateCampaign.isPending}
                    >
                      <Play className="h-3 w-3" />
                      Retomar
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <BarChart3 className="h-3 w-3" />
                    Metricas
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
