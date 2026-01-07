"use client"

import Link from "next/link"
import { formatPrice, type Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/productos/${product.id}`}>
      <div className="relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card">
        {/* Badge */}
        {product.badge && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {product.badge}
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-1 text-base font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            <span className="text-sm text-muted-foreground">Ver detalles →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
