import { MainLayout } from "@/components/layout/MainLayout";
import { WorkflowControl } from "@/components/queue/WorkflowControl";

const N8nControl = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Controle n8n</h1>
          <p className="text-muted-foreground">Gerencie workflows e execuções</p>
        </div>
        <WorkflowControl />
      </div>
    </MainLayout>
  );
};

export default N8nControl;