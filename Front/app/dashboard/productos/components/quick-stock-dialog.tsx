"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Product, ProductFlavor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Package,
  ScanBarcode,
  Search,
  Plus,
  Minus,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

interface QuickStockDialogProps {
  products: Product[];
  onUpdateStock: (
    productId: string,
    quantity: number,
    flavorId?: string
  ) => Promise<void>;
}

export function QuickStockDialog({
  products,
  onUpdateStock,
}: QuickStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<ProductFlavor | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Enfocar el input cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Limpiar estado al cerrar
      setSearchTerm("");
      setSearchResults([]);
      setSelectedProduct(null);
      setSelectedFlavor(null);
      setQuantity(1);
    }
  }, [open]);

  // Búsqueda con debounce
  const searchProducts = useCallback(
    (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const normalizedTerm = term.toLowerCase().trim();

      // Buscar por SKU del producto o SKU de sabores
      const results = products.filter((product) => {
        // Buscar en SKU del producto
        if (product.sku?.toLowerCase().includes(normalizedTerm)) {
          return true;
        }
        // Buscar en nombre del producto
        if (product.name?.toLowerCase().includes(normalizedTerm)) {
          return true;
        }
        // Buscar en SKU de sabores
        if (product.flavors?.some((f) => f.sku?.toLowerCase().includes(normalizedTerm))) {
          return true;
        }
        return false;
      });

      setSearchResults(results.slice(0, 5)); // Máximo 5 resultados
      setIsSearching(false);
    },
    [products]
  );

  // Debounce para la búsqueda
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchProducts(searchTerm);
    }, 200); // 200ms debounce para respuesta rápida

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, searchProducts]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchTerm(product.sku);

    // Si tiene un solo sabor, seleccionarlo automáticamente
    if (product.flavors && product.flavors.length === 1) {
      setSelectedFlavor(product.flavors[0]);
    } else {
      setSelectedFlavor(null);
    }
  };

  const getCurrentStock = () => {
    if (selectedFlavor) {
      return selectedFlavor.stockQuantity;
    }
    if (selectedProduct) {
      if (selectedProduct.flavors && selectedProduct.flavors.length > 0) {
        return selectedProduct.flavors.reduce(
          (acc, f) => acc + f.stockQuantity,
          0
        );
      }
      return selectedProduct.stockQuantity ?? 0;
    }
    return 0;
  };

  const handleSubmit = async () => {
    if (!selectedProduct) return;

    // Validar que si tiene sabores, se haya seleccionado uno
    if (
      selectedProduct.flavors &&
      selectedProduct.flavors.length > 0 &&
      !selectedFlavor
    ) {
      toast.error("Selecciona un sabor para actualizar el stock");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateStock(
        selectedProduct.id,
        quantity,
        selectedFlavor?.id
      );
      toast.success(
        `Stock actualizado: +${quantity} unidades a "${
          selectedFlavor?.name || selectedProduct.name
        }"`
      );
      // Resetear para siguiente escaneo
      setSelectedProduct(null);
      setSelectedFlavor(null);
      setSearchTerm("");
      setQuantity(1);
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Error al actualizar el stock");
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar Enter para confirmar rápido
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selectedProduct && !isUpdating) {
      // Si tiene sabores y no se ha seleccionado uno, no hacer nada
      if (
        selectedProduct.flavors &&
        selectedProduct.flavors.length > 1 &&
        !selectedFlavor
      ) {
        return;
      }
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ScanBarcode className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar Stock</span>
          <span className="sm:hidden">Stock</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5 text-primary" />
            Agregar Stock Rápido
          </DialogTitle>
          <DialogDescription>
            Escanea el código de barras o busca por SKU/nombre para actualizar
            el stock rápidamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input de búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="sku-search">Código / SKU / Nombre</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="sku-search"
                ref={inputRef}
                placeholder="Escanea o escribe el código..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedProduct) {
                    setSelectedProduct(null);
                    setSelectedFlavor(null);
                  }
                }}
                className="pl-10 pr-10 h-12 text-lg"
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && !selectedProduct && (
              <div className="border rounded-md divide-y bg-background shadow-lg max-h-[200px] overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => selectProduct(product)}
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      Stock:{" "}
                      {product.flavors && product.flavors.length > 0
                        ? product.flavors.reduce(
                            (acc, f) => acc + f.stockQuantity,
                            0
                          )
                        : product.stockQuantity ?? 0}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {searchTerm.length > 2 &&
              searchResults.length === 0 &&
              !isSearching &&
              !selectedProduct && (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    No se encontraron productos con ese código
                  </span>
                </div>
              )}
          </div>

          {/* Producto seleccionado */}
          {selectedProduct && (
            <div className="space-y-4 p-4 border rounded-lg bg-accent/30">
              <div className="flex items-start gap-3">
                {selectedProduct.imageUrl && (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedProduct.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    SKU: {selectedProduct.sku}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={getCurrentStock() > 0 ? "default" : "destructive"}
                    >
                      Stock actual: {getCurrentStock()}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedFlavor(null);
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                >
                  Cambiar
                </Button>
              </div>

              {/* Selector de sabor si aplica */}
              {selectedProduct.flavors &&
                selectedProduct.flavors.length > 1 && (
                  <div className="space-y-2">
                    <Label>Seleccionar Sabor</Label>
                    <Select
                      value={selectedFlavor?.id || ""}
                      onValueChange={(value) => {
                        const flavor = selectedProduct.flavors?.find(
                          (f) => f.id === value
                        );
                        setSelectedFlavor(flavor || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un sabor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct.flavors.map((flavor) => (
                          <SelectItem key={flavor.id} value={flavor.id}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span>{flavor.name}</span>
                              <Badge variant="outline" className="ml-auto">
                                Stock: {flavor.stockQuantity}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Input de cantidad */}
              <div className="space-y-2">
                <Label>Cantidad a agregar</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="h-12 text-center text-xl font-semibold w-24"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {/* Botones de cantidad rápida */}
                  <div className="flex gap-1 ml-2">
                    {[5, 10, 20].map((num) => (
                      <Button
                        key={num}
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setQuantity(num)}
                      >
                        +{num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview del resultado */}
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border border-primary/20">
                <span className="text-sm">Nuevo stock total:</span>
                <span className="font-bold text-lg text-primary">
                  {getCurrentStock()} + {quantity} = {getCurrentStock() + quantity}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedProduct ||
              isUpdating ||
              (selectedProduct.flavors &&
                selectedProduct.flavors.length > 1 &&
                !selectedFlavor)
            }
            className="gap-2"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Confirmar (+{quantity})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
