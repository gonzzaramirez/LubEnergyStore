"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPurchase, PurchaseOrderLineDto } from "@/lib/api/purchases";
import { getSuppliers } from "@/lib/api/suppliers";
import { getProducts } from "@/lib/api/product";
import type { Supplier, Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft, Search, X } from "lucide-react";
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

  // Per-line search state
  const [productSearch, setProductSearch] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const searchRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (openDropdown === null) return;
      const el = searchRefs.current[openDropdown];
      if (el && !el.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const addLine = () => {
    setLines([...lines, { productName: "", quantity: 1, unitPurchasePrice: 0, unitSalePrice: undefined }]);
    setProductSearch([...productSearch, ""]);
  };

  const removeLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
    setProductSearch(productSearch.filter((_, i) => i !== idx));
    if (openDropdown === idx) setOpenDropdown(null);
  };

  const activeProducts = useMemo(() => products.filter((p) => p.isActive), [products]);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const updateLine = (idx: number, field: keyof PurchaseOrderLineDto, value: any) => {
    setLines(lines.map((line, i) => {
      if (i !== idx) return line;
      const newLine = { ...line, [field]: value };

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
      } else if (field === "productId" && !value) {
        newLine.productId = undefined;
        newLine.flavorId = undefined;
        newLine.flavorName = undefined;
        newLine.productName = "";
        newLine.unitPurchasePrice = 0;
        newLine.unitSalePrice = undefined;
      }

      return newLine;
    }));
  };

  const updateLineFields = (idx: number, updates: Partial<PurchaseOrderLineDto>) => {
    setLines(lines.map((line, i) => (i === idx ? { ...line, ...updates } : line)));
  };

  const selectProduct = (idx: number, productId: string) => {
    updateLine(idx, "productId", productId);
    setProductSearch(productSearch.map((s, i) => (i === idx ? "" : s)));
    setOpenDropdown(null);
  };

  const clearProduct = (idx: number) => {
    updateLine(idx, "productId", "");
    setProductSearch(productSearch.map((s, i) => (i === idx ? "" : s)));
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
            const searchTerm = (productSearch[idx] || "").toLowerCase();
            const filteredProducts = activeProducts.filter(
              (p) =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.category?.name || "").toLowerCase().includes(searchTerm),
            );
            const isOpen = openDropdown === idx;

            return (
              <div key={idx} className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0">
                <div className="flex gap-3 items-start">
                  {/* Product selector — searchable */}
                  <div className="flex-[1.5] space-y-1 relative" ref={(el) => { searchRefs.current[idx] = el; }}>
                    <label className="text-xs text-slate-500 font-medium">Producto *</label>

                    {line.productId && selectedProduct ? (
                      /* Selected — show pill */
                      <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-slate-50 rounded-md text-sm">
                        <span className="flex-1 font-medium truncate">{selectedProduct.name}</span>
                        <span className="text-slate-400 text-xs">
                          ${selectedProduct.price.toLocaleString("es-AR")}
                        </span>
                        <button
                          type="button"
                          onClick={() => clearProduct(idx)}
                          className="p-0.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Search input */
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Search className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Buscá un producto..."
                          value={productSearch[idx] || ""}
                          onChange={(e) => {
                            const newSearch = [...productSearch];
                            newSearch[idx] = e.target.value;
                            setProductSearch(newSearch);
                          }}
                          onFocus={() => setOpenDropdown(idx)}
                          className="pl-8 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                          required
                        />
                      </div>
                    )}

                    {/* Dropdown results */}
                    {isOpen && !line.productId && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchTerm.length === 0 ? (
                          <p className="text-xs text-slate-400 p-3 text-center">
                            Escribí al menos 2 caracteres para buscar
                          </p>
                        ) : searchTerm.length < 2 ? (
                          <p className="text-xs text-slate-400 p-3 text-center">
                            Seguí escribiendo para filtrar productos...
                          </p>
                        ) : filteredProducts.length === 0 ? (
                          <p className="text-sm text-slate-400 p-3 text-center">
                            Sin resultados para "{searchTerm}"
                          </p>
                        ) : (
                          filteredProducts.slice(0, 12).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => selectProduct(idx, p.id)}
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <span className="flex-1 truncate font-medium">{p.name}</span>
                              {p.category?.name && (
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                  {p.category.name}
                                </span>
                              )}
                              <span className="text-slate-500 text-xs font-semibold shrink-0 tabular-nums">
                                ${p.price.toLocaleString("es-AR")}
                              </span>
                            </button>
                          ))
                        )}
                        {filteredProducts.length > 12 && (
                          <p className="text-[11px] text-slate-400 text-center py-2 border-t border-slate-100">
                            +{filteredProducts.length - 12} resultados más — refiná la búsqueda
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Flavor selector */}
                  {hasFlavors && (
                    <div className="w-44 space-y-1">
                      <label className="text-xs text-slate-500 font-medium">Variante *</label>
                      <select
                        value={line.flavorId || ""}
                        onChange={(e) => {
                          const flavor = selectedProduct!.flavors!.find((f) => f.id === e.target.value);
                          updateLineFields(idx, {
                            flavorId: e.target.value || undefined,
                            flavorName: flavor?.name || undefined,
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        required
                      >
                        <option value="">Elegí variante...</option>
                        {selectedProduct!.flavors!.filter((f) => f.isActive).map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} {f.price ? `(${formatPrice(f.price)})` : ""}
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

                {/* Summary row */}
                <div className="flex gap-4 text-xs text-slate-400 ml-1">
                  {selectedProduct && (
                    <span className="text-green-600">✓ {selectedProduct.name}</span>
                  )}
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
