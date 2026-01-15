import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstanceCard } from "./InstanceCard";

const mockInstances = [
  {
    id: "1",
    name: "Instância Marketing",
    phoneNumber: "+55 31 99887-7766",
    status: "connected" as const,
    lastConnected: "2026-01-15T18:00:00Z",
  },
  {
    id: "2",
    name: "Vendas 01",
    phoneNumber: "+55 31 98765-4321",
    status: "connected" as const,
    lastConnected: "2026-01-15T17:30:00Z",
  },
  {
    id: "3",
    name: "Suporte",
    phoneNumber: "+55 31 97654-3210",
    status: "disconnected" as const,
    lastConnected: "2026-01-14T12:00:00Z",
  },
  {
    id: "4",
    name: "Promoções",
    phoneNumber: "+55 31 96543-2109",
    status: "connected" as const,
    lastConnected: "2026-01-15T16:45:00Z",
  },
  {
    id: "5",
    name: "Atendimento",
    status: "connecting" as const,
  },
  {
    id: "6",
    name: "SAC Premium",
    phoneNumber: "+55 31 95432-1098",
    status: "connected" as const,
    lastConnected: "2026-01-15T18:30:00Z",
  },
];

export function InstanceGrid() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Instâncias</h2>
          <p className="text-muted-foreground">Gerencie suas conexões WhatsApp</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Instância
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockInstances.map((instance, index) => (
          <div key={instance.id} style={{ animationDelay: `${index * 100}ms` }}>
            <InstanceCard
              instance={instance}
              onShowQR={() => console.log("Show QR", instance.id)}
              onRestart={() => console.log("Restart", instance.id)}
              onDelete={() => console.log("Delete", instance.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
