"use client";

import { useState, useEffect, useCallback } from "react";
import { getSalesReports, SalesReport, ReportsFilters } from "@/lib/api/sales";
import ReportsFiltersPanel from "./components/reports-filters";
import SummaryCards from "./components/summary-cards";
import RevenueChart from "./components/revenue-chart";
import TopProductsChart from "./components/top-products-chart";
import TopCategoriesChart from "./components/top-categories-chart";
import DayOfWeekChart from "./components/day-of-week-chart";
import LocationPaymentCards from "./components/location-payment-cards";
import { BarChart3, RefreshCw } from "lucide-react";

function getDefaultFilters(): ReportsFilters {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: first.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportsFilters>(getDefaultFilters);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (f: ReportsFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSalesReports(f);
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(filters);
  }, [filters, fetchReport]);

  const handleFiltersChange = (newFilters: ReportsFilters) => {
    setFilters(newFilters);
  };

  const isEmpty =
    !loading && report && report.summary.totalSales === 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reportes</h1>
            <p className="text-sm text-slate-500">Métricas de ventas presenciales</p>
          </div>
        </div>
        <button
          onClick={() => fetchReport(filters)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <ReportsFiltersPanel filters={filters} onChange={handleFiltersChange} />

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Sin ventas en el período seleccionado</p>
          <p className="text-slate-400 text-sm">
            Probá ajustando los filtros o seleccionando otro rango de fechas.
          </p>
        </div>
      )}

      {/* Content */}
      {(!isEmpty || loading) && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <SummaryCards summary={report?.summary ?? null} loading={loading} />

          {/* Revenue over time */}
          <RevenueChart data={report?.revenueOverTime ?? []} loading={loading} />

          {/* Location + Payment breakdown */}
          <LocationPaymentCards
            byLocation={report?.revenueByLocation ?? []}
            byPaymentMethod={report?.revenueByPaymentMethod ?? []}
            loading={loading}
          />

          {/* Day of week + Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DayOfWeekChart data={report?.salesByDayOfWeek ?? []} loading={loading} />
            <TopCategoriesChart data={report?.topCategories ?? []} loading={loading} />
          </div>

          {/* Top products */}
          <TopProductsChart data={report?.topProducts ?? []} loading={loading} />
        </div>
      )}
    </div>
  );
}
