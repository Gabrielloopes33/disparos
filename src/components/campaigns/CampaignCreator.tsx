import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Eye, Save, Play, RefreshCw, Copy, Check } from "lucide-react";
import { geminiService, type CampaignData, type TemplateVariation } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import { TemplatePreview } from "./TemplatePreview";

export function CampaignCreator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'config' | 'templates' | 'review'>('config');

  // Form state
  const [campaignData, setCampaignData] = useState<CampaignData>({
    tema: '',
    objetivo: '',
    dataEvento: '',
    link: '',
    detalhes: '',
  });

  // Generated templates
  const [templates, setTemplates] = useState<TemplateVariation[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const handleInputChange = (field: keyof CampaignData, value: string) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateTemplates = async () => {
    if (!campaignData.tema || !campaignData.objetivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o tema e objetivo da campanha",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await geminiService.generateTemplates(campaignData);

      if (response.success && response.templates?.templates) {
        setTemplates(response.templates.templates);
        setStep('templates');
        toast({
          title: "Templates gerados!",
          description: `${response.templates.templates.length} variações criadas com sucesso`,
        });
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      console.error('Error generating templates:', error);
      toast({
        title: "Erro ao gerar templates",
        description: "Tente novamente ou ajuste os parâmetros",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplate(index);
  };

  const handleSaveCampaign = async () => {
    if (selectedTemplate === null) {
      toast({
        title: "Selecione um template",
        description: "Escolha um template antes de salvar",
        variant: "destructive",
      });
      return;
    }

    // TODO: Salvar no Supabase
    toast({
      title: "Campanha salva!",
      description: "Campanha pronta para iniciar disparo",
    });
    setStep('review');
  };

  const handleStartDispatch = async () => {
    // TODO: Integrar com n8n para iniciar disparo
    toast({
      title: "Disparo iniciado!",
      description: "O workflow do n8n foi acionado",
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {['config', 'templates', 'review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : i < ['config', 'templates', 'review'].indexOf(step)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'font-medium' : 'text-muted-foreground'}`}>
              {s === 'config' && 'Configuração'}
              {s === 'templates' && 'Templates'}
              {s === 'review' && 'Revisar'}
            </span>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Configuration */}
      {step === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Configurar Campanha
            </CardTitle>
            <CardDescription>
              Defina os parâmetros para a IA gerar os templates de mensagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema da Campanha *</Label>
                <Input
                  id="tema"
                  placeholder="Ex: Live de Marketing Digital 2026"
                  value={campaignData.tema}
                  onChange={(e) => handleInputChange('tema', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo *</Label>
                <Select
                  value={campaignData.objetivo}
                  onValueChange={(value) => handleInputChange('objetivo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engajar">Engajar leads frios</SelectItem>
                    <SelectItem value="convidar">Convidar para evento</SelectItem>
                    <SelectItem value="vender">Venda direta</SelectItem>
                    <SelectItem value="reativar">Reativar contatos</SelectItem>
                    <SelectItem value="nutrir">Nutrir relacionamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEvento">Data do Evento (opcional)</Label>
                <Input
                  id="dataEvento"
                  placeholder="Ex: 20/01 às 20h"
                  value={campaignData.dataEvento}
                  onChange={(e) => handleInputChange('dataEvento', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link (opcional)</Label>
                <Input
                  id="link"
                  placeholder="Ex: https://seusite.com/live"
                  value={campaignData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O link não será enviado diretamente - a mensagem pedirá permissão primeiro
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detalhes">Detalhes Adicionais</Label>
              <Textarea
                id="detalhes"
                placeholder="Informações extras que a IA deve considerar ao gerar as mensagens..."
                value={campaignData.detalhes}
                onChange={(e) => handleInputChange('detalhes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleGenerateTemplates}
                disabled={isGenerating || !campaignData.tema || !campaignData.objetivo}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar Templates com IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Templates */}
      {step === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep('config')}>
              Voltar
            </Button>
            <Button variant="outline" onClick={handleGenerateTemplates} disabled={isGenerating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <TemplatePreview
                key={template.id}
                template={template}
                isSelected={selectedTemplate === index}
                onSelect={() => handleSelectTemplate(index)}
              />
            ))}
          </div>

          {templates.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleSaveCampaign}
                disabled={selectedTemplate === null}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar e Continuar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Launch */}
      {step === 'review' && selectedTemplate !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar e Iniciar Disparo</CardTitle>
            <CardDescription>
              Confira os detalhes antes de iniciar o disparo em massa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Detalhes da Campanha</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tema:</span>
                    <span>{campaignData.tema}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Objetivo:</span>
                    <span>{campaignData.objetivo}</span>
                  </div>
                  {campaignData.dataEvento && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span>{campaignData.dataEvento}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <Badge>{templates[selectedTemplate].tom}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Configurações de Disparo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intervalo:</span>
                    <span>120-300 segundos (aleatório)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variações:</span>
                    <span>{templates[selectedTemplate].corpo.length} mensagens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instância:</span>
                    <span>3 CODIRECT - 5453</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep('templates')}>
                Voltar
              </Button>
              <Button onClick={handleStartDispatch} className="gap-2 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4" />
                Iniciar Disparo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
