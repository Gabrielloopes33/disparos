import { Smartphone, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { MessagesChart } from "@/components/dashboard/MessagesChart";
import { RecentLogs } from "@/components/dashboard/RecentLogs";
import { InstanceGrid } from "@/components/instances/InstanceGrid";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu ecossistema WhatsApp</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Instâncias Ativas"
            value="19/22"
            change={{ value: "+2 hoje", trend: "up" }}
            icon={Smartphone}
            variant="default"
          />
          <StatCard
            title="Mensagens Hoje"
            value="35.656"
            change={{ value: "+12%", trend: "up" }}
            icon={MessageSquare}
            variant="default"
          />
          <StatCard
            title="Taxa de Sucesso"
            value="95.9%"
            change={{ value: "+0.5%", trend: "up" }}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Erros Detectados"
            value="1.456"
            change={{ value: "-8%", trend: "down" }}
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        {/* Charts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MessagesChart />
          </div>
          <div className="lg:col-span-1">
            <RecentLogs />
          </div>
        </div>

        {/* Instances Preview */}
        <div className="pt-6 border-t border-border">
          <InstanceGrid />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
