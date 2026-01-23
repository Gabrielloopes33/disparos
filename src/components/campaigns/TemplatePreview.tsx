import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Eye, ChevronDown, ChevronUp, Square, CheckSquare } from "lucide-react";
import { type TemplateVariation } from "@/services/gemini";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TemplatePreviewProps {
  template: TemplateVariation;
  isSelected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
}

export function TemplatePreview({ template, isSelected, onSelect, multiSelect = false }: TemplatePreviewProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Gerar preview da mensagem
  const generatePreview = (index: number) => {
    const saudacao = template.saudacoes[index % template.saudacoes.length];
    const corpo = template.corpo[index % template.corpo.length];
    const cta = template.cta[index % template.cta.length];
    const optout = template.optout[index % template.optout.length];

    return `${saudacao} João!\n\n${corpo}\n\n${cta}\n\n${optout}`;
  };

  const currentPreview = generatePreview(previewIndex);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentPreview);
    setCopied(true);
    toast({ title: "Copiado!", description: "Mensagem copiada para a área de transferência" });
    setTimeout(() => setCopied(false), 2000);
  };

  const tomColors: Record<string, string> = {
    casual: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    formal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    urgente: 'bg-red-500/10 text-red-500 border-red-500/20',
    curioso: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {isSelected && <Check className="h-4 w-4 text-primary" />}
              {template.nome}
            </CardTitle>
            <Badge variant="outline" className={tomColors[template.tom] || ''}>
              {template.tom}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preview da mensagem */}
        <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
          {currentPreview}
        </div>

        {/* Navegação entre variações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {template.corpo.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(i);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === previewIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Variação {previewIndex + 1} de {template.corpo.length}
          </span>
        </div>

        {/* Detalhes expandidos */}
        {expanded && (
          <div className="space-y-3 pt-3 border-t animate-fade-in">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Saudações ({template.saudacoes.length})</h4>
              <div className="flex flex-wrap gap-1">
                {template.saudacoes.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">CTAs ({template.cta.length})</h4>
              <div className="space-y-1">
                {template.cta.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {c}</p>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Opt-out ({template.optout.length})</h4>
              <div className="space-y-1">
                {template.optout.map((o, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {o}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Acoes */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {multiSelect ? (
              isSelected ? <CheckSquare className="h-3 w-3 mr-1" /> : <Square className="h-3 w-3 mr-1" />
            ) : (
              isSelected ? <Check className="h-3 w-3 mr-1" /> : null
            )}
            {isSelected ? 'Selecionado' : 'Selecionar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
