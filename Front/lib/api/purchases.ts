const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PurchaseOrderLineDto {
  productId?: string;
  flavorId?: string;
  productName: string;
  flavorName?: string;
  quantity: number;
  unitPurchasePrice: number;
  unitSalePrice?: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  notes?: string;
  lines: PurchaseOrderLineDto[];
}

export interface PurchaseOrderLine {
  id: string;
  orderId: string;
  productId: string | null;
  flavorId: string | null;
  productName: string;
  flavorName: string | null;
  quantity: number;
  remaining: number;
  unitPurchasePrice: number;
  unitSalePrice?: number | null;
  product?: { id: string; name: string; price: number } | null;
  flavor?: { id: string; name: string } | null;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  receivedAt: string | null;
  updatedAt: string;
  supplier: { id: string; name: string };
  lines: PurchaseOrderLine[];
}

export interface PaginatedPurchasesResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPurchases(
  page?: number,
  limit?: number,
  status?: string,
): Promise<PaginatedPurchasesResponse> {
  const url = new URL(`${API_URL}/purchases`);
  if (page) url.searchParams.append('page', page.toString());
  if (limit) url.searchParams.append('limit', limit.toString());
  if (status) url.searchParams.append('status', status);

  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener órdenes de compra");
  }

  return response.json();
}

export async function getPurchase(id: string): Promise<PurchaseOrder> {
  const response = await fetch(`${API_URL}/purchases/${id}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la orden de compra");
  }

  return response.json();
}

export async function createPurchase(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
  const response = await fetch(`${API_URL}/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al crear la orden de compra");
  }

  return response.json();
}

export async function receivePurchase(id: string): Promise<PurchaseOrder> {
  const response = await fetch(`${API_URL}/purchases/${id}/receive`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al recibir la orden de compra");
  }

  return response.json();
}

export async function cancelPurchase(id: string): Promise<PurchaseOrder> {
  const response = await fetch(`${API_URL}/purchases/${id}/cancel`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al cancelar la orden de compra");
  }

  return response.json();
}
