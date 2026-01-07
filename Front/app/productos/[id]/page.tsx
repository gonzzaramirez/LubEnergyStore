"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/api/product";
import { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, setIsOpen } = useCart();

  const cartItem = items.find((item) => item.id === productId);
  const isInCart = !!cartItem;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProduct(productId);
        setProduct(data);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        toast.error("Error al cargar el producto");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Link href="/#productos">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
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
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="mb-4 text-2xl font-bold">Producto no encontrado</h1>
          <Link href="/#productos">
            <Button>Volver a productos</Button>
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16">
        {/* Back Button */}
        <Link href="/#productos">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        {/* Product Details */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary/50">
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col space-y-6">
            {/* Category Badge */}
            {product.category && (
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-primary">
                {formatPrice(displayPrice)}
              </span>
              {product.stockQuantity !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    product.stockQuantity > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.stockQuantity > 0
                    ? `${product.stockQuantity} en stock`
                    : "Sin stock"}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center gap-2 rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[3rem] text-center font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="w-full text-lg shadow-lg transition-all hover:shadow-xl"
              >
                {isInCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Agregado al carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Agregar al carrito
                  </>
                )}
              </Button>

              {isInCart && (
                <div className="flex items-center justify-center gap-2">
                  <p className="text-center text-sm text-muted-foreground">
                    {cartItem.quantity} en tu carrito
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="text-xs"
                  >
                    Ver carrito
                  </Button>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-4 border-t border-border pt-6">
              <div className="grid gap-4 text-sm">
                {product.stockQuantity !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Stock disponible:
                    </span>
                    <span className="font-medium">{product.stockQuantity}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
