import Link from "next/link";
import { Order } from "@/lib/types";
import { ArrowRight, Clock, User } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: es });
  } catch {
    return dateStr;
  }
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-100 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-24" />
      </div>
      <div className="h-5 bg-slate-100 rounded w-20" />
    </div>
  );
}

interface PendingOrdersProps {
  orders: Order[];
  loading: boolean;
}

export default function PendingOrders({ orders, loading }: PendingOrdersProps) {
  const pending = orders.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-800">
            Pedidos pendientes
          </h2>
          {!loading && orders.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/pedidos"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-black transition-colors"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : pending.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-600">Sin pedidos pendientes</p>
          <p className="text-xs text-slate-400">Todos los pedidos fueron atendidos</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pending.map((order) => {
            const customer = order.guestCustomer;
            const name = customer
              ? `${customer.firstName} ${customer.lastName}`
              : "Cliente";
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <Link
                key={order.id}
                href={`/dashboard/pedidos`}
                className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                  <p className="text-xs text-slate-400">
                    {itemCount} {itemCount === 1 ? "producto" : "productos"} ·{" "}
                    {timeAgo(order.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
