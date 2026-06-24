"use client";

import { Sale } from "@/lib/api/sales";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/products";

interface SalesTableProps {
  sales: Sale[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SalesTable({ sales, page, totalPages, onPageChange }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
        No hay ventas registradas en este período.
      </div>
    );
  }

  const locationLabels: Record<string, string> = {
    CORRIENTES: "Corrientes",
    MONTE_CASEROS: "Monte Caseros",
  };

  const paymentLabels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Cant.</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Costo ($)</th>
              <th className="px-6 py-4">Ganancia ($)</th>
              <th className="px-6 py-4">Método de Pago</th>
              <th className="px-6 py-4">Sucursal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-900">
                  {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {sale.product?.name || "Producto Desconocido"}
                  {sale.flavor?.name && (
                    <span className="text-slate-400 font-normal ml-1">
                      ({sale.flavor.name})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {sale.quantity}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {formatPrice(sale.totalAmount)}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {sale.purchasePrice != null
                    ? formatPrice(sale.quantity * sale.purchasePrice)
                    : "—"}
                </td>
                <td className="px-6 py-4 font-medium">
                  {sale.unitSalePrice != null && sale.purchasePrice != null
                    ? formatPrice(sale.quantity * (sale.unitSalePrice - sale.purchasePrice))
                    : sale.purchasePrice != null
                    ? formatPrice(sale.totalAmount - sale.quantity * sale.purchasePrice)
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    sale.paymentMethod === 'CASH' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {paymentLabels[sale.paymentMethod] || sale.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {locationLabels[sale.location] || sale.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
