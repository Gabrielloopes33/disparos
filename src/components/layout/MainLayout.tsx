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
    <div className="min-h-screen bg-background dark">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
