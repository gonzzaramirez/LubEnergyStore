"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, type Product, type Category } from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DisplayProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
  flavorsCount?: number;
  discountPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  minQuantityDiscount?: number;
  quantityDiscountPercent?: number;
  isOutOfStock: boolean;
}

interface ProductCardProps {
  product: DisplayProduct;
}

function isDiscountActive(product: DisplayProduct): boolean {
  if (!product.discountPercent || product.discountPercent <= 0) return false;
  const now = new Date();
  if (product.discountStartDate && new Date(product.discountStartDate) > now) return false;
  if (product.discountEndDate && new Date(product.discountEndDate) < now) return false;
  return true;
}

function getDiscountedPrice(product: DisplayProduct): number {
  if (!isDiscountActive(product)) return product.price;
  return Math.round(product.price * (1 - (product.discountPercent || 0) / 100));
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const hasActiveDiscount = isDiscountActive(product);
  const finalPrice = getDiscountedPrice(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isOutOfStock) return;

    const categoryName = product.category.toLowerCase().replace(/\s+/g, "-");
    const category: Category | "otros" =
      categoryName === "proteínas" || categoryName === "proteinas"
        ? "proteinas"
        : categoryName === "creatinas"
        ? "creatinas"
        : categoryName === "pre-entrenos"
        ? "pre-entrenos"
        : categoryName === "aminoácidos" || categoryName === "aminoacidos"
        ? "aminoacidos"
        : categoryName === "vitaminas"
        ? "vitaminas"
        : ("otros" as Category);

    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: finalPrice,
      category,
      image: product.image,
      badge: product.badge,
    };

    addItem(cartProduct);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg active:scale-[0.98] touch-manipulation">

      {/*
        Overlay link cubre toda la card a z-10.
        El contenido no interactivo es pointer-events-none, así cada toque
        cae directamente aquí sin pasar por estado hover intermedio.
      */}
      <Link
        href={`/productos/${product.slug}`}
        aria-label={`Ver detalles de ${product.name}`}
        prefetch
        className="absolute inset-0 z-10"
        onClick={() => {
          sessionStorage.setItem("productos-scroll", String(window.scrollY));
        }}
      />

      {/* Badges — informacionales, sin interacción */}
      <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col gap-1 sm:left-3 sm:top-3">
        {product.isOutOfStock && (
          <Badge
            variant="secondary"
            className="border border-border bg-muted text-[10px] font-semibold text-muted-foreground sm:text-xs"
          >
            Sin stock
          </Badge>
        )}
        {hasActiveDiscount && (
          <Badge className="bg-red-500 text-[10px] font-semibold hover:bg-red-500 sm:text-xs">
            {product.discountPercent}% OFF
          </Badge>
        )}
        {product.badge && !hasActiveDiscount && (
          <Badge className="bg-primary text-[10px] font-semibold hover:bg-primary sm:text-xs">
            {product.badge}
          </Badge>
        )}
        {product.minQuantityDiscount && product.quantityDiscountPercent && (
          <Badge
            variant="outline"
            className="bg-background/80 text-[9px] backdrop-blur-sm sm:text-[10px]"
          >
            {product.minQuantityDiscount}+ = {product.quantityDiscountPercent}% OFF
          </Badge>
        )}
      </div>

      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 p-4 sm:p-6">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={cn(
              "object-contain transition-transform duration-300 group-hover:scale-110",
              product.isOutOfStock && "opacity-60 grayscale"
            )}
          />
        </div>
      </div>

      {/*
        Contenido — pointer-events-none en el contenedor para que taps en texto/precio
        caigan al overlay link (z-10). Los botones recuperan pointer-events con
        pointer-events-auto en su propio contenedor (z-20).
      */}
      <div className="pointer-events-none relative z-20 flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-foreground sm:text-base">
          {product.name}
        </h3>

        {product.flavorsCount && product.flavorsCount > 0 ? (
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex -space-x-1.5 overflow-hidden">
              {[...Array(Math.min(product.flavorsCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full border border-background bg-primary/40"
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
              {product.flavorsCount}{" "}
              {product.flavorsCount === 1 ? "sabor disponible" : "sabores disponibles"}
            </span>
          </div>
        ) : null}

        <p className="mb-3 flex-1 line-clamp-2 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
          {product.description}
        </p>

        {/* Precio */}
        <div className="flex items-center gap-2">
          {hasActiveDiscount ? (
            <>
              <span className="text-lg font-bold text-primary sm:text-xl">
                {formatPrice(finalPrice)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary sm:text-xl">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Botones — z-20, pointer-events-auto para capturar taps propios */}
        <div className="pointer-events-auto mt-3 space-y-2 sm:mt-4">
          <Button
            onClick={handleAddToCart}
            size="sm"
            disabled={product.isOutOfStock}
            className="w-full cursor-pointer text-xs disabled:cursor-not-allowed sm:text-sm"
            aria-label={
              product.isOutOfStock
                ? `${product.name} sin stock`
                : `Agregar ${product.name} al carrito`
            }
          >
            {product.isOutOfStock ? (
              "Sin stock"
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
                Agregar al carrito
              </>
            )}
          </Button>

          {/* Ver detalles: oculto en mobile (toda la card ya navega), visible en desktop al hacer hover */}
          <Link
            href={`/productos/${product.slug}`}
            tabIndex={-1}
            aria-hidden
            className="hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full cursor-pointer border-border text-xs sm:text-sm"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              Ver detalles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
