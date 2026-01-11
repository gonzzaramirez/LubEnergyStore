"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, X, Filter } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onSelectionChange: (categories: number[]) => void;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onSelectionChange,
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectedCategoryNames = categories
    .filter((c) => selectedCategories.includes(c.id))
    .map((c) => c.name);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 border-dashed",
              selectedCategories.length > 0 && "border-primary"
            )}
          >
            <Filter className="mr-2 h-4 w-4" />
            Categorías
            {selectedCategories.length > 0 && (
              <>
                <span className="mx-2 h-4 w-px bg-border" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedCategories.length}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedCategories.length > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedCategories.length} seleccionadas
                    </Badge>
                  ) : (
                    selectedCategoryNames.map((name) => (
                      <Badge
                        key={name}
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {name}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <div className="p-2">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-sm font-medium">Filtrar por categoría</span>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={clearAll}
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto py-2">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-center space-x-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
                      "hover:bg-accent",
                      isSelected && "bg-accent/50"
                    )}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(category.id)}
                      className="pointer-events-none"
                    />
                    <label
                      htmlFor={`cat-${category.id}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges de categorías seleccionadas (para quitar rápido) */}
      {selectedCategories.length > 0 && (
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {selectedCategoryNames.slice(0, 3).map((name, idx) => (
            <Badge
              key={name}
              variant="default"
              className="gap-1 pl-2 pr-1 cursor-pointer hover:bg-primary/80"
              onClick={() =>
                toggleCategory(
                  categories.find((c) => c.name === name)?.id || 0
                )
              }
            >
              {name}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedCategories.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedCategories.length - 3} más
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
