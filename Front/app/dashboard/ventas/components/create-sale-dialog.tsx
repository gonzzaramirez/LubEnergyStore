"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/lib/api/product";
import { createSale } from "@/lib/api/sales";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { X, Search } from "lucide-react";
import { format } from "date-fns";

export default function CreateSaleDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [location, setLocation] = useState<'CORRIENTES' | 'MONTE_CASEROS'>('CORRIENTES');
  
  // Date initialized to current datetime (local to user browser, assuming Argentina)
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    // format as YYYY-MM-DD
    setDateStr(format(now, "yyyy-MM-dd"));
    // format as HH:mm
    setTimeStr(format(now, "HH:mm"));

    const fetchProds = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProds();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const term = search.toLowerCase();
      return p.name.toLowerCase().includes(term) || (p.category?.name || "").toLowerCase().includes(term);
    });
  }, [products, search]);

  const selectedProduct = products.find(p => p.id === productId);
  const calculatedTotal = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError("Debes seleccionar un producto.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Build date from dateStr + timeStr
      // If user is in Argentina, this will create Date in local timezone correctly
      let createdAt;
      if (dateStr && timeStr) {
        createdAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();
      }

      await createSale({
        productId,
        quantity,
        paymentMethod,
        location,
        createdAt
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al crear la venta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Registrar Venta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form id="sale-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* PRODUCT SELECTOR */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Seleccionar Producto
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o categoría..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="border border-slate-200 rounded-md h-48 overflow-y-auto bg-slate-50 p-2 space-y-1">
                {loadingProducts ? (
                  <p className="text-sm text-slate-500 p-2">Cargando productos...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-sm text-slate-500 p-2">No se encontraron productos.</p>
                ) : (
                  filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => setProductId(product.id)}
                      className={`p-2 rounded-md cursor-pointer flex justify-between items-center text-sm transition-colors ${
                        productId === product.id 
                          ? "bg-black text-white" 
                          : "hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{product.name}</span>
                      <span className="font-bold">{formatPrice(product.price)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Total Calculado</label>
                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-900 font-bold">
                  {formatPrice(calculatedTotal)}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Sucursal</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="CORRIENTES">Corrientes</option>
                  <option value="MONTE_CASEROS">Monte Caseros</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Fecha</label>
                <input
                  type="date"
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Hora</label>
                <input
                  type="time"
                  required
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="sale-form"
            disabled={isSubmitting || !productId}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? "Guardando..." : "Guardar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
}
