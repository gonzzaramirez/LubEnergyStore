"use client"

import { Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { formatPrice, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, justAdded } = useCart()
  const isJustAdded = justAdded === product.id

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:green-glow">
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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 text-base font-semibold text-foreground line-clamp-1">{product.name}</h3>
        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            onClick={() => addItem(product)}
            className={cn("transition-all duration-200", isJustAdded && "bg-green-600 hover:bg-green-600")}
          >
            {isJustAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
