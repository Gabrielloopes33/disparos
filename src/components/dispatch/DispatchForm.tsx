import { useState, useRef } from "react";
import { Upload, Send, Users, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Image, X, FileVideo, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useInstances, useGroups, useSendMessageMutation, useSendMediaMutation } from "@/hooks/useEvolution";
import { useDispatchLogs } from "@/hooks/useDispatchLogs";
import { toast } from "sonner";
import { EvolutionGroup } from "@/types/evolution";

type MediaType = 'image' | 'video' | 'document' | null;

interface SelectedMedia {
  file: File;
  type: MediaType;
  preview: string;
  base64: string;
  mimetype: string;
}

export function DispatchForm() {
  const [targetType, setTargetType] = useState<"csv" | "groups">("groups");
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [mentionEveryone, setMentionEveryone] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; current?: string }>({ sent: 0, total: 0 });
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch instances
  const { data: instances, isLoading: loadingInstances } = useInstances();

  // Fetch groups when instance is selected
  const { data: groups, isLoading: loadingGroups, refetch: refetchGroups } = useGroups(selectedInstance);

  // Send message mutation
  const sendMessageMutation = useSendMessageMutation(selectedInstance);
  const sendMediaMutation = useSendMediaMutation(selectedInstance);

  // Dispatch logs
  const { createDispatch, updateTarget, completeDispatch } = useDispatchLogs();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo: 16MB");
      return;
    }

    let mediaType: MediaType = null;

    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    } else if (file.type === 'application/pdf' || file.type.includes('document')) {
      mediaType = 'document';
    } else {
      toast.error("Tipo de arquivo não suportado. Use imagem, vídeo ou PDF.");
      return;
    }

    // Convert to base64
    const base64 = await fileToBase64(file);

    // Create preview URL
    const preview = URL.createObjectURL(file);

    setSelectedMedia({
      file,
      type: mediaType,
      preview,
      base64,
      mimetype: file.type,
    });

    toast.success(`${mediaType === 'image' ? 'Imagem' : mediaType === 'video' ? 'Vídeo' : 'Documento'} selecionado`);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const removeMedia = () => {
    if (selectedMedia?.preview) {
      URL.revokeObjectURL(selectedMedia.preview);
    }
    setSelectedMedia(null);
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectAllGroups = () => {
    if (groups) {
      setSelectedGroups(groups.map(g => g.id));
    }
  };

  const deselectAllGroups = () => {
    setSelectedGroups([]);
  };

  const handleDispatch = async () => {
    if (!selectedInstance) {
      toast.error("Selecione uma instância");
      return;
    }

    if (selectedGroups.length === 0) {
      toast.error("Selecione pelo menos um grupo");
      return;
    }

    if (!message.trim() && !selectedMedia) {
      toast.error("Digite uma mensagem ou selecione uma mídia");
      return;
    }

    setIsSending(true);
    setSendProgress({ sent: 0, total: selectedGroups.length });

    // Create dispatch log
    const targets = selectedGroups.map(groupId => {
      const group = groups?.find(g => g.id === groupId);
      return {
        id: groupId,
        name: group?.subject || groupId,
      };
    });

    const dispatchLog = createDispatch({
      instanceName: selectedInstance,
      type: 'groups',
      message: selectedMedia ? `[${selectedMedia.type?.toUpperCase()}] ${message}` : message,
      targets,
      mentionEveryone,
    });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedGroups.length; i++) {
      const groupId = selectedGroups[i];
      const group = groups?.find(g => g.id === groupId);

      setSendProgress({
        sent: i,
        total: selectedGroups.length,
        current: group?.subject || groupId
      });

      try {
        // If we have media, send media with caption
        if (selectedMedia && selectedMedia.type) {
          // Remove the data URL prefix if present (Evolution API expects raw base64)
          const base64Data = selectedMedia.base64.includes(',')
            ? selectedMedia.base64.split(',')[1]
            : selectedMedia.base64;

          await sendMediaMutation.mutateAsync({
            remoteJid: groupId,
            mediaType: selectedMedia.type,
            media: base64Data,
            caption: message || undefined,
            fileName: selectedMedia.file.name,
            mimetype: selectedMedia.mimetype,
            mentionsEveryOne: mentionEveryone,
          });
        } else {
          // Send text only
          await sendMessageMutation.mutateAsync({
            remoteJid: groupId,
            messageText: message,
            options: {
              mentionsEveryOne: mentionEveryone,
            },
          });
        }
        successCount++;

        // Update log target status
        updateTarget(dispatchLog.id, groupId, 'sent');

        // Delay between messages to avoid rate limiting
        if (i < selectedGroups.length - 1) {
          await new Promise(resolve => setTimeout(resolve, selectedMedia ? 3000 : 2000));
        }
      } catch (error) {
        console.error(`Erro ao enviar para ${groupId}:`, error);
        errorCount++;

        // Update log target status with error
        updateTarget(
          dispatchLog.id,
          groupId,
          'failed',
          error instanceof Error ? error.message : 'Erro desconhecido'
        );
      }
    }

    // Complete the dispatch log
    completeDispatch(
      dispatchLog.id,
      errorCount === selectedGroups.length ? 'failed' : 'completed'
    );

    setSendProgress({ sent: selectedGroups.length, total: selectedGroups.length });
    setIsSending(false);

    if (errorCount === 0) {
      toast.success(`Disparo concluído! ${successCount} mensagens enviadas.`);
    } else {
      toast.warning(`Disparo concluído com erros: ${successCount} enviadas, ${errorCount} falhas.`);
    }

    // Clear selections after dispatch
    setSelectedGroups([]);
    setMessage("");
    removeMedia();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Send className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Novo Disparo</h2>
          <p className="text-sm text-muted-foreground">Envie mensagens para grupos do WhatsApp</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Instance Selection */}
        <div className="space-y-2">
          <Label>Instância</Label>
          <Select value={selectedInstance} onValueChange={setSelectedInstance}>
            <SelectTrigger>
              <SelectValue placeholder={loadingInstances ? "Carregando..." : "Selecione uma instância"} />
            </SelectTrigger>
            <SelectContent>
              {instances?.filter(i => i.connectionStatus === 'open').map((instance) => (
                <SelectItem key={instance.name} value={instance.name}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {instance.name}
                    {instance.profileName && (
                      <span className="text-muted-foreground">({instance.profileName})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
              {instances?.filter(i => i.connectionStatus === 'open').length === 0 && (
                <SelectItem value="none" disabled>
                  Nenhuma instância conectada
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Target Type Tabs */}
        <Tabs value={targetType} onValueChange={(v) => setTargetType(v as "csv" | "groups")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2" disabled>
              <FileSpreadsheet className="h-4 w-4" />
              Lista CSV (em breve)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-4">
            {!selectedInstance ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center border-border">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Selecione uma instância para ver os grupos</p>
              </div>
            ) : loadingGroups ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center border-border">
                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
                <p className="text-muted-foreground">Carregando grupos...</p>
              </div>
            ) : groups && groups.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedGroups.length} de {groups.length} grupos selecionados
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllGroups}
                    >
                      Selecionar todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAllGroups}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-3">
                  {groups.map((group) => (
                    <label
                      key={group.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedGroups.includes(group.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => toggleGroupSelection(group.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{group.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.size} participantes
                        </p>
                      </div>
                      {selectedGroups.includes(group.id) && (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-8 text-center border-border">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum grupo encontrado</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetchGroups()}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="csv" className="mt-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center border-border">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Em breve...</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Media Upload */}
        <div className="space-y-2">
          <Label>Mídia (opcional)</Label>

          {selectedMedia ? (
            <div className="relative border rounded-lg p-4 bg-muted/30">
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                {selectedMedia.type === 'image' && (
                  <img
                    src={selectedMedia.preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                {selectedMedia.type === 'video' && (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {selectedMedia.type === 'document' && (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedMedia.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedMedia.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-primary capitalize">{selectedMedia.type}</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
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
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Arraste uma imagem ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground">Imagem, Vídeo ou PDF (máx. 16MB)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Editor */}
        <div className="space-y-2">
          <Label>{selectedMedia ? "Legenda (opcional)" : "Mensagem"}</Label>
          <Textarea
            placeholder={selectedMedia ? "Digite uma legenda para a mídia..." : "Digite sua mensagem aqui..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={mentionEveryone}
                onCheckedChange={(checked) => setMentionEveryone(checked === true)}
              />
              <span>Mencionar todos (@everyone)</span>
            </label>
          </div>
        </div>

        {/* Sending Progress */}
        {isSending && (
          <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="font-medium">Enviando disparos...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{sendProgress.sent} de {sendProgress.total}</span>
                {sendProgress.current && (
                  <span className="truncate max-w-[200px]">
                    Enviando para: {sendProgress.current}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            className="flex-1 gap-2"
            onClick={handleDispatch}
            disabled={isSending || selectedGroups.length === 0 || (!message.trim() && !selectedMedia)}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Iniciar Disparo ({selectedGroups.length} grupos)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
