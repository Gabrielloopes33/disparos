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
  status: "connected" | "open" | "disconnected" | "connecting" | "opening" | "close" | "qr";
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
  open: {
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
  opening: {
    icon: Wifi,
    label: "Abrindo...",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    dot: "bg-warning animate-pulse",
  },
  close: {
    icon: WifiOff,
    label: "Fechado",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    dot: "bg-destructive",
  },
  qr: {
    icon: Wifi,
    label: "Aguardando QR",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    dot: "bg-warning animate-pulse",
  },
};

export function InstanceCard({ instance, onShowQR, onRestart, onDelete }: InstanceCardProps) {
  if (!instance) return null;

  const validStatus = instance.status in statusConfig ? instance.status : 'disconnected';
  const config = statusConfig[validStatus as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 glass-strong p-6 transition-all duration-300 hover-lift hover:shadow-xl animate-fade-in hover:border-primary/30">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Status Indicator */}
      <div className={cn("absolute top-0 left-4 right-4 h-1 rounded-full", config.dot, instance.status === "connecting" && "animate-shimmer")} />

      <div className="relative">
        <div className="flex items-start justify-between">
          {/* Instance Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
            <Smartphone className="h-7 w-7 text-primary-foreground animate-pulse-slow" />
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 glass-strong"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong border-border/50 w-52 shadow-lg">
              <DropdownMenuItem onClick={onShowQR} className="hover-scale">
                <QrCode className="h-4 w-4 mr-3" />
                Ver QR Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRestart} className="hover-scale">
                <Power className="h-4 w-4 mr-3" />
                Reiniciar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive hover-scale">
                <Trash2 className="h-4 w-4 mr-3" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Instance Info */}
        <div className="mt-5">
          <h3 className="font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent group-hover:text-primary transition-colors">
            {instance.name}
          </h3>
          {instance.phoneNumber && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Smartphone className="h-3 w-3" />
              {instance.phoneNumber}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-6 flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn(
              "gap-2 px-3 py-1.5 rounded-full border hover-scale transition-all duration-300",
              config.bg, 
              config.color
            )}
          >
            <div className={cn("h-2.5 w-2.5 rounded-full", config.dot)} />
            <span className="text-xs font-medium">{config.label}</span>
          </Badge>

          {instance.lastConnected && (
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
              {new Date(instance.lastConnected).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
