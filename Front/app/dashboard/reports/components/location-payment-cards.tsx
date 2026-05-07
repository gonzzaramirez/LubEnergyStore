import { RevenueByLocation, RevenueByPaymentMethod } from "@/lib/api/sales";
import { MapPin, Banknote } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

const LOCATION_LABELS: Record<string, string> = {
  CORRIENTES: "Corrientes",
  MONTE_CASEROS: "Monte Caseros",
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
};

interface SkeletonProps { rows?: number }
function Skeleton({ rows = 2 }: SkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-28" />
          <div className="h-2 bg-slate-100 rounded-full w-full" />
          <div className="h-3 bg-slate-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  revenue: number;
  count: number;
  units: number;
  percentage: number;
  barColor: string;
}

function BreakdownRow({ label, revenue, count, units, percentage, barColor }: BreakdownRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">{formatCurrency(revenue)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
      <p className="text-xs text-slate-400">
        {count} {count === 1 ? "venta" : "ventas"} · {units} uds. · {percentage}%
      </p>
    </div>
  );
}

interface LocationPaymentCardsProps {
  byLocation: RevenueByLocation[];
  byPaymentMethod: RevenueByPaymentMethod[];
  loading: boolean;
}

export default function LocationPaymentCards({
  byLocation,
  byPaymentMethod,
  loading,
}: LocationPaymentCardsProps) {
  const totalLocation = byLocation.reduce((s, l) => s + l.revenue, 0);
  const totalPayment = byPaymentMethod.reduce((s, p) => s + p.revenue, 0);

  const locationColors = ["#2563eb", "#10b981"];
  const paymentColors = ["#f59e0b", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* By location */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Por local</h2>
        </div>

        {loading ? (
          <Skeleton rows={2} />
        ) : byLocation.length === 0 ? (
          <p className="text-sm text-slate-400">Sin datos</p>
        ) : (
          <div className="space-y-4">
            {byLocation.map((loc, i) => (
              <BreakdownRow
                key={loc.location}
                label={LOCATION_LABELS[loc.location] ?? loc.location}
                revenue={loc.revenue}
                count={loc.count}
                units={loc.units}
                percentage={pct(loc.revenue, totalLocation)}
                barColor={locationColors[i % locationColors.length]}
              />
            ))}
          </div>
        )}
      </div>

      {/* By payment method */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Por método de pago</h2>
        </div>

        {loading ? (
          <Skeleton rows={2} />
        ) : byPaymentMethod.length === 0 ? (
          <p className="text-sm text-slate-400">Sin datos</p>
        ) : (
          <div className="space-y-4">
            {byPaymentMethod.map((pm, i) => (
              <BreakdownRow
                key={pm.paymentMethod}
                label={PAYMENT_LABELS[pm.paymentMethod] ?? pm.paymentMethod}
                revenue={pm.revenue}
                count={pm.count}
                units={pm.units}
                percentage={pct(pm.revenue, totalPayment)}
                barColor={paymentColors[i % paymentColors.length]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
