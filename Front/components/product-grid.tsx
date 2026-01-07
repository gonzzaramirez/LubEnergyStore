"use client"

import { useState, useMemo, useEffect } from "react"
import { type Category } from "@/lib/products"
import { ProductCard } from "./product-card"
import { getProducts } from "@/lib/api/product"
import { getCategories } from "@/lib/api/category"
import { Product as APIProduct, Category as APICategory } from "@/lib/types"

// Tipo para el producto adaptado al formato del componente
interface DisplayProduct {
  id: string
  name: string
  description: string
  price: number // precio en pesos (no centavos)
  category: string
  image: string
  badge?: string
}

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<Category | number>("all")
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [categories, setCategories] = useState<APICategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])

        // Adaptar productos de la API al formato del componente
        const adaptedProducts: DisplayProduct[] = productsData
          .filter((p: APIProduct) => p.isActive !== false) // Solo productos activos
          .map((p: APIProduct) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price, // Precio ya está en pesos argentinos
            category: p.category?.name?.toLowerCase().replace(/\s+/g, "-") || "otros",
            image: p.imageUrl || "/placeholder.svg",
            badge: undefined, // No hay badge en la API por ahora
          }))

        setProducts(adaptedProducts)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products
    if (typeof selectedCategory === "number") {
      // Si es un número, es un ID de categoría
      const category = categories.find((c) => c.id === selectedCategory)
      if (!category) return products
      const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-")
      return products.filter((p) => p.category === categorySlug)
    }
    // Si es un string (categoría legacy)
    return products.filter((p) => p.category === selectedCategory)
  }, [selectedCategory, products, categories])

  // Manejar el cambio de categoría
  const handleCategoryChange = (category: Category | number) => {
    setSelectedCategory(category)
  }

  return (
    <section id="productos" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Nuestros <span className="text-primary">Productos</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Seleccionamos los mejores suplementos para que alcances tus metas
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-5 ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground green-glow"
                  : "border border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-5 ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground green-glow"
                    : "border border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No hay productos en esta categoría</p>
          </div>
        )}
      </div>
    </section>
  )
}
