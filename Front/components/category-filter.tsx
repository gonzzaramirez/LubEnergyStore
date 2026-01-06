"use client"

import { categories, type Category } from "@/lib/products"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selected: Category
  onSelect: (category: Category) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div id="categorias" className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:px-5",
            selected === category.id
              ? "bg-primary text-primary-foreground green-glow"
              : "border border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
