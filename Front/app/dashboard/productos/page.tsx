"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./components/columns";
import { CreateProductDialog } from "./components/create-product-dialog";
import { EditProductDialog } from "./components/edit-product-dialog";
import { CategoryFilter } from "./components/category-filter";
import { QuickStockDialog } from "./components/quick-stock-dialog";
import { Product, Category } from "@/lib/types";
import {
  getProducts,
  getDeletedProducts,
  deleteProduct,
  restoreProduct,
  updateProductStock,
} from "@/lib/api/product";
import { getCategories } from "@/lib/api/category";
import { toast } from "sonner";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(true);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoringProduct, setRestoringProduct] = useState<Product | null>(
    null
  );
  // Nuevo: filtro de categorías
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDeletedData = useCallback(async () => {
    try {
      setIsLoadingDeleted(true);
      const data = await getDeletedProducts();
      setDeletedProducts(data);
    } catch (error) {
      toast.error("Error al cargar los productos eliminados");
    } finally {
      setIsLoadingDeleted(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (activeTab === "eliminados") {
      fetchDeletedData();
    }
  }, [fetchData, fetchDeletedData, activeTab]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      toast.success("Producto eliminado exitosamente");
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar el producto");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    }
  };

  const handleDeleteRows = async (rows: Product[]) => {
    try {
      await Promise.all(rows.map((row) => deleteProduct(row.id)));
      toast.success(`${rows.length} producto(s) eliminado(s) exitosamente`);
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar los productos");
    }
  };

  const handleRestore = (product: Product) => {
    setRestoringProduct(product);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!restoringProduct) return;

    try {
      await restoreProduct(restoringProduct.id);
      toast.success("Producto restaurado exitosamente");
      fetchDeletedData();
      fetchData();
    } catch (error) {
      toast.error("Error al restaurar el producto");
    } finally {
      setRestoreDialogOpen(false);
      setRestoringProduct(null);
    }
  };

  // Handler para actualizar stock rápido
  const handleUpdateStock = async (
    productId: string,
    quantity: number,
    flavorId?: string
  ) => {
    await updateProductStock(productId, quantity, flavorId);
    fetchData(); // Refrescar la lista
  };

  // Filtrar productos por categorías seleccionadas
  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) {
      return products;
    }
    return products.filter(
      (product) =>
        product.categoryId && selectedCategories.includes(product.categoryId)
    );
  }, [products, selectedCategories]);

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const deletedColumns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <p className="text-muted-foreground">
          Gestiona los productos de tu tienda
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="eliminados">Dados de Baja</TabsTrigger>
        </TabsList>

        <TabsContent value="activos">
          <DataTable
            columns={columns}
            data={filteredProducts}
            isLoading={isLoading}
            searchPlaceholder="Buscar productos..."
            searchColumnId="name"
            initialPageSize={25}
            onDeleteRows={handleDeleteRows}
            filterComponent={
              <CategoryFilter
                categories={categories}
                selectedCategories={selectedCategories}
                onSelectionChange={setSelectedCategories}
              />
            }
            headerActions={
              <div className="flex items-center gap-2">
                <QuickStockDialog
                  products={products}
                  onUpdateStock={handleUpdateStock}
                />
                <CreateProductDialog
                  categories={categories}
                  onSuccess={fetchData}
                />
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="eliminados">
          <DataTable
            columns={deletedColumns}
            data={deletedProducts}
            isLoading={isLoadingDeleted}
            searchPlaceholder="Buscar productos eliminados..."
            searchColumnId="name"
            initialPageSize={25}
            onDeleteRows={handleDeleteRows}
          />
        </TabsContent>
      </Tabs>

      <EditProductDialog
        product={editingProduct}
        categories={categories}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto &quot;{deletingProduct?.name}
              &quot;. Podrás restaurarla más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción restaurará el producto &quot;{restoringProduct?.name}
              &quot; y estará disponible nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
