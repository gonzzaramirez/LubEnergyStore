import { Product, CreateProductDto, UpdateProductDto } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  return response.json();
}

export async function getDeletedProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/deleted`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener productos eliminados");
  }

  return response.json();
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener el producto");
  }

  return response.json();
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al crear el producto");
  }

  return response.json();
}

export async function updateProduct(
  id: string,
  data: UpdateProductDto
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el producto");
  }

  return response.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar el producto");
  }
}

export async function restoreProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}/restore`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al restaurar el producto");
  }

  return response.json();
}
