"use client";

import { SaleLocation, SalePaymentMethod, ReportsFilters } from "@/lib/api/sales";
import { Calendar, MapPin, CreditCard, X } from "lucide-react";

interface Shortcut {
  label: string;
  getRange: () => { startDate: string; endDate: string };
}

const SHORTCUTS: Shortcut[] = [
  {
    label: "Hoy",
    getRange: () => {
      const today = new Date().toISOString().slice(0, 10);
      return { startDate: today, endDate: today };
    },
  },
  {
    label: "Esta semana",
    getRange: () => {
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      return {
        startDate: monday.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: "Este mes",
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: first.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: "Últimos 30 días",
    getRange: () => {
      const now = new Date();
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      return {
        startDate: from.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: "Este año",
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: first.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    },
  },
];

interface ReportsFiltersProps {
  filters: ReportsFilters;
  onChange: (filters: ReportsFilters) => void;
}

export default function ReportsFiltersPanel({ filters, onChange }: ReportsFiltersProps) {
  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.location || filters.paymentMethod;

  const isShortcutActive = (shortcut: Shortcut) => {
    const range = shortcut.getRange();
    return filters.startDate === range.startDate && filters.endDate === range.endDate;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      {/* Shortcuts */}
      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            onClick={() => onChange({ ...filters, ...s.getRange() })}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium ${
              isShortcutActive(s)
                ? "bg-black text-white border-black"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-100" />

      {/* Filters row */}
      <div className="flex flex-wrap gap-4">
        {/* Date range */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <span className="text-slate-400 text-sm">—</span>
            <input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.location ?? ""}
            onChange={(e) =>
              onChange({ ...filters, location: (e.target.value as SaleLocation) || undefined })
            }
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">Ambos locales</option>
            <option value="CORRIENTES">Corrientes</option>
            <option value="MONTE_CASEROS">Monte Caseros</option>
          </select>
        </div>

        {/* Payment method */}
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.paymentMethod ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                paymentMethod: (e.target.value as SalePaymentMethod) || undefined,
              })
            }
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">Todos los métodos</option>
            <option value="CASH">Efectivo</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={() => onChange({})}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-black border border-slate-200 rounded-lg hover:border-slate-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
