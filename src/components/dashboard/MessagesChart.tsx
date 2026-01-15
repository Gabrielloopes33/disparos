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
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Disparos nas últimas 24h</h3>
          <p className="text-sm text-muted-foreground">Mensagens enviadas por hora</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Sucesso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Erros</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 62%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(0, 62%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" vertical={false} />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 8%)",
                border: "1px solid hsl(222, 47%, 16%)",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(210, 40%, 98%)" }}
              labelStyle={{ color: "hsl(215, 20%, 65%)" }}
            />
            <Area
              type="monotone"
              dataKey="success"
              stroke="hsl(145, 63%, 49%)"
              strokeWidth={2}
              fill="url(#successGradient)"
            />
            <Area
              type="monotone"
              dataKey="error"
              stroke="hsl(0, 62%, 50%)"
              strokeWidth={2}
              fill="url(#errorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
