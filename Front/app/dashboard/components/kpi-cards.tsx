import { OrderStats } from "@/lib/types";
import { ReportsSummary } from "@/lib/api/sales";
import {
  DollarSign,
  ShoppingCart,
  Store,
  Clock,
  CheckCircle,
  Truck,
  Receipt,
  TrendingUp,
} from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse flex items-start gap-4">
      <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 mt-1">
        <div className="h-3 bg-slate-100 rounded w-28" />
        <div className="h-7 bg-slate-100 rounded w-24" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  badge?: { label: string; color: string };
}

function KpiCard({ icon, label, value, sub, accent, badge }: KpiCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          {badge && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${badge.color}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

interface KpiCardsProps {
  salesSummary: ReportsSummary | null;
  orderStats: OrderStats | null;
  loading: boolean;
}

export default function KpiCards({ salesSummary, orderStats, loading }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ventas presenciales */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Store className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Ventas presenciales — mes actual
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Ingresos del mes"
            value={formatCurrency(salesSummary?.totalRevenue ?? 0)}
            sub={`${salesSummary?.totalSales ?? 0} ventas registradas`}
            accent="bg-emerald-50 text-emerald-600"
          />
          <KpiCard
            icon={<Receipt className="w-5 h-5" />}
            label="Cantidad de ventas"
            value={(salesSummary?.totalSales ?? 0).toLocaleString("es-AR")}
            sub={`${salesSummary?.totalUnits ?? 0} unidades despachadas`}
            accent="bg-teal-50 text-teal-600"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Ticket promedio"
            value={formatCurrency(salesSummary?.avgTicket ?? 0)}
            sub="por venta registrada"
            accent="bg-cyan-50 text-cyan-600"
          />
        </div>
      </div>

      {/* Pedidos online */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Pedidos online — acumulado
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Clock className="w-5 h-5" />}
            label="Pendientes"
            value={(orderStats?.pending ?? 0).toLocaleString("es-AR")}
            sub="aguardando confirmación"
            accent="bg-amber-50 text-amber-600"
            badge={
              (orderStats?.pending ?? 0) > 0
                ? { label: "Atender", color: "bg-amber-100 text-amber-700" }
                : undefined
            }
          />
          <KpiCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Confirmados"
            value={(orderStats?.confirmed ?? 0).toLocaleString("es-AR")}
            sub="pago confirmado"
            accent="bg-blue-50 text-blue-600"
          />
          <KpiCard
            icon={<Truck className="w-5 h-5" />}
            label="Enviados"
            value={(orderStats?.shipped ?? 0).toLocaleString("es-AR")}
            sub="en camino"
            accent="bg-violet-50 text-violet-600"
          />
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Revenue e-commerce"
            value={formatCurrency(orderStats?.totalRevenue ?? 0)}
            sub="confirmados + enviados"
            accent="bg-slate-100 text-slate-600"
          />
        </div>
      </div>
    </div>
  );
}

