"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Loader2, Trash2 } from "lucide-react";
import { CreateProductDto, Category, Supplier } from "@/lib/types";
import { createProduct } from "@/lib/api/product";
import { getSuppliers } from "@/lib/api/suppliers";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface CreateProductDialogProps {
  categories: Category[];
  onSuccess: () => void;
}

export function CreateProductDialog({
  categories,
  onSuccess,
}: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    if (open) {
      getSuppliers().then(setSuppliers).catch(() => {});
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateProductDto>({
    defaultValues: {
      isActive: true,
      stockQuantity: 0,
      flavors: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "flavors",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: CreateProductDto) => {
    try {
      setIsLoading(true);
      await createProduct(data);
      toast.success("Producto creado exitosamente");
      reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Error al crear el producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Producto</DialogTitle>
          <DialogDescription>
            Completa los campos para crear un nuevo producto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
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
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
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
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="SKU-001"
                {...register("sku", { required: "El SKU es requerido" })}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <Select
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
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
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
              <Label htmlFor="stockQuantity">Stock</Label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="0"
                {...register("stockQuantity", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Precio de compra</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="0"
                {...register("purchasePrice", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Costo por unidad (opcional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSupplierId">Proveedor por defecto</Label>
              <Select
                onValueChange={(value) => setValue("defaultSupplierId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter((s) => s.isActive).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se autocompletará al crear una orden de compra
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">URL de Imagen</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                {...register("imageUrl")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
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

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Sabores / Variantes</Label>
                  <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ name: "", stockQuantity: 0, isActive: true, price: undefined, purchasePrice: undefined })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sabor
                </Button>
              </div>
              <Separator />
              {fields.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                          <Label>Nombre del Sabor</Label>
                          <Input
                            placeholder="Ej: Vainilla, Chocolate..."
                            {...register(`flavors.${index}.name` as const, { required: true })}
                          />
                        </div>
                        <div className="w-24 space-y-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            {...register(`flavors.${index}.stockQuantity` as const, { 
                              required: true, 
                              valueAsNumber: true 
                            })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-10 w-10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>SKU (Opcional)</Label>
                          <Input
                            placeholder="SKU-FLAV-001"
                            {...register(`flavors.${index}.sku` as const)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL Imagen (Opcional)</Label>
                          <Input
                            placeholder="https://..."
                            {...register(`flavors.${index}.imageUrl` as const)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Precio venta (opcional)</Label>
                          <Input
                            type="number"
                            placeholder="Ej: 15000"
                            {...register(`flavors.${index}.price` as const, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Precio compra (opcional)</Label>
                          <Input
                            type="number"
                            placeholder="Ej: 5000"
                            {...register(`flavors.${index}.purchasePrice` as const, { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic py-2">
                  No hay sabores agregados. El producto se tratará como unidad simple.
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  defaultChecked={true}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Producto activo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  defaultChecked={false}
                  onCheckedChange={(checked) => setValue("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured">Producto destacado</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
