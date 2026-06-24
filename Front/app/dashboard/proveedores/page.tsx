"use client";

import { useState, useEffect, useCallback } from "react";
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/lib/types";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
} from "@/lib/api/suppliers";
import { toast } from "sonner";
import { Plus, Pencil, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch {
      toast.error("Error al cargar los proveedores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: CreateSupplierDto | UpdateSupplierDto) => {
    try {
      await createSupplier(data as CreateSupplierDto);
      toast.success("Proveedor creado exitosamente");
      setShowCreateDialog(false);
      fetchData();
    } catch {
      toast.error("Error al crear el proveedor");
    }
  };

  const handleUpdate = async (id: string, data: CreateSupplierDto | UpdateSupplierDto) => {
    try {
      await updateSupplier(id, data as UpdateSupplierDto);
      toast.success("Proveedor actualizado exitosamente");
      setEditingSupplier(null);
      fetchData();
    } catch {
      toast.error("Error al actualizar el proveedor");
    }
  };

  const handleDeactivate = async (supplier: Supplier) => {
    if (!confirm(`¿Desactivar proveedor "${supplier.name}"?`)) return;
    try {
      await deactivateSupplier(supplier.id);
      toast.success("Proveedor desactivado");
      fetchData();
    } catch {
      toast.error("Error al desactivar el proveedor");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona los proveedores de productos
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-slate-800 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <SupplierFormDialog
          title="Nuevo Proveedor"
          onSave={handleCreate}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingSupplier && (
        <SupplierFormDialog
          title="Editar Proveedor"
          initial={editingSupplier}
          onSave={(data: CreateSupplierDto | UpdateSupplierDto) => handleUpdate(editingSupplier.id, data)}
          onClose={() => setEditingSupplier(null)}
        />
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay proveedores registrados
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-slate-600">{s.contact || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{s.phone || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{s.email || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {s.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {format(new Date(s.createdAt), "dd/MM/yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSupplier(s)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {s.isActive && (
                          <button
                            onClick={() => handleDeactivate(s)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Desactivar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Inline form dialog for create/edit
function SupplierFormDialog({
  title,
  initial,
  onSave,
  onClose,
}: {
  title: string;
  initial?: Supplier;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    contact: initial?.contact || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    notes: initial?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      const payload: any = { name: form.name.trim() };
      if (form.contact) payload.contact = form.contact;
      if (form.phone) payload.phone = form.phone;
      if (form.email) payload.email = form.email;
      if (form.notes) payload.notes = form.notes;
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Nombre del proveedor"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contacto</label>
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Persona de contacto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Teléfono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Email"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              placeholder="Notas adicionales"
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? "Guardar Cambios" : "Crear Proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
