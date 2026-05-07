"use client";

import { useState, useEffect } from "react";
import { getOrderStats, getOrders } from "@/lib/api/order";
import { getProducts } from "@/lib/api/product";
import { getSalesReports } from "@/lib/api/sales";
import { OrderStats, Order, Product } from "@/lib/types";
import { ReportsSummary } from "@/lib/api/sales";
import KpiCards from "./components/kpi-cards";
import PendingOrders from "./components/pending-orders";
import LowStockAlert from "./components/low-stock-alert";
import QuickLinks from "./components/quick-links";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getCurrentMonthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: first.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

export default function DashboardPage() {
  const [salesSummary, setSalesSummary] = useState<ReportsSummary | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const range = getCurrentMonthRange();

    const [salesRes, statsRes, ordersRes, productsRes] = await Promise.allSettled([
      getSalesReports(range),
      getOrderStats(),
      getOrders("PENDING"),
      getProducts(),
    ]);

    if (salesRes.status === "fulfilled") setSalesSummary(salesRes.value.summary);
    if (statsRes.status === "fulfilled") setOrderStats(statsRes.value);
    if (ordersRes.status === "fulfilled") setPendingOrders(ordersRes.value);
    if (productsRes.status === "fulfilled") setProducts(productsRes.value);

    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const now = new Date();
  const monthLabel = format(now, "MMMM yyyy", { locale: es });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Panel de control
            </h1>
            <p className="text-sm text-slate-500 capitalize">{monthLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-xs text-slate-400 hidden sm:block">
              Actualizado {format(lastUpdated, "HH:mm")}
            </p>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards
        salesSummary={salesSummary}
        orderStats={orderStats}
        loading={loading}
      />

      {/* Pedidos pendientes + Stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PendingOrders orders={pendingOrders} loading={loading} />
        <LowStockAlert products={products} loading={loading} />
      </div>

      {/* Accesos rápidos */}
      <QuickLinks />
    </div>
  );
}
