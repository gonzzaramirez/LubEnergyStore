"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./components/columns";
import { CreateCategoryDialog } from "./components/create-category-dialog";
import { EditCategoryDialog } from "./components/edit-category-dialog";
import { Category } from "@/lib/types";
import {
  getCategories,
  getDeletedCategories,
  deleteCategory,
  restoreCategory,
} from "@/lib/api/category";
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

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(true);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoringCategory, setRestoringCategory] = useState<Category | null>(
    null
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Error al cargar las categorías");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDeletedData = useCallback(async () => {
    try {
      setIsLoadingDeleted(true);
      const data = await getDeletedCategories();
      setDeletedCategories(data);
    } catch (error) {
      toast.error("Error al cargar las categorías eliminadas");
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast.success("Categoría eliminada exitosamente");
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar la categoría");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  const handleDeleteRows = async (rows: Category[]) => {
    try {
      await Promise.all(rows.map((row) => deleteCategory(row.id)));
      toast.success(`${rows.length} categoría(s) eliminada(s) exitosamente`);
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar las categorías");
    }
  };

  const handleRestore = (category: Category) => {
    setRestoringCategory(category);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!restoringCategory) return;

    try {
      await restoreCategory(restoringCategory.id);
      toast.success("Categoría restaurada exitosamente");
      fetchDeletedData();
      fetchData();
    } catch (error) {
      toast.error("Error al restaurar la categoría");
    } finally {
      setRestoreDialogOpen(false);
      setRestoringCategory(null);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">
          Gestiona las categorías de productos
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="activos">Activas</TabsTrigger>
          <TabsTrigger value="eliminados">Dadas de Baja</TabsTrigger>
        </TabsList>

        <TabsContent value="activos">
          <DataTable
            columns={columns}
            data={categories}
            isLoading={isLoading}
            searchPlaceholder="Buscar categorías..."
            searchColumnId="name"
            onDeleteRows={handleDeleteRows}
            headerActions={<CreateCategoryDialog onSuccess={fetchData} />}
          />
        </TabsContent>

        <TabsContent value="eliminados">
          <DataTable
            columns={deletedColumns}
            data={deletedCategories}
            isLoading={isLoadingDeleted}
            searchPlaceholder="Buscar categorías eliminadas..."
            searchColumnId="name"
            onDeleteRows={handleDeleteRows}
          />
        </TabsContent>
      </Tabs>

      <EditCategoryDialog
        category={editingCategory}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría &quot;{deletingCategory?.name}
              &quot;. Podrás restaurarla más tarde si es necesario .
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
            <AlertDialogTitle>¿Restaurar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción restaurará la categoría &quot;
              {restoringCategory?.name}
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
