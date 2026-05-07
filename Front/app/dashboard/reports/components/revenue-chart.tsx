"use client";

import { RevenueOverTime } from "@/lib/api/sales";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "d MMM", { locale: es });
  } catch {
    return dateStr;
  }
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: RevenueOverTime }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">
        {label ? formatDate(label) : ""}
      </p>
      <p className="text-emerald-600 font-bold">{formatCurrency(data.revenue)}</p>
      <p className="text-slate-500">{data.count} {data.count === 1 ? "venta" : "ventas"} · {data.units} uds.</p>
    </div>
  );
}

interface RevenueChartProps {
  data: RevenueOverTime[];
  loading: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-slate-800 mb-4">Ingresos por fecha</h2>

      {loading ? (
        <div className="h-52 bg-slate-50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
          Sin datos para el período seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
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
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={data.length <= 15 ? { r: 3, fill: "#10b981", strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
