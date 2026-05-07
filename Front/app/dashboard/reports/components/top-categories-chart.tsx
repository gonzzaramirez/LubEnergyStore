"use client";

import { TopCategory } from "@/lib/api/sales";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

const COLORS = [
  "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#ddd6fe", "#ede9fe", "#f5f3ff",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: TopCategory }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-1">{d.name}</p>
      <p className="text-violet-600 font-bold">{formatCurrency(d.revenue)}</p>
      <p className="text-slate-500">{d.units} unidades</p>
    </div>
  );
}

interface TopCategoriesChartProps {
  data: TopCategory[];
  loading: boolean;
}

export default function TopCategoriesChart({ data, loading }: TopCategoriesChartProps) {
  const total = data.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-slate-800 mb-4">
        Ingresos por categoría
      </h2>

      {loading ? (
        <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          Sin datos para el período seleccionado
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="revenue"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[Math.min(index, COLORS.length - 1)]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend manual */}
          <div className="space-y-2">
            {data.map((cat, i) => {
              const pct = total > 0 ? Math.round((cat.revenue / total) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[Math.min(i, COLORS.length - 1)] }}
                  />
                  <span className="text-sm text-slate-700 flex-1 truncate">{cat.name}</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(cat.revenue)}
                  </span>
                  <span className="text-xs text-slate-400 w-9 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
