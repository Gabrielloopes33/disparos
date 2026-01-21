import { Plus, Smartphone, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstanceCard } from "./InstanceCard";
import { useInstances, useConnectInstance, useDeleteInstance } from "@/hooks/useEvolution";
import { EvolutionInstance } from "@/types/evolution";
import { toast } from "sonner";

interface Instance {
  id: string;
  name: string;
  phoneNumber?: string;
  status: "connected" | "open" | "disconnected" | "connecting" | "opening" | "close" | "qr";
  lastConnected?: string;
}

function mapEvolutionInstanceToCard(instance: EvolutionInstance) {
  return {
    id: instance.name,
    name: instance.name,
    phoneNumber: instance.number ? `+${instance.number}` : undefined,
    status: (instance.connectionStatus || 'disconnected') as Instance['status'],
    lastConnected: instance.updatedAt,
  };
}

export function InstanceGrid() {
  const { data: instances, isLoading, error } = useInstances();
  const connectMutation = useConnectInstance();
  const deleteMutation = useDeleteInstance();

  const handleShowQR = async (instanceName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
        headers: {
          'apikey': import.meta.env.VITE_EVOLUTION_API_KEY || '',
        },
      });
      const data = await response.json();
      
      if (data.response?.base64) {
        // Abrir QR code em uma nova janela
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>QR Code - ${instanceName}</title></head>
              <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#1a1a1a;">
                <div style="text-align:center;">
                  <img src="data:image/png;base64,${data.response.base64}" style="max-width:300px;" />
                  <h3 style="color:white;margin-top:20px;">${instanceName}</h3>
                  <p style="color:#999;">Escaneie este QR Code com seu WhatsApp</p>
                </div>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      toast.error('Falha ao obter QR Code');
      console.error('QR Code error:', error);
    }
  };

  const handleConnect = async (instanceName: string) => {
    try {
      await connectMutation.mutateAsync(instanceName);
      toast.success('Conectando instância...');
    } catch (error) {
      toast.error('Falha ao conectar instância');
      console.error('Connect error:', error);
    }
  };

  const handleDelete = async (instanceName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a instância "${instanceName}"?`)) {
      try {
        await deleteMutation.mutateAsync(instanceName);
        toast.success('Instância excluída com sucesso');
      } catch (error) {
        toast.error('Falha ao excluir instância');
        console.error('Delete error:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Instâncias
            </h2>
            <p className="text-muted-foreground mt-2">Gerencie suas conexões WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Instâncias
            </h2>
            <p className="text-muted-foreground mt-2">Gerencie suas conexões WhatsApp</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Falha ao carregar instâncias</h3>
            <p className="text-muted-foreground">
              Verifique sua conexão com a Evolution API e tente novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const instancesMapped = (instances || []).map(mapEvolutionInstanceToCard);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Instâncias
          </h2>
          <p className="text-muted-foreground mt-2">
            {instancesMapped.length > 0 
              ? `${instancesMapped.length} instância(s) ativa(s)`
              : 'Gerencie suas conexões WhatsApp'
            }
          </p>
        </div>
        <Button className="gradient-primary gap-2 hover-scale shadow-lg text-sm sm:text-base px-4 sm:px-6 h-10 sm:h-11">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Instância</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {instancesMapped.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma instância encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira instância para começar a usar o WhatsApp Evolution.
            </p>
            <Button className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Criar Instância
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {instancesMapped.map((instance, index) => (
            <div 
              key={instance.id} 
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-slide-up"
            >
              <InstanceCard
                instance={instance}
                onShowQR={() => handleShowQR(instance.id)}
                onRestart={() => handleConnect(instance.id)}
                onDelete={() => handleDelete(instance.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
