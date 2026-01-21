import { MainLayout } from "@/components/layout/MainLayout";
import { DispatchForm } from "@/components/dispatch/DispatchForm";
import { CampaignTable } from "@/components/dispatch/CampaignTable";
import { GroupRenameForm } from "@/components/dispatch/GroupRenameForm";
import { PollForm } from "@/components/dispatch/PollForm";

const Dispatch = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Disparos em Massa</h1>
          <p className="text-muted-foreground">Envie mensagens para listas ou grupos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DispatchForm />
          <div className="space-y-6">
            <PollForm />
            <GroupRenameForm />
            <CampaignTable />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
