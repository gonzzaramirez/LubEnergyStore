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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipo para el producto adaptado al formato del componente
interface DisplayProduct {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"cheapest" | "expensive" | "none">(
    "none"
  );

  const useCatalogSidebar = showFilters && !featuredOnly;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Solo pasar featured=true cuando featuredOnly es true
        // Cuando featuredOnly es false, no pasar parámetro para obtener TODOS los productos
        const [productsData, categoriesData] = await Promise.all([
          getProducts(featuredOnly ? true : undefined),
          getCategories(),
        ]);

        // Adaptar productos de la API al formato del componente
        const adaptedProducts: DisplayProduct[] = productsData
          .filter((p: APIProduct) => p.isActive !== false) // Solo productos activos
          .map((p: APIProduct) => ({
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

        setProducts(adaptedProducts);
        setCategories(categoriesData);
      } catch (error) {
        // Error silencioso en producción
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [featuredOnly]);

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

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Ordenamiento
    if (sortBy === "cheapest") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "expensive") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, products, categories, sortBy, searchQuery]);

  // Manejar el cambio de categoría
  const handleCategoryChange = (category: Category | number) => {
    setSelectedCategory(category);
  };

  // Ordenar categorías: creatina debe estar en segundo lugar
  const sortedCategories = useMemo(() => {
    const creatinaCategory = categories.find((c) =>
      c.name.toLowerCase().includes("creatina")
    );
    const otherCategories = categories.filter(
      (c) => !c.name.toLowerCase().includes("creatina")
    );

    if (!creatinaCategory) {
      return categories; // Si no existe creatina, devolver orden original
    }

    // Si hay al menos otra categoría, poner creatina segunda
    if (otherCategories.length > 0) {
      return [
        otherCategories[0],
        creatinaCategory,
        ...otherCategories.slice(1),
      ];
    }

    return [creatinaCategory, ...otherCategories];
  }, [categories]);

  // Separar categorías: primeras 5 como botones, resto en select
  const mainCategories = useMemo(
    () => sortedCategories.slice(0, 5),
    [sortedCategories]
  );
  const otherCategories = useMemo(
    () => sortedCategories.slice(5),
    [sortedCategories]
  );

  const categoryBtnClass = (active: boolean, fullWidth = false) =>
    cn(
      "text-xs font-medium transition-all duration-200 sm:text-sm",
      fullWidth
        ? "w-full rounded-lg px-4 py-2.5 text-left"
        : "rounded-full px-3 py-1.5 sm:px-4 sm:py-2 md:px-5",
      active
        ? "bg-primary text-primary-foreground green-glow"
        : "border border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
    );

  const emptyMessage = searchQuery.trim()
    ? "No hay productos que coincidan con tu búsqueda."
    : "No hay productos en esta categoría";

  const sortSelect = !featuredOnly && (
    <div className="mb-4 flex justify-end sm:mb-6">
      <Select
        value={sortBy}
        onValueChange={(value: "cheapest" | "expensive" | "none") =>
          setSortBy(value)
        }
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
  );

  const skeletonGrid = (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Cargando productos..."
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card animate-pulse"
        >
          <div className="aspect-square bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="mt-4 h-6 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );

  const productsGrid = (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
      aria-label={`${filteredProducts.length} productos encontrados`}
    >
      {filteredProducts.map((product, index) => (
        <div
          key={product.id}
          role="listitem"
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
  );

  const emptyBlock =
    !isLoading && filteredProducts.length === 0 ? (
      <div className="py-8 text-center sm:py-12" role="status">
        <p className="text-sm text-muted-foreground sm:text-base">
          {emptyMessage}
        </p>
      </div>
    ) : null;

  return (
    <section
      id="productos"
      className="relative py-8 sm:py-12 md:py-16 lg:py-20"
      aria-labelledby="products-heading"
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
            <h2
              id="products-heading"
              className="mb-2 text-xl font-bold text-foreground sm:mb-3 sm:text-2xl md:text-3xl lg:text-4xl"
            >
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

        {/* Categorías horizontales: solo destacados con filtros */}
        {showFilters && featuredOnly && (
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
              role="group"
              aria-label="Filtrar por categoría"
            >
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                aria-pressed={selectedCategory === "all"}
                className={categoryBtnClass(selectedCategory === "all")}
              >
                Todos
              </button>
              {mainCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  className={categoryBtnClass(
                    selectedCategory === category.id
                  )}
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

        {/* Catálogo completo: sidebar categorías + búsqueda / grid */}
        {useCatalogSidebar && isLoading && skeletonGrid}

        {useCatalogSidebar && !isLoading && (
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(220px,280px)_1fr] lg:items-start lg:gap-10">
            <aside
              className="w-full space-y-6 lg:sticky lg:top-24"
              aria-label="Filtros del catálogo"
            >
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categorías
                </p>
                <div
                  className="flex flex-col gap-2"
                  role="group"
                  aria-label="Filtrar por categoría"
                >
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    aria-pressed={selectedCategory === "all"}
                    className={categoryBtnClass(
                      selectedCategory === "all",
                      true
                    )}
                  >
                    Todos
                  </button>
                  {mainCategories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      aria-pressed={selectedCategory === category.id}
                      className={categoryBtnClass(
                        selectedCategory === category.id,
                        true
                      )}
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
                      <SelectTrigger
                        className={cn(
                          "h-10 w-full rounded-lg border border-border bg-secondary text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground data-[state=open]:border-primary/50",
                          typeof selectedCategory === "number" &&
                            otherCategories.some(
                              (c) => c.id === selectedCategory
                            ) &&
                            "border-primary/50 text-foreground"
                        )}
                      >
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

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Buscar por nombre
                </p>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    className="border-border bg-secondary pl-9 placeholder:text-muted-foreground/70"
                    placeholder="Ej: proteína, creatina…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Buscar producto por nombre"
                  />
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              {sortSelect}
              {productsGrid}
              {emptyBlock}
            </div>
          </div>
        )}

        {/* Resto: sin sidebar (sin filtros o mismo loading path) */}
        {!useCatalogSidebar && (
          <>
            {!isLoading && !featuredOnly && sortSelect}
            {isLoading ? skeletonGrid : productsGrid}
            {!useCatalogSidebar && emptyBlock}
          </>
        )}
      </div>
    </section>
  );
}
