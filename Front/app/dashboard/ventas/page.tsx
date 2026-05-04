"use client";

import { useState, useEffect } from "react";
import { getSales, Sale } from "@/lib/api/sales";
import SalesTable from "./components/sales-table";
import CreateSaleDialog from "./components/create-sale-dialog";
import { Plus } from "lucide-react";

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(startDate || undefined, endDate || undefined);
      setSales(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const handleSaleCreated = () => {
    fetchSales();
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ventas
          </h1>
          <p className="text-slate-500">
            Registro de ventas presenciales/manuales
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar Venta
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-sm font-medium text-slate-700">Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-sm font-medium text-slate-700">Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="w-full md:w-auto flex items-center justify-between gap-2">
          <button
            onClick={() => { setStartDate(""); setEndDate(""); }}
            className="text-sm text-slate-500 hover:text-black underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      ) : loading ? (
        <div className="py-12 flex justify-center text-slate-500">Cargando ventas...</div>
      ) : (
        <SalesTable sales={sales} />
      )}

      {isDialogOpen && (
        <CreateSaleDialog
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handleSaleCreated}
        />
      )}
    </div>
  );
}
