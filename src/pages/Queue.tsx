import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { QueueTable } from "@/components/queue/QueueTable";
import { SentTable } from "@/components/queue/SentTable";
import { QueueStats } from "@/components/queue/QueueStats";
import { ImportCSV } from "@/components/queue/ImportCSV";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo, CheckCircle2, Upload } from "lucide-react";

const Queue = () => {
  const [activeTab, setActiveTab] = useState("queue");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Fila de Disparos</h1>
          <p className="text-muted-foreground">Gerencie os leads para disparo via n8n</p>
        </div>

        <QueueStats />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="queue" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Fila Pendente
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Já Enviados
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            <QueueTable />
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <SentTable />
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <ImportCSV />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Queue;
