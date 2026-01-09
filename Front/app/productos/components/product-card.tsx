"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice, type Product, type Category } from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
  // Campos de descuento
  discountPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  minQuantityDiscount?: number;
  quantityDiscountPercent?: number;
}

interface ProductCardProps {
  product: DisplayProduct;
}

// Verificar si el descuento está activo
function isDiscountActive(product: DisplayProduct): boolean {
  if (!product.discountPercent || product.discountPercent <= 0) return false;

  const now = new Date();

  if (product.discountStartDate && new Date(product.discountStartDate) > now) {
    return false;
  }

  if (product.discountEndDate && new Date(product.discountEndDate) < now) {
    return false;
  }

  return true;
}

// Calcular precio con descuento
function getDiscountedPrice(product: DisplayProduct): number {
  if (!isDiscountActive(product)) return product.price;
  return Math.round(product.price * (1 - (product.discountPercent || 0) / 100));
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const hasActiveDiscount = isDiscountActive(product);
  const finalPrice = getDiscountedPrice(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Convertir categoría string a tipo Category del carrito
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

    // Adaptar producto al formato del carrito (con precio con descuento aplicado)
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: finalPrice, // Usar precio con descuento
      category: category,
      image: product.image,
      badge: product.badge,
    };

    addItem(cartProduct);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleCardClick = () => {
    router.push(`/productos/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Badges Container */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-3 sm:top-3">
        {/* Badge de descuento */}
        {hasActiveDiscount && (
          <Badge className="bg-red-500 hover:bg-red-500 text-[10px] sm:text-xs font-semibold">
            {product.discountPercent}% OFF
          </Badge>
        )}
        {/* Badge original */}
        {product.badge && !hasActiveDiscount && (
          <Badge className="bg-primary hover:bg-primary text-[10px] sm:text-xs font-semibold">
            {product.badge}
          </Badge>
        )}
        {/* Badge de descuento por cantidad */}
        {product.minQuantityDiscount && product.quantityDiscountPercent && (
          <Badge
            variant="outline"
            className="text-[9px] sm:text-[10px] bg-background/80 backdrop-blur-sm"
          >
            {product.minQuantityDiscount}+ = {product.quantityDiscountPercent}%
            OFF
          </Badge>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 p-4 sm:p-6">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-1 sm:text-base">
          {product.name}
        </h3>
        <p className="mb-3 flex-1 text-xs text-muted-foreground line-clamp-2 sm:mb-4 sm:text-sm">
          {product.description}
        </p>

        {/* Precios */}
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

        {/* Action Buttons */}
        <div className="mt-3 space-y-2 sm:mt-4">
          <Button
            onClick={handleAddToCart}
            size="sm"
            className=" w-full text-xs sm:text-sm cursor-pointer"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            Agregar al carrito
          </Button>
          <Link
            href={`/productos/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`group/link block transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full border-border text-xs  sm:text-sm cursor-pointer"
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
