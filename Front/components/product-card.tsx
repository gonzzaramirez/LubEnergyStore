"use client"

import Link from "next/link"
import Image from "next/image"
import { formatPrice, type Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/productos/${product.id}`}>
      <div className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
        {/* Badge */}
        {product.badge && (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
            {product.badge}
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 p-4 sm:p-6">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-1 sm:text-base">{product.name}</h3>
          <p className="mb-3 flex-1 text-xs text-muted-foreground line-clamp-2 sm:mb-4 sm:text-sm">{product.description}</p>

          <div className="flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-lg font-bold text-primary sm:text-xl">{formatPrice(product.price)}</span>
            <span className="text-xs text-muted-foreground sm:text-sm">Ver detalles →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
