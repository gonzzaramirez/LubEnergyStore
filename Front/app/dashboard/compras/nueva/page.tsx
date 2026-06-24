"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPurchase, PurchaseOrderLineDto } from "@/lib/api/purchases";
import { getSuppliers } from "@/lib/api/suppliers";
import { getProducts } from "@/lib/api/product";
import type { Supplier, Product, ProductFlavor } from "@/lib/types";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NuevaCompraPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<PurchaseOrderLineDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([getSuppliers(), getProducts()]);
        setSuppliers(s.filter((x) => x.isActive));
        setProducts(p);
      } catch {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addLine = () => {
    setLines([...lines, { productName: "", quantity: 1, unitPurchasePrice: 0, unitSalePrice: undefined }]);
  };

  const removeLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const updateLine = (idx: number, field: keyof PurchaseOrderLineDto, value: any) => {
    const updated = lines.map((line, i) => {
      if (i !== idx) return line;
      const newLine = { ...line, [field]: value };

      // When product selection changes, auto-fill everything
      if (field === "productId" && value) {
        const prod = getProductById(value);
        if (prod) {
          newLine.productName = prod.name;
          newLine.flavorId = undefined;
          newLine.flavorName = undefined;
          if (newLine.unitSalePrice == null) {
            newLine.unitSalePrice = prod.price;
          }
          if (prod.purchasePrice && (!newLine.unitPurchasePrice || newLine.unitPurchasePrice === 0)) {
            newLine.unitPurchasePrice = prod.purchasePrice;
          }
          if (prod.defaultSupplierId && !supplierId) {
            setSupplierId(prod.defaultSupplierId);
          }
        }
        // Reset prices when deselected (shouldn't happen but just in case)
      } else if (field === "productId" && !value) {
        newLine.productId = undefined;
        newLine.flavorId = undefined;
        newLine.flavorName = undefined;
        newLine.productName = "";
        newLine.unitPurchasePrice = 0;
        newLine.unitSalePrice = undefined;
      }

      return newLine;
    });
    setLines(updated);
  };

  const totalAmount = lines.reduce((s, l) => s + l.quantity * l.unitPurchasePrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Seleccioná un proveedor");
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.productName || l.quantity < 1)) {
      toast.error("Completá todas las líneas correctamente");
      return;
    }

    setSaving(true);
    try {
      const po = await createPurchase({
        supplierId,
        notes: notes || undefined,
        lines: lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          unitPurchasePrice: Number(l.unitPurchasePrice),
        })),
      });
      toast.success("Orden de compra creada");
      router.push(`/dashboard/compras/${po.id}`);
    } catch {
      toast.error("Error al crear la orden de compra");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/compras"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Orden de Compra</h1>
          <p className="text-muted-foreground text-sm">
            Creá una orden para recibir productos de un proveedor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="font-semibold">Proveedor</h2>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
            required
          >
            <option value="">Seleccioná un proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              rows={2}
              placeholder="Notas opcionales..."
            />
          </div>
        </div>

        {/* Lines */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Productos</h2>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-sm text-black hover:text-slate-600"
            >
              <Plus className="w-4 h-4" />
              Agregar producto
            </button>
          </div>

          {lines.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              Agregá al menos un producto a la orden
            </p>
          )}

          {lines.map((line, idx) => {
            const selectedProduct = line.productId ? getProductById(line.productId) : null;
            const hasFlavors = selectedProduct && selectedProduct.flavors && selectedProduct.flavors.length > 0;

            return (
              <div key={idx} className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0">
                <div className="flex gap-3 items-start">
                  {/* Product selector — mandatory */}
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-500 font-medium">Producto *</label>
                    <select
                      value={line.productId || ""}
                      onChange={(e) => updateLine(idx, "productId", e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      required
                    >
                      <option value="">Seleccioná un producto...</option>
                      {products.filter((p) => p.isActive).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toLocaleString("es-AR")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Flavor selector — shown only when product has flavors */}
                  {hasFlavors && (
                    <div className="w-48 space-y-1">
                      <label className="text-xs text-slate-500 font-medium">Variante *</label>
                      <select
                        value={line.flavorId || ""}
                        onChange={(e) => {
                          const flavor = selectedProduct!.flavors!.find((f) => f.id === e.target.value);
                          updateLine(idx, "flavorId", e.target.value || undefined);
                          updateLine(idx, "flavorName", flavor?.name || undefined);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        required
                      >
                        <option value="">Elegí variante...</option>
                        {selectedProduct!.flavors!.filter((f) => f.isActive).map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} {f.price ? `($${f.price.toLocaleString("es-AR")})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="w-20 space-y-1">
                    <label className="text-xs text-slate-500 font-medium">Cant.</label>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                  </div>

                  {/* Purchase price */}
                  <div className="w-28 space-y-1">
                    <label className="text-xs text-slate-500 font-medium">P. compra</label>
                    <input
                      type="number"
                      min={0}
                      value={line.unitPurchasePrice}
                      onChange={(e) => updateLine(idx, "unitPurchasePrice", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      required
                    />
                  </div>

                  {/* Sale price */}
                  <div className="w-28 space-y-1">
                    <label className="text-xs text-slate-500 font-medium">P. venta</label>
                    <input
                      type="number"
                      min={0}
                      value={line.unitSalePrice ?? ""}
                      onChange={(e) =>
                        updateLine(idx, "unitSalePrice", e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="mt-6 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary row: shows linked status and prices */}
                <div className="flex gap-4 text-xs text-slate-400 ml-1">
                  <span>
                    {line.productId
                      ? selectedProduct
                        ? `✓ ${selectedProduct.name}`
                        : "⚠ Producto no encontrado"
                      : "⚠ Sin producto — el stock no se actualizará"}
                  </span>
                  {line.flavorName && <span>› {line.flavorName}</span>}
                  {line.unitSalePrice != null && (
                    <span>Venta sugerida: ${line.unitSalePrice.toLocaleString("es-AR")}</span>
                  )}
                </div>
              </div>
            );
          })}

          {lines.length > 0 && (
            <div className="text-right font-semibold text-lg pt-2 border-t border-slate-200">
              Total: ${totalAmount.toLocaleString("es-AR")}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/compras"
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-sm bg-black text-white rounded-md hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear Orden
          </button>
        </div>
      </form>
    </div>
  );
}
