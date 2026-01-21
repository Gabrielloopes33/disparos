import { useState } from "react";
import { BarChart3, Loader2, AlertCircle, Users, CheckCircle2, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useInstances, useGroups, useSendPoll } from "@/hooks/useEvolution";
import { toast } from "sonner";

export function PollForm() {
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [selectableCount, setSelectableCount] = useState<number>(1);
  const [mentionEveryone, setMentionEveryone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; current?: string }>({ sent: 0, total: 0 });

  // Fetch instances
  const { data: instances, isLoading: loadingInstances } = useInstances();

  // Fetch groups when instance is selected
  const { data: groups, isLoading: loadingGroups, refetch: refetchGroups } = useGroups(selectedInstance);

  // Send poll mutation
  const sendPollMutation = useSendPoll(selectedInstance);

  const addOption = () => {
    if (pollOptions.length < 12) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
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

  const handleSendPoll = async () => {
    if (!selectedInstance) {
      toast.error("Selecione uma instância");
      return;
    }

    if (selectedGroups.length === 0) {
      toast.error("Selecione pelo menos um grupo");
      return;
    }

    if (!pollQuestion.trim()) {
      toast.error("Digite a pergunta da enquete");
      return;
    }

    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Adicione pelo menos 2 opções");
      return;
    }

    setIsSending(true);
    setSendProgress({ sent: 0, total: selectedGroups.length });

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
        await sendPollMutation.mutateAsync({
          number: groupId,
          name: pollQuestion.trim(),
          selectableCount,
          values: validOptions,
          mentionsEveryOne: mentionEveryone,
        });
        successCount++;

        // Delay between sends to avoid rate limiting
        if (i < selectedGroups.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Erro ao enviar enquete para ${groupId}:`, error);
        errorCount++;
      }
    }

    setSendProgress({ sent: selectedGroups.length, total: selectedGroups.length });
    setIsSending(false);

    if (errorCount === 0) {
      toast.success(`Enquete enviada para ${successCount} grupos!`);
    } else {
      toast.warning(`Enquete enviada: ${successCount} sucesso, ${errorCount} falhas.`);
    }

    // Clear form after success
    if (successCount > 0) {
      setSelectedGroups([]);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setSelectableCount(1);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
          <BarChart3 className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Criar Enquete</h2>
          <p className="text-sm text-muted-foreground">Envie enquetes para grupos do WhatsApp</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Instance Selection */}
        <div className="space-y-2">
          <Label>Instância</Label>
          <Select
            value={selectedInstance}
            onValueChange={(value) => {
              setSelectedInstance(value);
              setSelectedGroups([]);
            }}
          >
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

        {/* Group Selection */}
        <div className="space-y-2">
          <Label>Grupos</Label>
          {!selectedInstance ? (
            <div className="border-2 border-dashed rounded-xl p-6 text-center border-border">
              <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Selecione uma instância para ver os grupos</p>
            </div>
          ) : loadingGroups ? (
            <div className="border-2 border-dashed rounded-xl p-6 text-center border-border">
              <Loader2 className="h-6 w-6 mx-auto text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Carregando grupos...</p>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedGroups.length} de {groups.length} selecionados
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllGroups}>
                    Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllGroups}>
                    Limpar
                  </Button>
                </div>
              </div>
              <div className="max-h-[150px] overflow-y-auto space-y-2 border rounded-lg p-3">
                {groups.map((group) => (
                  <label
                    key={group.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors",
                      selectedGroups.includes(group.id)
                        ? "border-violet-500 bg-violet-500/5"
                        : "border-border hover:border-violet-500/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={() => toggleGroupSelection(group.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{group.subject}</p>
                    </div>
                    {selectedGroups.includes(group.id) && (
                      <CheckCircle2 className="h-4 w-4 text-violet-500 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-6 text-center border-border">
              <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum grupo encontrado</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchGroups()}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>

        {/* Poll Question */}
        <div className="space-y-2">
          <Label>Pergunta da Enquete</Label>
          <Input
            placeholder="Ex: Qual o melhor horário para a reunião?"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            maxLength={256}
          />
        </div>

        {/* Poll Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Opções ({pollOptions.length}/12)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={pollOptions.length >= 12}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Opção ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  maxLength={100}
                />
                {pollOptions.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selectable Count */}
        <div className="space-y-2">
          <Label>Quantidade de respostas permitidas</Label>
          <Select
            value={selectableCount.toString()}
            onValueChange={(value) => setSelectableCount(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 resposta (única escolha)</SelectItem>
              <SelectItem value="0">Múltiplas respostas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mention Everyone */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="mention-poll"
            checked={mentionEveryone}
            onCheckedChange={(checked) => setMentionEveryone(checked === true)}
          />
          <label htmlFor="mention-poll" className="text-sm cursor-pointer">
            Mencionar todos (@everyone)
          </label>
        </div>

        {/* Sending Progress */}
        {isSending && (
          <div className="p-4 border rounded-lg bg-violet-500/5 border-violet-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
              <span className="font-medium">Enviando enquetes...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-300"
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
            className="flex-1 gap-2 bg-violet-500 hover:bg-violet-600"
            onClick={handleSendPoll}
            disabled={
              isSending ||
              selectedGroups.length === 0 ||
              !pollQuestion.trim() ||
              pollOptions.filter(opt => opt.trim()).length < 2
            }
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Enviar Enquete ({selectedGroups.length} grupos)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
