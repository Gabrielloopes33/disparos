import { Bell, Search, Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu + Search */}
        <div className="flex items-center gap-2">
          <MobileNav />

          {/* Search - Desktop */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar instâncias, campanhas..."
              className="pl-10 bg-muted/30 border border-border/30 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl hover:bg-muted/50 transition-all"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="sm:hidden lg:hidden">
          <Search className="h-4 w-4" />
        </Button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* n8n Status - Hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 hover-scale">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">n8n Online</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover-scale h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="hover-scale h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover-scale h-9 w-9">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-primary border-0">
              3
            </Badge>
          </Button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full gradient-primary glow-primary flex items-center justify-center text-primary-foreground font-medium hover-scale cursor-pointer text-sm sm:text-base">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
