"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getPurchases, PurchaseOrder } from "@/lib/api/purchases";
import { formatPrice } from "@/lib/products";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibida",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ComprasPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPurchases(1, 50, statusFilter || undefined);
      setOrders(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Compra</h1>
          <p className="text-muted-foreground">
            Gestiona las compras a proveedores
          </p>
        </div>
        <Link
          href="/dashboard/compras/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Orden
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["", "PENDING", "RECEIVED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              statusFilter === s
                ? "bg-black text-white border-black"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Todas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          No hay órdenes de compra
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-medium">
                <tr>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Productos</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {o.supplier?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {o.lines?.length || 0} productos
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {format(new Date(o.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/compras/${o.id}`}
                        className="text-sm text-black underline hover:no-underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
