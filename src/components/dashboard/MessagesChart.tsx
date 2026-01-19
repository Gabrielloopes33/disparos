import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { hour: "00h", success: 1200, error: 45 },
  { hour: "02h", success: 980, error: 20 },
  { hour: "04h", success: 450, error: 12 },
  { hour: "06h", success: 780, error: 35 },
  { hour: "08h", success: 1890, error: 89 },
  { hour: "10h", success: 2390, error: 120 },
  { hour: "12h", success: 3200, error: 95 },
  { hour: "14h", success: 2780, error: 78 },
  { hour: "16h", success: 3100, error: 145 },
  { hour: "18h", success: 2890, error: 110 },
  { hour: "20h", success: 2456, error: 85 },
  { hour: "22h", success: 1890, error: 65 },
];

export function MessagesChart() {
  return (
    <div className="glass-strong rounded-2xl border border-border/50 p-6 animate-fade-in hover-lift group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Disparos nas últimas 24h
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Mensagens enviadas por hora</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 hover-scale">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-success">Sucesso</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 hover-scale">
            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">Erros</span>
          </div>
        </div>
      </div>

<div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="hsl(var(--border))" 
              vertical={false}
              opacity={0.3}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 40px -10px hsl(var(--foreground) / 0.2)"
              }}
              itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="success"
              stroke="hsl(var(--success))"
              strokeWidth={3}
              fill="url(#successGradient)"
              filter="url(#glow)"
            />
            <Area
              type="monotone"
              dataKey="error"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              fill="url(#errorGradient)"
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
