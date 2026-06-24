import Link from "next/link";
import { Product } from "@/lib/types";
import { AlertTriangle, ArrowRight, Package } from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

/** Stock real: si el producto tiene sabores activos, suma el stock de todos. Si no, usa el del producto. */
function getEffectiveStock(product: Product): number {
  if (product.flavors && product.flavors.length > 0) {
    return product.flavors.reduce((sum, f) => sum + f.stockQuantity, 0);
  }
  return product.stockQuantity ?? 0;
}

function StockBadge({ stock }: { stock: number }) {
  const display = Math.max(0, stock);
  if (display === 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        Sin stock
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      {display} ud{display !== 1 ? "s" : ""}.
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-100 rounded w-36" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
      <div className="h-5 bg-slate-100 rounded w-16" />
    </div>
  );
}

interface LowStockAlertProps {
  products: Product[];
  loading: boolean;
}

export default function LowStockAlert({ products, loading }: LowStockAlertProps) {
  const lowStock = products
    .filter((p) => {
      if (p.isActive === false) return false;
      const stock = getEffectiveStock(p);
      return stock <= LOW_STOCK_THRESHOLD;
    })
    .sort((a, b) => getEffectiveStock(a) - getEffectiveStock(b))
    .slice(0, 8);

  const outOfStock = lowStock.filter((p) => getEffectiveStock(p) === 0).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-800">Stock bajo</h2>
          {!loading && lowStock.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {outOfStock > 0 ? `${outOfStock} sin stock` : `${lowStock.length} productos`}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/productos"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-black transition-colors"
        >
          Ver productos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : lowStock.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-600">Stock en buen estado</p>
          <p className="text-xs text-slate-400">
            Todos los productos tienen más de {LOW_STOCK_THRESHOLD} unidades
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {lowStock.map((product) => (
            <div key={product.id} className="flex items-center gap-3 py-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-8 h-8 rounded-lg object-cover shrink-0 bg-slate-100"
                />
              ) : (
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                <p className="text-xs text-slate-400">
                  {product.category?.name ?? "Sin categoría"} · SKU {product.sku}
                </p>
              </div>
              <StockBadge stock={getEffectiveStock(product)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
