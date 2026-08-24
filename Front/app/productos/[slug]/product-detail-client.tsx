"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductFlavor } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slug";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<ProductFlavor | null>(
    product.flavors && product.flavors.length > 0 ? product.flavors[0] : null
  );

  const { addItem, items, setIsOpen } = useCart();

  const handleAddToCart = () => {
    if (product.flavors && product.flavors.length > 0 && !selectedFlavor) {
      toast.error("Por favor selecciona un sabor");
      return;
    }

    // Convertir nombre de categoría a tipo Category del carrito
    const categoryName =
      product.category?.name?.toLowerCase().replace(/\s+/g, "-") || "otros";
    const category:
      | "all"
      | "proteinas"
      | "creatinas"
      | "pre-entrenos"
      | "aminoacidos"
      | "vitaminas" =
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
        : ("otros" as "proteinas");

    // Adaptar producto al formato del carrito
    const cartProduct = {
      id: product.id,
      name: selectedFlavor ? `${product.name} (${selectedFlavor.name})` : product.name,
      description: product.description,
      price: product.price,
      category: category,
      image: selectedFlavor?.imageUrl || product.imageUrl || "/placeholder.svg",
      flavorId: selectedFlavor?.id,
      flavorName: selectedFlavor?.name,
    };

    // Agregar la cantidad especificada
    for (let i = 0; i < quantity; i++) {
      addItem(cartProduct as any);
    }

    toast.success(
      `¡${quantity} ${cartProduct.name} agregado${
        quantity > 1 ? "s" : ""
      } al carrito!`
    );

    // Abrir el carrito después de agregar
    setTimeout(() => {
      setIsOpen(true);
    }, 500);
  };

  const displayPrice = product.price;

  // Verificar stock total o de sabor seleccionado
  const currentStock = selectedFlavor 
    ? selectedFlavor.stockQuantity 
    : (product.flavors && product.flavors.length > 0)
      ? product.flavors.reduce((acc, f) => acc + f.stockQuantity, 0)
      : product.stockQuantity || 0;

  const isOutOfStock = currentStock === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 md:pt-12 md:pb-12 lg:pb-16">
      {/* Back Button */}
      <Link href="/productos">
        <Button variant="ghost" className="mb-4 cursor-pointer sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium sm:text-base">Volver</span>
        </Button>
      </Link>

      {/* Product Details */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Section */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-zinc-950 p-6 sm:rounded-2xl sm:p-12">
          <Image
            src={selectedFlavor?.imageUrl || product.imageUrl || "/placeholder.svg"}
            alt={`${product.name}${selectedFlavor ? ` - ${selectedFlavor.name}` : ''} - ${product.category?.name || 'Suplemento deportivo'} | LUB ENERGY`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition-all duration-300"
            priority
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Category Badge - links to the category hub */}
          {product.category && (
            <div>
              <Link
                href={`/productos/categoria/${slugify(product.category.name)}`}
                className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 sm:px-4 sm:py-2 sm:text-sm"
              >
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Title */}
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
              {product.name}
              {selectedFlavor && (
                <span className="text-muted-foreground block text-sm font-medium sm:inline sm:ml-3 sm:text-base md:text-lg lg:text-xl">
                  ({selectedFlavor.name})
                </span>
              )}
            </h1>
            {(selectedFlavor?.sku || product.sku) && (
              <p className="text-xs text-muted-foreground sm:text-sm">
                SKU: {selectedFlavor?.sku || product.sku}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="text-3xl font-bold text-primary sm:text-4xl md:text-5xl">
              {formatPrice(displayPrice)}
            </span>
            {product.stockQuantity === 0 && (
              <span className="text-xs font-medium text-red-600 sm:text-sm">
                Sin stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold sm:text-xl">Descripción</h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Flavor Selector */}
          {product.flavors && product.flavors.length > 0 && (
            <div className="space-y-4 pt-2">
              <h2 className="text-lg font-semibold sm:text-xl">Seleccionar Sabor</h2>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavor(flavor)}
                    disabled={flavor.stockQuantity === 0}
                    className={cn(
                      "relative flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer",
                      selectedFlavor?.id === flavor.id
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-secondary/5 text-muted-foreground hover:border-primary/50 hover:bg-secondary/10",
                      flavor.stockQuantity === 0 && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    {flavor.name}
                    {selectedFlavor?.id === flavor.id && (
                      <Check className="h-4 w-4" />
                    )}
                    {flavor.stockQuantity === 0 && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                        Sin stock
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Selector Estilo Cápsula */}
              <div className="flex items-center rounded-full border border-border bg-secondary/10 p-0.5 shrink-0 sm:p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="h-7 w-7 rounded-full cursor-pointer sm:h-9 sm:w-9 md:h-10 md:w-10"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </Button>
                <span 
                  className="w-8 text-center text-sm font-medium tabular-nums sm:w-10 sm:text-base md:w-12 md:text-lg"
                  aria-live="polite"
                  aria-label={`Cantidad: ${quantity}`}
                >
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={isOutOfStock || (selectedFlavor ? quantity >= selectedFlavor.stockQuantity : false)}
                  className="h-7 w-7 rounded-full cursor-pointer sm:h-9 sm:w-9 md:h-10 md:w-10"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>

              {/* Botón Principal */}
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 rounded-full text-base font-semibold h-12 shadow-md transition-all cursor-pointer hover:shadow-lg green-glow sm:h-12 sm:text-base md:h-14 md:text-lg"
                aria-label={isOutOfStock ? "Producto sin stock" : `Agregar ${quantity} ${product.name} al carrito`}
              >
                {isOutOfStock ? (
                  "Sin Stock"
                ) : (
                  <>
                    Agregar al carrito
                    <ShoppingBag className="ml-2 h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
