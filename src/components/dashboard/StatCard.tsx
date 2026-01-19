import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down";
  };
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "glass-strong border-border/50 hover:border-primary/30",
  success: "glass-strong border-success/30 hover:border-success/50",
  warning: "glass-strong border-warning/30 hover:border-warning/50",
  destructive: "glass-strong border-destructive/30 hover:border-destructive/50",
};

const iconVariantStyles = {
  default: "gradient-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

export function StatCard({ title, value, change, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover-lift hover:shadow-xl animate-fade-in group",
        variantStyles[variant]
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl group-hover:scale-110 transition-transform duration-500" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 transition-all duration-300",
              iconVariantStyles[variant]
            )}
          >
            <Icon className="h-7 w-7 animate-pulse-slow" />
          </div>

          {change && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300 hover:scale-105",
                change.trend === "up" 
                  ? "text-success bg-success/10 border-success/20" 
                  : "text-destructive bg-destructive/10 border-destructive/20"
              )}
            >
              {change.trend === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {change.value}
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
