import { Product as APIProduct } from "@/lib/types";

// Shape used by ProductCard/ProductGrid for display.
export interface DisplayProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number; // precio en pesos (no centavos)
  category: string;
  image: string;
  badge?: string;
  flavorsCount?: number;
  // Campos de descuento
  discountPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  minQuantityDiscount?: number;
  quantityDiscountPercent?: number;
  /** Sin stock vendible (misma lógica que la ficha: suma de sabores o stock del producto) */
  isOutOfStock: boolean;
}

// Pure mapping shared by server components (SSR initial data) and the
// client ProductGrid (fallback fetch). Must stay in sync with the API shape.
export function adaptProducts(products: APIProduct[]): DisplayProduct[] {
  return products
    .filter((p) => p.isActive !== false)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price, // Precio ya está en pesos argentinos
      category:
        p.category?.name?.toLowerCase().replace(/\s+/g, "-") || "otros",
      image: p.imageUrl || "/placeholder.svg",
      badge: undefined, // No hay badge en la API por ahora
      flavorsCount: p.flavors?.length || 0,
      // Campos de descuento
      discountPercent: p.discountPercent,
      discountStartDate: p.discountStartDate,
      discountEndDate: p.discountEndDate,
      minQuantityDiscount: p.minQuantityDiscount,
      quantityDiscountPercent: p.quantityDiscountPercent,
      isOutOfStock:
        p.flavors && p.flavors.length > 0
          ? p.flavors.reduce((acc, f) => acc + f.stockQuantity, 0) === 0
          : (p.stockQuantity ?? 0) === 0,
    }));
}
