import { Key, Globe, Webhook, Shield, Bell } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas integrações e preferências</p>
        </div>

        {/* Evolution API */}
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Evolution API</h2>
              <p className="text-sm text-muted-foreground">Configurações da API WhatsApp</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL Base</Label>
              <Input placeholder="https://sua-evolution-api.com" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="••••••••••••••••" />
                <Button variant="outline">
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button>Salvar Configurações</Button>
          </div>
        </div>

        {/* n8n Integration */}
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Webhook className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold">n8n Webhooks</h2>
              <p className="text-sm text-muted-foreground">Configurações de automação</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL do n8n</Label>
              <Input placeholder="https://seu-n8n.com" />
            </div>
            <div className="space-y-2">
              <Label>Webhook de Disparo</Label>
              <Input placeholder="/webhook/bulk-dispatch" />
            </div>
            <div className="space-y-2">
              <Label>Webhook de Callback</Label>
              <Input placeholder="/webhook/callback" />
            </div>
            <Button>Testar Conexão</Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold">Notificações</h2>
              <p className="text-sm text-muted-foreground">Alertas e avisos do sistema</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Erros de disparo</p>
                <p className="text-sm text-muted-foreground">Receber alertas de falhas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Desconexões</p>
                <p className="text-sm text-muted-foreground">Alertar quando instância desconectar</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Campanhas finalizadas</p>
                <p className="text-sm text-muted-foreground">Notificar ao concluir disparos</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-semibold">Segurança</h2>
              <p className="text-sm text-muted-foreground">Configurações de acesso</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação 2FA</p>
                <p className="text-sm text-muted-foreground">Proteção extra na conta</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Revogar todos os tokens
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
