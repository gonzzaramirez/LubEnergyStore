"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getCategories } from "@/lib/api/category";
import { bulkPriceUpdate, getProducts } from "@/lib/api/product";
import { Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";

export default function PreciosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      toast.error("Error al cargar datos");
    }
  };

  const getAffectedProducts = () => {
    if (selectedCategory === "all") {
      return products;
    }
    return products.filter(
      (p) => p.categoryId === parseInt(selectedCategory)
    );
  };

  const handleSubmit = () => {
    if (percentChange === 0) {
      toast.error("Ingresa un porcentaje diferente de 0");
      return;
    }
    setShowConfirm(true);
  };

  const confirmUpdate = async () => {
    try {
      setIsLoading(true);
      const result = await bulkPriceUpdate({
        percentChange,
        categoryId: selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
        reason: reason || undefined,
      });
      toast.success(result.message);
      setPercentChange(0);
      setReason("");
      setSelectedCategory("all");
      loadData();
    } catch (error) {
      toast.error("Error al actualizar precios");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const affectedProducts = getAffectedProducts();
  const previewNewPrices = affectedProducts.slice(0, 5).map((p) => ({
    ...p,
    newPrice: Math.round(p.price * (1 + percentChange / 100)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajuste de Precios</h1>
        <p className="text-muted-foreground">
          Aumenta o reduce los precios de todos los productos o por categoría
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {percentChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-500" />
              )}
              Ajuste Masivo
            </CardTitle>
            <CardDescription>
              Aplica un porcentaje de aumento o reducción a los precios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Porcentaje de cambio</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={percentChange}
                  onChange={(e) => setPercentChange(Number(e.target.value))}
                  placeholder="0"
                  className="w-32"
                />
                <span className="text-muted-foreground">%</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPercentChange(5)}
                  >
                    +5%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPercentChange(10)}
                  >
                    +10%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPercentChange(15)}
                  >
                    +15%
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Usa números positivos para aumentar, negativos para reducir
              </p>
            </div>

            <div className="space-y-2">
              <Label>Aplicar a</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Ajuste por inflación enero 2025"
              />
              <p className="text-xs text-muted-foreground">
                Se guardará en el historial de precios
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || percentChange === 0}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar Cambio a {affectedProducts.length} productos
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Así quedarán los precios después del cambio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {percentChange === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ingresa un porcentaje para ver la vista previa
              </p>
            ) : (
              <div className="space-y-3">
                {previewNewPrices.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm">→</span>
                      <span
                        className={`text-sm font-bold ${
                          percentChange > 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {formatPrice(product.newPrice)}
                      </span>
                    </div>
                  </div>
                ))}
                {affectedProducts.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... y {affectedProducts.length - 5} productos más
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmación */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar cambio de precios
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás por {percentChange > 0 ? "aumentar" : "reducir"} el precio de{" "}
              <strong>{affectedProducts.length} productos</strong> en{" "}
              <strong>{Math.abs(percentChange)}%</strong>.
              <br />
              <br />
              Esta acción quedará registrada en el historial de precios y puede
              revertirse manualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
