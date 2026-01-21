import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Smartphone,
  Send,
  ListTodo,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/",
    badge: null
  },
  { 
    icon: Smartphone, 
    label: "Instâncias", 
    path: "/instances",
    badge: "22"
  },
  {
    icon: Send,
    label: "Disparos",
    path: "/dispatch",
    badge: null
  },
  {
    icon: ListTodo,
    label: "Fila n8n",
    path: "/queue",
    badge: null
  },
  {
    icon: FileText,
    label: "Logs",
    path: "/logs",
    badge: "12"
  },
  { 
    icon: Settings, 
    label: "Configurações", 
    path: "/settings",
    badge: null
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen glass-strong border-r border-sidebar-border/50 transition-all duration-300 flex flex-col lg:block hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary glow-primary">
          <Zap className="h-5 w-5 text-primary-foreground animate-pulse-slow" />
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="font-bold text-sidebar-foreground text-lg">Evolution</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-success" />
              n8n Manager
            </span>
          </div>
        )}
      </div>

{/* Navigation */}
      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const NavIcon = item.icon;

          return collapsed ? (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-full h-12 mb-2 rounded-xl hover-lift",
                      isActive 
                        ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/20" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <NavIcon className="h-5 w-5" />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-strong">
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 px-4 rounded-xl hover-lift group",
                  isActive 
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-medium border border-primary/20 shadow-md" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <NavIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                  )}
                </div>
                <span className="flex-1 text-left animate-fade-in">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

{/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border/50">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full h-10 rounded-xl hover-lift", 
            !collapsed && "justify-start gap-3"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
