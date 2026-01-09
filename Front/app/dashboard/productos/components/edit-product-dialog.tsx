"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Percent, History, TrendingUp, Package } from "lucide-react";
import { UpdateProductDto, Product, Category, PriceHistory } from "@/lib/types";
import { updateProduct, getPriceHistory } from "@/lib/api/product";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EditProductDialogProps {
  product: Product | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProductDialog({
  product,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProductDto>();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        categoryId: product.categoryId,
        // Promociones
        discountPercent: product.discountPercent || undefined,
        discountStartDate: product.discountStartDate
          ? product.discountStartDate.split("T")[0]
          : undefined,
        discountEndDate: product.discountEndDate
          ? product.discountEndDate.split("T")[0]
          : undefined,
        // Descuento por cantidad
        minQuantityDiscount: product.minQuantityDiscount || undefined,
        quantityDiscountPercent: product.quantityDiscountPercent || undefined,
      });

      // Cargar historial de precios
      loadPriceHistory(product.id);
    }
  }, [product, reset]);

  const loadPriceHistory = async (productId: string) => {
    try {
      setLoadingHistory(true);
      const history = await getPriceHistory(productId);
      setPriceHistory(history);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: UpdateProductDto) => {
    if (!product) return;

    try {
      setIsLoading(true);
      await updateProduct(product.id, data);
      toast.success("Producto actualizado exitosamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Error al actualizar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica los campos para actualizar el producto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                placeholder="Nombre del producto"
                {...register("name", { required: "El nombre es requerido" })}
                onChange={(e) => {
                  register("name").onChange(e);
                  setValue("slug", generateSlug(e.target.value));
                }}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                placeholder="slug-del-producto"
                {...register("slug", { required: "El slug es requerido" })}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                placeholder="SKU-001"
                {...register("sku", { required: "El SKU es requerido" })}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-categoryId">Categoría</Label>
              <Select
                value={watch("categoryId")?.toString()}
                onValueChange={(value) =>
                  setValue("categoryId", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price", {
                  required: "El precio es requerido",
                  valueAsNumber: true,
                })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stockQuantity">Stock</Label>
              <Input
                id="edit-stockQuantity"
                type="number"
                placeholder="0"
                {...register("stockQuantity", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-imageUrl">URL de Imagen</Label>
              <Input
                id="edit-imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                {...register("imageUrl")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Descripción *</Label>
              <Textarea
                id="edit-description"
                placeholder="Descripción del producto..."
                rows={3}
                {...register("description", {
                  required: "La descripción es requerida",
                })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
                <Label htmlFor="edit-isActive">Producto activo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setValue("isFeatured", checked)}
                />
                <Label htmlFor="edit-isFeatured">Producto destacado</Label>
              </div>
            </div>
          </div>

          {/* Sección de Promociones y Descuentos */}
          <Accordion type="single" collapsible className="w-full">
            {/* Promoción por tiempo */}
            <AccordionItem value="promo">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Promoción por tiempo
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountPercent">% Descuento</Label>
                    <Input
                      id="edit-discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="20"
                      {...register("discountPercent", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Mínimo 0%" },
                        max: { value: 100, message: "Máximo 100%" },
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ej: 20 = 20% de descuento
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountStartDate">Fecha inicio</Label>
                    <Input
                      id="edit-discountStartDate"
                      type="date"
                      {...register("discountStartDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountEndDate">Fecha fin</Label>
                    <Input
                      id="edit-discountEndDate"
                      type="date"
                      {...register("discountEndDate")}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Si no se especifican fechas, el descuento estará siempre activo.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Descuento por cantidad */}
            <AccordionItem value="quantity">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Descuento por cantidad
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-minQuantityDiscount">
                      Cantidad mínima
                    </Label>
                    <Input
                      id="edit-minQuantityDiscount"
                      type="number"
                      min="2"
                      placeholder="2"
                      {...register("minQuantityDiscount", {
                        valueAsNumber: true,
                        min: { value: 2, message: "Mínimo 2 unidades" },
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ej: 2 = comprando 2 o más
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantityDiscountPercent">
                      % Descuento
                    </Label>
                    <Input
                      id="edit-quantityDiscountPercent"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      {...register("quantityDiscountPercent", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Mínimo 0%" },
                        max: { value: 100, message: "Máximo 100%" },
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ej: 10 = 10% off por cantidad
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Historial de precios */}
            <AccordionItem value="history">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial de precios
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : priceHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No hay cambios de precio registrados.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {priceHistory.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp
                            className={`h-4 w-4 ${
                              record.changePercent > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          />
                          <span className="text-muted-foreground">
                            {formatPrice(record.oldPrice)} →{" "}
                            {formatPrice(record.newPrice)}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              record.changePercent > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            ({record.changePercent > 0 ? "+" : ""}
                            {record.changePercent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="hidden sm:inline">
                            {record.reason} -{" "}
                          </span>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
