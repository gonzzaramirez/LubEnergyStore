"use client";

import { useState, useMemo, useEffect } from "react";
import { type Category } from "@/lib/products";
import { ProductCard } from "./product-card";
import { getProducts } from "@/lib/api/product";
import { getCategories } from "@/lib/api/category";
import { Product as APIProduct, Category as APICategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipo para el producto adaptado al formato del componente
interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: number; // precio en pesos (no centavos)
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

export interface ProductGridProps {
  featuredOnly?: boolean;
  showFilters?: boolean;
  showTitle?: boolean;
}

export function ProductGrid({
  featuredOnly = false,
  showFilters = true,
  showTitle = true,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | number>(
    "all"
  );
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"cheapest" | "expensive" | "none">(
    "none"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(featuredOnly),
          getCategories(),
        ]);

        // Adaptar productos de la API al formato del componente
        const adaptedProducts: DisplayProduct[] = productsData
          .filter((p: APIProduct) => p.isActive !== false) // Solo productos activos
          .map((p: APIProduct) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price, // Precio ya está en pesos argentinos
            category:
              p.category?.name?.toLowerCase().replace(/\s+/g, "-") || "otros",
            image: p.imageUrl || "/placeholder.svg",
            badge: undefined, // No hay badge en la API por ahora
            // Campos de descuento
            discountPercent: p.discountPercent,
            discountStartDate: p.discountStartDate,
            discountEndDate: p.discountEndDate,
            minQuantityDiscount: p.minQuantityDiscount,
            quantityDiscountPercent: p.quantityDiscountPercent,
          }));

        setProducts(adaptedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Categoría
    if (selectedCategory !== "all") {
      if (typeof selectedCategory === "number") {
        const category = categories.find((c) => c.id === selectedCategory);
        if (category) {
          const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
          result = result.filter((p) => p.category === categorySlug);
        }
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    // Ordenamiento
    if (sortBy === "cheapest") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "expensive") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, products, categories, sortBy]);

  // Manejar el cambio de categoría
  const handleCategoryChange = (category: Category | number) => {
    setSelectedCategory(category);
  };

  // Separar categorías: primeras 5 como botones, resto en select
  const mainCategories = useMemo(() => categories.slice(0, 5), [categories]);
  const otherCategories = useMemo(() => categories.slice(5), [categories]);

  return (
    <section
      id="productos"
      className="relative py-8 sm:py-12 md:py-16 lg:py-20"
    >
      {/* Background Effects - Copiado del hero - Solo cuando no es featuredOnly */}
      {!featuredOnly && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[100px] lg:h-[500px] lg:w-[500px] lg:blur-[120px]" />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(oklch(0.75 0.2 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.2 145) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {showTitle && (
          <div className="mb-6 text-center sm:mb-8 md:mb-10">
            <h2 className="mb-2 text-xl font-bold text-foreground sm:mb-3 sm:text-2xl md:text-3xl lg:text-4xl">
              {featuredOnly ? (
                <>
                  Productos <span className="text-primary">Destacados</span>
                </>
              ) : (
                <>
                  Nuestros <span className="text-primary">Productos</span>
                </>
              )}
            </h2>
            <p className="mx-auto max-w-2xl text-xs text-muted-foreground sm:text-sm md:text-base">
              {featuredOnly
                ? "Echa un vistazo a nuestra selección especial de productos"
                : "Seleccionamos los mejores suplementos para que alcances tus metas"}
            </p>
          </div>
        )}

        {/* Category Filter */}
        {showFilters && (
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm md:px-5 ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground green-glow"
                    : "border border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                Todos
              </button>
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm md:px-5 ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground green-glow"
                      : "border border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {otherCategories.length > 0 && (
                <Select
                  value={
                    typeof selectedCategory === "number" &&
                    otherCategories.some((c) => c.id === selectedCategory)
                      ? selectedCategory.toString()
                      : ""
                  }
                  onValueChange={(value) => {
                    if (value) {
                      handleCategoryChange(Number(value));
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px] rounded-full border border-border bg-secondary text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground data-[state=open]:border-primary/50 sm:h-10 sm:w-[160px] sm:text-sm md:w-[180px]">
                    <SelectValue placeholder="Más categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherCategories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}

        {/* Sort Filter - Encima de los productos, alineado a la derecha - Solo cuando no es featuredOnly */}
        {!isLoading && !featuredOnly && (
          <div className="mb-4 flex justify-end sm:mb-6">
            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="h-9 w-[180px] border border-border bg-secondary text-sm font-medium text-foreground hover:border-primary/50 hover:text-foreground focus:ring-0 sm:w-[200px]">
                <SelectValue placeholder="Ordenar por:" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin orden específico</SelectItem>
                <SelectItem value="cheapest">Menor precio</SelectItem>
                <SelectItem value="expensive">Mayor precio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-8 text-center sm:py-12">
            <p className="text-sm text-muted-foreground sm:text-base">
              No hay productos en esta categoría
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
