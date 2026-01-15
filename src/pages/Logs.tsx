import { MainLayout } from "@/components/layout/MainLayout";
import { CampaignTable } from "@/components/dispatch/CampaignTable";
import { RecentLogs } from "@/components/dashboard/RecentLogs";

const Logs = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Logs & Relatórios</h1>
          <p className="text-muted-foreground">Histórico e auditoria de campanhas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CampaignTable />
          </div>
          <div className="lg:col-span-1">
            <RecentLogs />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Logs;
