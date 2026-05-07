"use client";

import { TopProduct } from "@/lib/api/sales";
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
  payload?: Array<{ value: number; payload: TopProduct }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm max-w-[220px]">
      <p className="font-semibold text-slate-800 mb-1 truncate">{d.name}</p>
      <p className="text-blue-600 font-bold">{formatCurrency(d.revenue)}</p>
      <p className="text-slate-500">{d.units} uds. · {d.salesCount} {d.salesCount === 1 ? "venta" : "ventas"}</p>
    </div>
  );
}

const COLORS = [
  "#1e40af", "#2563eb", "#3b82f6", "#60a5fa",
  "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff",
];

interface TopProductsChartProps {
  data: TopProduct[];
  loading: boolean;
}

export default function TopProductsChart({ data, loading }: TopProductsChartProps) {
  const truncateName = (name: string) =>
    name.length > 22 ? name.slice(0, 20) + "…" : name;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-slate-800 mb-4">
        Top productos por ingresos
      </h2>

      {loading ? (
        <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          Sin datos para el período seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={data.length * 44 + 16}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) =>
                new Intl.NumberFormat("es-AR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(v)
              }
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickFormatter={truncateName}
              tick={{ fontSize: 12, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[Math.min(index, COLORS.length - 1)]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
