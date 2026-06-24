import { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${API_URL}/suppliers`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener proveedores");
  }

  return response.json();
}

export async function getSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener el proveedor");
  }

  return response.json();
}

export async function createSupplier(data: CreateSupplierDto): Promise<Supplier> {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al crear el proveedor");
  }

  return response.json();
}

export async function updateSupplier(id: string, data: UpdateSupplierDto): Promise<Supplier> {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el proveedor");
  }

  return response.json();
}

export async function deactivateSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`${API_URL}/suppliers/${id}/deactivate`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al desactivar el proveedor");
  }

  return response.json();
}
