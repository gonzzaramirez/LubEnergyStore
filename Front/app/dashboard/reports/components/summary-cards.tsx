import { ReportsSummary } from "@/lib/api/sales";
import { DollarSign, ShoppingBag, Package, TrendingUp, PiggyBank } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function Card({ icon, label, value, sub, accent = "bg-slate-100 text-slate-600" }: CardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 mt-1">
        <div className="h-3 bg-slate-100 rounded w-24" />
        <div className="h-7 bg-slate-100 rounded w-32" />
      </div>
    </div>
  );
}

interface SummaryCardsProps {
  summary: ReportsSummary | null;
  loading: boolean;
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!summary) return null;

  const cards: CardProps[] = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Ingresos totales",
      value: formatCurrency(summary.totalRevenue),
      sub: `${summary.totalSales} ${summary.totalSales === 1 ? "venta" : "ventas"}`,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Cantidad de ventas",
      value: summary.totalSales.toLocaleString("es-AR"),
      sub: "registros de ventas",
      accent: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Unidades vendidas",
      value: summary.totalUnits.toLocaleString("es-AR"),
      sub: "productos despachados",
      accent: "bg-violet-50 text-violet-600",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Ticket promedio",
      value: formatCurrency(summary.avgTicket),
      sub: "por venta",
      accent: "bg-amber-50 text-amber-600",
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      label: "Ganancia Neta",
      value: summary.totalCost > 0
        ? formatCurrency(summary.netProfit)
        : "—",
      sub: summary.totalCost > 0
        ? `${Math.round((summary.netProfit / (summary.netProfit + summary.totalCost)) * 100)}% margen`
        : "sin datos de costo",
      accent: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} {...c} />
      ))}
    </div>
  );
}
