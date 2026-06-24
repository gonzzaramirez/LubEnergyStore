"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPurchase,
  receivePurchase,
  cancelPurchase,
  PurchaseOrder,
} from "@/lib/api/purchases";
import { formatPrice } from "@/lib/products";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPurchase(id);
        setOrder(data);
      } catch {
        toast.error("Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleReceive = async () => {
    if (!confirm("¿Recibir esta orden? Se actualizará el stock de los productos.")) return;
    setActionLoading("receive");
    try {
      const updated = await receivePurchase(id);
      setOrder(updated);
      toast.success("Orden recibida — stock actualizado");
    } catch {
      toast.error("Error al recibir la orden");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta orden?")) return;
    setActionLoading("cancel");
    try {
      const updated = await cancelPurchase(id);
      setOrder(updated);
      toast.success("Orden cancelada");
    } catch {
      toast.error("Error al cancelar la orden");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-500">
        Orden de compra no encontrada
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/compras"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Orden #{order.id.slice(0, 8)}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {format(new Date(order.createdAt), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
          </p>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Proveedor</h2>
        <p className="font-medium text-lg">{order.supplier?.name || "—"}</p>
        {order.notes && (
          <p className="text-sm text-slate-500 mt-2">{order.notes}</p>
        )}
        {order.receivedAt && (
          <p className="text-sm text-slate-500 mt-1">
            Recibida: {format(new Date(order.receivedAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        )}
      </div>

      {/* Products */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 font-semibold">
          Productos ({order.lines?.length || 0})
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Cant.</th>
              <th className="px-5 py-3">P. compra</th>
              <th className="px-5 py-3">P. venta</th>
              <th className="px-5 py-3">Subtotal</th>
              <th className="px-5 py-3">Restante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.lines?.map((line) => (
              <tr key={line.id}>
                <td className="px-5 py-3">
                  <p className="font-medium">{line.productName}</p>
                  {line.flavorName && (
                    <p className="text-xs text-slate-500">{line.flavorName}</p>
                  )}
                </td>
                <td className="px-5 py-3">{line.quantity}</td>
                <td className="px-5 py-3">{formatPrice(line.unitPurchasePrice)}</td>
                <td className="px-5 py-3">
                  {line.unitSalePrice ? formatPrice(line.unitSalePrice) : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-5 py-3 font-medium">
                  {formatPrice(line.quantity * line.unitPurchasePrice)}
                </td>
                <td className="px-5 py-3">{line.remaining}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={4} className="px-5 py-3 text-right">Total</td>
              <td className="px-5 py-3">{formatPrice(order.totalAmount)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      {order.status === "PENDING" && (
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {actionLoading === "cancel" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Cancelar Orden
          </button>
          <button
            onClick={handleReceive}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {actionLoading === "receive" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Recibir Orden
          </button>
        </div>
      )}
    </div>
  );
}
