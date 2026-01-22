import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trash2, Eye, MoreVertical, Rocket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// TODO: Buscar campanhas do Supabase
const mockCampaigns = [
  {
    id: '1',
    nome: 'Live Marketing 2026',
    tema: 'Live de Marketing Digital',
    status: 'ativa',
    enviados: 156,
    total: 500,
    criadaEm: '2026-01-20',
  },
  {
    id: '2',
    nome: 'Reativação Q1',
    tema: 'Reativação de leads frios',
    status: 'pausada',
    enviados: 89,
    total: 300,
    criadaEm: '2026-01-18',
  },
  {
    id: '3',
    nome: 'Lançamento Produto X',
    tema: 'Pré-venda exclusiva',
    status: 'finalizada',
    enviados: 1200,
    total: 1200,
    criadaEm: '2026-01-15',
  },
];

export function CampaignList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pausada':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'finalizada':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Em andamento';
      case 'pausada':
        return 'Pausada';
      case 'finalizada':
        return 'Finalizada';
      default:
        return status;
    }
  };

  if (mockCampaigns.length === 0) {
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
      {mockCampaigns.map((campaign) => (
        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{campaign.nome}</h3>
                  <Badge variant="outline" className={getStatusColor(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{campaign.tema}</p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{campaign.enviados} enviados</span>
                    <span>{campaign.total} total</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(campaign.enviados / campaign.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((campaign.enviados / campaign.total) * 100)}% concluído
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {campaign.status === 'ativa' && (
                  <Button variant="outline" size="sm" className="gap-1">
                    <Pause className="h-3 w-3" />
                    Pausar
                  </Button>
                )}
                {campaign.status === 'pausada' && (
                  <Button variant="outline" size="sm" className="gap-1 text-green-600 border-green-600 hover:bg-green-50">
                    <Play className="h-3 w-3" />
                    Retomar
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
