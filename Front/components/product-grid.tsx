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
}

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<Category | number>(
    "all"
  );
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
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
    if (selectedCategory === "all") return products;
    if (typeof selectedCategory === "number") {
      // Si es un número, es un ID de categoría
      const category = categories.find((c) => c.id === selectedCategory);
      if (!category) return products;
      const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
      return products.filter((p) => p.category === categorySlug);
    }
    // Si es un string (categoría legacy)
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products, categories]);

  // Manejar el cambio de categoría
  const handleCategoryChange = (category: Category | number) => {
    setSelectedCategory(category);
  };

  // Separar categorías: primeras 5 como botones, resto en select
  const mainCategories = useMemo(() => categories.slice(0, 5), [categories]);
  const otherCategories = useMemo(() => categories.slice(5), [categories]);

  return (
    <section id="productos" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h2 className="mb-3 text-2xl font-bold text-foreground sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            Nuestros <span className="text-primary">Productos</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
            Seleccionamos los mejores suplementos para que alcances tus metas
          </p>
        </div>

        {/* Category Filter */}
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
