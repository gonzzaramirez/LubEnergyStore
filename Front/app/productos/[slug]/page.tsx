"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/api/product";
import { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, setIsOpen } = useCart();

  const cartItem = product ? items.find((item) => item.id === product.id) : null;
  const isInCart = !!cartItem;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductBySlug(productSlug);
        setProduct(data);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        toast.error("Error al cargar el producto");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug, router]);

  const handleAddToCart = () => {
    if (!product) return;

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
      name: product.name,
      description: product.description,
      price: product.price, // Precio ya está en pesos argentinos
      category: category,
      image: product.imageUrl || "/placeholder.svg",
    };

    // Agregar la cantidad especificada
    for (let i = 0; i < quantity; i++) {
      addItem(cartProduct);
    }

    toast.success(
      `¡${quantity} ${product.name} agregado${
        quantity > 1 ? "s" : ""
      } al carrito!`
    );

    // Opcionalmente abrir el carrito después de agregar
    setTimeout(() => {
      setIsOpen(true);
    }, 500);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <CartSidebar />
        <div className="mx-auto w-full max-w-7xl px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pb-24 ">
          <Link href="/productos">
            <Button variant="ghost" className="mb-6 cursor-pointer sm:mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium sm:text-base">Volver</span>
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <CartSidebar />
        <div className="mx-auto w-full max-w-7xl px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pb-24">
          <h1 className="mb-4 text-xl font-bold sm:text-2xl md:text-3xl">
            Producto no encontrado
          </h1>
          <Link href="/productos">
            <Button className="text-sm sm:text-base">Volver a productos</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const displayPrice = product.price;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <CartSidebar />
      <div className="mx-auto w-full max-w-7xl px-4 pt-20 pb-6 sm:px-6 sm:pt-24 sm:pb-8 md:pt-28 md:pb-12 lg:pb-16">
        {/* Back Button */}
        <Link href="/productos">
          <Button variant="ghost" className="mb-4 cursor-pointer  sm:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium sm:text-base">Volver</span>
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-zinc-950 p-6 sm:rounded-2xl sm:p-12">
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Category Badge */}
            {product.category && (
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="mb-2 text-2xl font-bold text-foreground sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  SKU: {product.sku}
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

            {/* Quantity Selector */}
            <div className="pt-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Selector Estilo Cápsula - Más pequeño en móvil */}
                <div className="flex items-center rounded-full border border-border bg-secondary/10 p-0.5 shrink-0 sm:p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || product.stockQuantity === 0}
                    className="h-7 w-7 rounded-full cursor-pointer sm:h-9 sm:w-9 md:h-10 md:w-10"
                  >
                    <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium tabular-nums sm:w-10 sm:text-base md:w-12 md:text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={product.stockQuantity === 0}
                    className="h-7 w-7 rounded-full cursor-pointer sm:h-9 sm:w-9 md:h-10 md:w-10"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>

                {/* Botón Principal - Más protagonismo en móvil */}
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className="flex-1 rounded-full text-base font-semibold h-12 shadow-md transition-all cursor-pointer hover:shadow-lg green-glow sm:h-12 sm:text-base md:h-14 md:text-lg"
                >
                  {product.stockQuantity === 0 ? (
                    "Sin Stock"
                  ) : (
                    <>
                      Agregar al carrito
                      <ShoppingBag className="ml-2 h-5 w-5 sm:h-4 sm:w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
