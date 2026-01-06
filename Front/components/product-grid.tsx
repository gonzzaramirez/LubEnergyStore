"use client"

import { useState, useMemo } from "react"
import { products, type Category } from "@/lib/products"
import { CategoryFilter } from "./category-filter"
import { ProductCard } from "./product-card"

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products
    return products.filter((p) => p.category === selectedCategory)
  }, [selectedCategory])

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
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Products Grid */}
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

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No hay productos en esta categoría</p>
          </div>
        )}
      </div>
    </section>
  )
}
