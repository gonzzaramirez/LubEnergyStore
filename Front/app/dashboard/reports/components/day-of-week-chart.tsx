"use client";

import { SalesByDayOfWeek } from "@/lib/api/sales";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SalesByDayOfWeek }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      <p className="text-amber-600 font-bold">{formatCurrency(d.revenue)}</p>
      <p className="text-slate-500">{d.count} {d.count === 1 ? "venta" : "ventas"} · {d.units} uds.</p>
    </div>
  );
}

interface DayOfWeekChartProps {
  data: SalesByDayOfWeek[];
  loading: boolean;
}

export default function DayOfWeekChart({ data, loading }: DayOfWeekChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-slate-800 mb-1">
        Ventas por día de la semana
      </h2>
      <p className="text-xs text-slate-400 mb-4">Acumulado del período seleccionado</p>

      {loading ? (
        <div className="h-52 bg-slate-50 rounded-lg animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="dayName"
              tickFormatter={(v) => v.slice(0, 3)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) =>
                new Intl.NumberFormat("es-AR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(v)
              }
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#fef9c3" }} />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((d) => (
                <Cell
                  key={d.day}
                  fill={d.revenue === maxRevenue && maxRevenue > 0 ? "#f59e0b" : "#fcd34d"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Best day badge */}
      {!loading && maxRevenue > 0 && (() => {
        const best = data.find((d) => d.revenue === maxRevenue);
        return best ? (
          <p className="mt-3 text-xs text-slate-500">
            Mejor día:{" "}
            <span className="font-semibold text-slate-700">{best.dayName}</span>
            {" "}con {formatCurrency(best.revenue)} en ingresos
          </p>
        ) : null;
      })()}
    </div>
  );
}
