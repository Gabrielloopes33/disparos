import { MainLayout } from "@/components/layout/MainLayout";
import { DispatchForm } from "@/components/dispatch/DispatchForm";
import { CampaignTable } from "@/components/logs/CampaignTable";

const Dispatch = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Disparos em Massa</h1>
          <p className="text-muted-foreground">Envie mensagens para listas ou grupos</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DispatchForm />
          <div className="lg:col-span-1">
            <CampaignTable />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
