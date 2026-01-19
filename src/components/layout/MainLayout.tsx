import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen to sidebar width changes
  useEffect(() => {
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      const observer = new ResizeObserver(() => {
        setSidebarCollapsed(sidebar.clientWidth < 100);
      });
      observer.observe(sidebar);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:block hidden">
        <Sidebar />
      </div>
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <Header />
        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
