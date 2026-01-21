import { useState } from "react";
import { Edit3, Loader2, AlertCircle, Users, CheckCircle2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useInstances, useGroups, useUpdateGroupSubject } from "@/hooks/useEvolution";
import { toast } from "sonner";

export function GroupRenameForm() {
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Fetch instances
  const { data: instances, isLoading: loadingInstances } = useInstances();

  // Fetch groups when instance is selected
  const { data: groups, isLoading: loadingGroups, refetch: refetchGroups } = useGroups(selectedInstance);

  // Update group subject mutation
  const updateGroupSubjectMutation = useUpdateGroupSubject(selectedInstance);

  const selectedGroupData = groups?.find(g => g.id === selectedGroup);

  const handleRename = async () => {
    if (!selectedInstance) {
      toast.error("Selecione uma instância");
      return;
    }

    if (!selectedGroup) {
      toast.error("Selecione um grupo");
      return;
    }

    if (!newName.trim()) {
      toast.error("Digite o novo nome do grupo");
      return;
    }

    if (newName.trim().length < 1 || newName.trim().length > 100) {
      toast.error("O nome deve ter entre 1 e 100 caracteres");
      return;
    }

    setIsRenaming(true);

    try {
      await updateGroupSubjectMutation.mutateAsync({
        groupJid: selectedGroup,
        subject: newName.trim(),
      });

      toast.success(`Grupo renomeado para "${newName.trim()}" com sucesso!`);

      // Clear form
      setNewName("");
      setSelectedGroup("");

      // Refresh groups list
      refetchGroups();
    } catch (error) {
      console.error("Erro ao renomear grupo:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao renomear grupo");
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
          <Edit3 className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Renomear Grupo</h2>
          <p className="text-sm text-muted-foreground">Altere o nome de grupos do WhatsApp</p>
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
              setSelectedGroup("");
              setNewName("");
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
          <Label>Grupo</Label>
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
            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setNewName(group.subject);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left",
                    selectedGroup === group.id
                      ? "border-amber-500 bg-amber-500/5"
                      : "border-border hover:border-amber-500/50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{group.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.size} participantes
                    </p>
                  </div>
                  {selectedGroup === group.id && (
                    <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-6 text-center border-border">
              <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum grupo encontrado</p>
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
        </div>

        {/* New Name Input */}
        {selectedGroup && (
          <div className="space-y-2 animate-fade-in">
            <Label>Novo Nome</Label>
            <div className="space-y-2">
              <Input
                placeholder="Digite o novo nome do grupo..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {newName.length}/100 caracteres
              </p>
            </div>
          </div>
        )}

        {/* Selected Group Info */}
        {selectedGroupData && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Nome atual:</span>{" "}
              {selectedGroupData.subject}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600"
            onClick={handleRename}
            disabled={isRenaming || !selectedGroup || !newName.trim() || newName === selectedGroupData?.subject}
          >
            {isRenaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Renomeando...
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Renomear Grupo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
