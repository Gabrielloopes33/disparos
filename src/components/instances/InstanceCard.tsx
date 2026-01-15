import { Smartphone, Wifi, WifiOff, MoreVertical, QrCode, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Instance {
  id: string;
  name: string;
  phoneNumber?: string;
  status: "connected" | "disconnected" | "connecting";
  lastConnected?: string;
}

interface InstanceCardProps {
  instance: Instance;
  onShowQR?: () => void;
  onRestart?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  connected: {
    icon: Wifi,
    label: "Conectado",
    color: "text-success",
    bg: "bg-success/10 border-success/20",
    dot: "bg-success",
  },
  disconnected: {
    icon: WifiOff,
    label: "Desconectado",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    dot: "bg-destructive",
  },
  connecting: {
    icon: Wifi,
    label: "Conectando...",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    dot: "bg-warning animate-pulse",
  },
};

export function InstanceCard({ instance, onShowQR, onRestart, onDelete }: InstanceCardProps) {
  const config = statusConfig[instance.status];
  const StatusIcon = config.icon;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 animate-scale-in">
      {/* Status Indicator */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", config.dot)} />

      <div className="flex items-start justify-between">
        {/* Instance Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onShowQR}>
              <QrCode className="h-4 w-4 mr-2" />
              Ver QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRestart}>
              <Power className="h-4 w-4 mr-2" />
              Reiniciar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Instance Info */}
      <div className="mt-4">
        <h3 className="font-semibold text-lg">{instance.name}</h3>
        {instance.phoneNumber && (
          <p className="text-sm text-muted-foreground mt-1">{instance.phoneNumber}</p>
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline" className={cn("gap-1.5", config.bg, config.color)}>
          <div className={cn("h-2 w-2 rounded-full", config.dot)} />
          {config.label}
        </Badge>

        {instance.lastConnected && (
          <span className="text-xs text-muted-foreground">
            {new Date(instance.lastConnected).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>
    </div>
  );
}
