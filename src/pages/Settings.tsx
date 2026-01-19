import { useState, useEffect } from "react";
import { Key, Globe, Webhook, Shield, Bell, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Zap } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useHealthCheck } from "@/hooks/useN8n";
import { useInstances } from "@/hooks/useEvolution";

const Settings = () => {
  const [n8nUrl, setN8nUrl] = useState(import.meta.env.VITE_N8N_API_URL || '');
  const [n8nToken, setN8nToken] = useState(import.meta.env.VITE_N8N_API_TOKEN || '');
  const [evolutionUrl, setEvolutionUrl] = useState(import.meta.env.VITE_EVOLUTION_API_URL || '');
  const [evolutionKey, setEvolutionKey] = useState(import.meta.env.VITE_EVOLUTION_API_KEY || '');

  const { data: n8nHealth, isLoading: n8nLoading, error: n8nError } = useHealthCheck();
  const { data: instances, isLoading: instancesLoading } = useInstances();

  const [testResults, setTestResults] = useState({
    n8n: null as boolean | null,
    evolution: null as boolean | null,
  });

  const testConnection = async (service: 'n8n' | 'evolution') => {
    if (service === 'n8n') {
      try {
        const response = await fetch(`${n8nUrl}/healthz`);
        const isHealthy = response.ok;
        setTestResults(prev => ({ ...prev, n8n: isHealthy }));
        
        if (isHealthy) {
          toast.success('Conexão com n8n estabelecida!');
        } else {
          toast.error('Falha na conexão com n8n');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, n8n: false }));
        toast.error('Falha na conexão com n8n');
      }
    } else if (service === 'evolution') {
      try {
        const response = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
          headers: {
            'apikey': evolutionKey,
          },
        });
        const isHealthy = response.ok;
        setTestResults(prev => ({ ...prev, evolution: isHealthy }));
        
        if (isHealthy) {
          toast.success('Conexão com Evolution API estabelecida!');
        } else {
          toast.error('Falha na conexão com Evolution API');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, evolution: false }));
        toast.error('Falha na conexão com Evolution API');
      }
    }
  };

  const saveConfiguration = () => {
    // In a real implementation, this would save to a backend
    // For now, we'll just show a success message
    toast.success('Configuração salva com sucesso!');
    
    // Update environment variables in memory (not persistent)
    if (n8nUrl) import.meta.env.VITE_N8N_API_URL = n8nUrl;
    if (n8nToken) import.meta.env.VITE_N8N_API_TOKEN = n8nToken;
    if (evolutionUrl) import.meta.env.VITE_EVOLUTION_API_URL = evolutionUrl;
    if (evolutionKey) import.meta.env.VITE_EVOLUTION_API_KEY = evolutionKey;
  };

  const getN8nStatus = () => {
    if (testResults.n8n === true) return { text: 'Conectado', color: 'success', icon: CheckCircle2 };
    if (testResults.n8n === false) return { text: 'Falha', color: 'destructive', icon: XCircle };
    if (n8nLoading) return { text: 'Testando...', color: 'warning', icon: RefreshCw };
    if (n8nError) return { text: 'Offline', color: 'destructive', icon: XCircle };
    if (n8nHealth?.status === 'healthy') return { text: 'Online', color: 'success', icon: CheckCircle2 };
    return { text: 'Desconhecido', color: 'warning', icon: AlertTriangle };
  };

  const getEvolutionStatus = () => {
    if (testResults.evolution === true) return { text: 'Conectado', color: 'success', icon: CheckCircle2 };
    if (testResults.evolution === false) return { text: 'Falha', color: 'destructive', icon: XCircle };
    if (instancesLoading) return { text: 'Testando...', color: 'warning', icon: RefreshCw };
    return { text: 'Desconhecido', color: 'warning', icon: AlertTriangle };
  };

  const n8nStatus = getN8nStatus();
  const evolutionStatus = getEvolutionStatus();

  return (
    <MainLayout>
      <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-2">Configure suas integrações com n8n e Evolution API</p>
        </div>

        {/* Connection Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">n8n Status</CardTitle>
              <Webhook className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <n8nStatus.icon className={`h-5 w-5 text-${n8nStatus.color}`} />
                <span className="font-medium">{n8nStatus.text}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {n8nUrl || 'URL não configurada'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => testConnection('n8n')}
                disabled={n8nLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${n8nLoading ? 'animate-spin' : ''}`} />
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Evolution API Status</CardTitle>
              <Zap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <evolutionStatus.icon className={`h-5 w-5 text-${evolutionStatus.color}`} />
                <span className="font-medium">{evolutionStatus.text}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {instances ? `${instances.length} instância(s)` : 'URL não configurada'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => testConnection('evolution')}
                disabled={instancesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${instancesLoading ? 'animate-spin' : ''}`} />
                Testar Conexão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configurações de API
            </CardTitle>
            <CardDescription>
              Configure as URLs e chaves de acesso para suas APIs. 
              Certifique-se de que os serviços estejam rodando antes de testar as conexões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="n8n" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="n8n">n8n</TabsTrigger>
                <TabsTrigger value="evolution">Evolution API</TabsTrigger>
              </TabsList>

              <TabsContent value="n8n" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="n8n-url">URL da API n8n</Label>
                  <Input
                    id="n8n-url"
                    placeholder="http://localhost:5678"
                    value={n8nUrl}
                    onChange={(e) => setN8nUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    URL onde sua instância n8n está rodando
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="n8n-token">Token da API n8n</Label>
                  <Input
                    id="n8n-token"
                    type="password"
                    placeholder="seu_token_de_api_aqui"
                    value={n8nToken}
                    onChange={(e) => setN8nToken(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Token gerado nas configurações de usuário do n8n
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="evolution" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="evolution-url">URL da Evolution API</Label>
                  <Input
                    id="evolution-url"
                    placeholder="http://localhost:8080"
                    value={evolutionUrl}
                    onChange={(e) => setEvolutionUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    URL onde sua instância Evolution API está rodando
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolution-key">Chave da Evolution API</Label>
                  <Input
                    id="evolution-key"
                    type="password"
                    placeholder="sua_chave_de_api_aqui"
                    value={evolutionKey}
                    onChange={(e) => setEvolutionKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Chave de API configurada no seu servidor Evolution
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-6">
              <Button onClick={saveConfiguration} className="gradient-primary">
                <Key className="h-4 w-4 mr-2" />
                Salvar Configuração
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Para conectar com dados reais, você precisa:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Ter o n8n rodando na porta padrão (5678)</li>
              <li>Ter o Evolution API rodando na porta padrão (8080)</li>
              <li>Copiar o arquivo .env.example para .env e preencher suas credenciais</li>
              <li>Reiniciar a aplicação após alterar as variáveis de ambiente</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </MainLayout>
  );
}

export default Settings;
