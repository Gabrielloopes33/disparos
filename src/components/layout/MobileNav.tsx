import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Smartphone,
  Send,
  ListTodo,
  FileText,
  Settings,
  Menu,
  Zap,
  Activity,
  X,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Smartphone,
    label: "Instâncias",
    path: "/instances",
  },
  {
    icon: Rocket,
    label: "Campanhas",
    path: "/campaigns",
  },
  {
    icon: Send,
    label: "Disparos",
    path: "/dispatch",
  },
  {
    icon: ListTodo,
    label: "Fila n8n",
    path: "/queue",
  },
  {
    icon: FileText,
    label: "Logs",
    path: "/logs",
  },
  {
    icon: Settings,
    label: "Configurações",
    path: "/settings",
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg">Evolution</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3 text-success" />
                n8n Manager
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 p-3 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const NavIcon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="ghost"
className={cn(
                     "w-full justify-start gap-3 h-12 px-4 rounded-xl",
                     isActive
                       ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-medium border border-primary/20"
                       : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                   )}
                >
                  <NavIcon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
