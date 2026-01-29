import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, User, Bot, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  campaignName?: string;
}

interface ConversationHistoryProps {
  contactPhone: string;
  contactName?: string;
  trigger?: React.ReactNode;
}

// Webhook do n8n para buscar historico do Simple Memory
const HISTORY_WEBHOOK_URL = "https://n8n.codirect.com.br/webhook/conversation-history";

export function ConversationHistory({
  contactPhone,
  contactName,
  trigger,
}: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(HISTORY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: contactPhone,
          limit: 50,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar historico");
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else if (data.history && Array.isArray(data.history)) {
        // Formato alternativo
        setMessages(
          data.history.map((msg: any, idx: number) => ({
            id: msg.id || `msg-${idx}`,
            role: msg.role || msg.type || "user",
            content: msg.content || msg.text || msg.message || "",
            timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
            campaignName: msg.campaignName || msg.campaign_name,
          }))
        );
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching conversation history:", err);
      setError(
        "Nao foi possivel carregar o historico. Verifique se o webhook esta configurado no n8n."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchHistory();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-3 w-3" />
            Ver Historico
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Historico de Conversa
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="font-medium">{contactName || "Contato"}</span>
            <span className="text-muted-foreground">-</span>
            <span className="font-mono text-sm">{formatPhone(contactPhone)}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando historico...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg max-w-md">
                <p className="font-medium mb-2">Para habilitar o historico:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Crie um webhook no n8n com path: <code className="bg-background px-1 rounded">conversation-history</code></li>
                  <li>Configure para buscar dados do Simple Memory</li>
                  <li>Retorne no formato: <code className="bg-background px-1 rounded">{`{messages: [...]}`}</code></li>
                </ol>
              </div>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      message.role === "assistant"
                        ? "bg-primary/10"
                        : "bg-blue-500/10"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex-1 max-w-[80%]",
                      message.role === "assistant" ? "text-left" : "text-right"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block p-3 rounded-lg",
                        message.role === "assistant"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
                        message.role === "assistant" ? "justify-start" : "justify-end"
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(message.timestamp)}</span>
                      {message.campaignName && (
                        <Badge variant="outline" className="text-xs">
                          {message.campaignName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
