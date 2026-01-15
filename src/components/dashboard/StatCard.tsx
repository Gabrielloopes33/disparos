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
  default: "bg-card border-border",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ title, value, change, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-lg hover:scale-[1.02] animate-fade-in",
        variantStyles[variant]
      )}
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconVariantStyles[variant]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>

          {change && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                change.trend === "up" ? "text-success" : "text-destructive"
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

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
