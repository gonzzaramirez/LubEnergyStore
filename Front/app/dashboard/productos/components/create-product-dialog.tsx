"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Plus, Loader2 } from "lucide-react";
import { CreateProductDto, Category } from "@/lib/types";
import { createProduct } from "@/lib/api/product";
import { toast } from "sonner";

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductDto>({
    defaultValues: {
      isActive: true,
      stockQuantity: 0,
    },
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
