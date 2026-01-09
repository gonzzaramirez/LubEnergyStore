import { 
  Product, 
  CreateProductDto, 
  UpdateProductDto,
  BulkPriceUpdateDto,
  BulkPriceUpdateResponse,
  PriceHistory
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- RUTAS PÚBLICAS ---

export async function getProducts(featured?: boolean): Promise<Product[]> {
  const url = new URL(`${API_URL}/products`);
  if (featured !== undefined) {
    url.searchParams.append("featured", featured.toString());
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener productos");
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

// --- RUTAS PROTEGIDAS (requieren auth) ---

export async function getDeletedProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/admin/deleted`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener productos eliminados");
  }

  return response.json();
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al restaurar el producto");
  }

  return response.json();
}

// Aumento/baja masivo de precios
export async function bulkPriceUpdate(
  data: BulkPriceUpdateDto
): Promise<BulkPriceUpdateResponse> {
  const response = await fetch(`${API_URL}/products/bulk-price-update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar precios");
  }

  return response.json();
}

// Historial de precios
export async function getPriceHistory(productId: string): Promise<PriceHistory[]> {
  const response = await fetch(`${API_URL}/products/${productId}/price-history`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener historial de precios");
  }

  return response.json();
}
