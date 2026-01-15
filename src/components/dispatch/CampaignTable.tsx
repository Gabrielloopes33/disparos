import { ExternalLink, Download, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";

const campaigns = [
  {
    id: "1",
    name: "Black Friday 2026",
    instance: "Marketing",
    total: 2450,
    sent: 2405,
    errors: 45,
    status: "completed",
    createdAt: "2026-01-15T14:30:00Z",
  },
  {
    id: "2",
    name: "Lista Q1 Marketing",
    instance: "Vendas 01",
    total: 1200,
    sent: 892,
    errors: 12,
    status: "processing",
    createdAt: "2026-01-15T18:45:00Z",
  },
  {
    id: "3",
    name: "Promoção Relâmpago",
    instance: "Promoções",
    total: 500,
    sent: 500,
    errors: 0,
    status: "completed",
    createdAt: "2026-01-14T10:00:00Z",
  },
  {
    id: "4",
    name: "Follow-up Leads",
    instance: "Marketing",
    total: 350,
    sent: 0,
    errors: 0,
    status: "scheduled",
    createdAt: "2026-01-16T09:00:00Z",
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: "Concluída",
    color: "text-success",
    bg: "bg-success/10 border-success/30",
  },
  processing: {
    icon: Clock,
    label: "Em andamento",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
  },
  scheduled: {
    icon: Clock,
    label: "Agendada",
    color: "text-muted-foreground",
    bg: "bg-muted border-border",
  },
  error: {
    icon: AlertCircle,
    label: "Erro",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
  },
};

export function CampaignTable() {
  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Campanhas</h2>
            <p className="text-sm text-muted-foreground">Histórico de disparos</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Campanha</TableHead>
            <TableHead>Instância</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Taxa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const config = statusConfig[campaign.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            const progress = (campaign.sent / campaign.total) * 100;
            const successRate =
              campaign.sent > 0
                ? (((campaign.sent - campaign.errors) / campaign.sent) * 100).toFixed(1)
                : 0;

            return (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="text-muted-foreground">{campaign.instance}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2 w-24" />
                    <span className="text-xs text-muted-foreground">
                      {campaign.sent}/{campaign.total}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-medium",
                      Number(successRate) >= 95 ? "text-success" : "text-warning"
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
                  {new Date(campaign.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
