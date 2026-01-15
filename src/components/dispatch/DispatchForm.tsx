import { useState } from "react";
import { Upload, Send, Users, FileSpreadsheet, Calendar, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function DispatchForm() {
  const [targetType, setTargetType] = useState<"csv" | "groups">("csv");
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    // Handle file drop
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Novo Disparo</h2>
          <p className="text-sm text-muted-foreground">Configure e envie mensagens em massa</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Instance Selection */}
        <div className="space-y-2">
          <Label>Instância</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma instância" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketing">Instância Marketing</SelectItem>
              <SelectItem value="vendas01">Vendas 01</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="promocoes">Promoções</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Type Tabs */}
        <Tabs value={targetType} onValueChange={(v) => setTargetType(v as "csv" | "groups")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Lista CSV
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="mt-4">
            {/* File Upload */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Arraste seu arquivo CSV aqui</p>
                  <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                </div>
                <Button variant="outline" size="sm">
                  Selecionar Arquivo
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendas">Grupo Vendas</SelectItem>
                <SelectItem value="marketing">Grupo Marketing</SelectItem>
                <SelectItem value="suporte">Grupo Suporte</SelectItem>
              </SelectContent>
            </Select>
          </TabsContent>
        </Tabs>

        {/* Message Editor */}
        <div className="space-y-2">
          <Label>Mensagem</Label>
          <Textarea
            placeholder="Olá {{nome}}, tudo bom? Use variáveis entre {{chaves}}..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] resize-none"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Variáveis disponíveis:</span>
            <code className="px-1.5 py-0.5 rounded bg-muted">{"{{nome}}"}</code>
            <code className="px-1.5 py-0.5 rounded bg-muted">{"{{telefone}}"}</code>
          </div>
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <Label>Anexo (opcional)</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Adicionar Anexo
            </Button>
            <span className="text-sm text-muted-foreground">PDF, Imagem ou Vídeo</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <Label>Agendamento (opcional)</Label>
          <div className="flex items-center gap-3">
            <Input type="datetime-local" className="w-auto" />
            <Button variant="ghost" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Enviar agora
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button variant="outline">Salvar Rascunho</Button>
          <Button className="flex-1 gap-2">
            <Send className="h-4 w-4" />
            Iniciar Disparo
          </Button>
        </div>
      </div>
    </div>
  );
}
