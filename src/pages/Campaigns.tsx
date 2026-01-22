import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CampaignCreator } from "@/components/campaigns/CampaignCreator";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List, Rocket } from "lucide-react";

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Campanhas de Disparo</h1>
              <p className="text-muted-foreground">
                Crie campanhas com templates dinâmicos gerados por IA
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Campanha
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Campanhas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <CampaignCreator />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <CampaignList />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Campaigns;
