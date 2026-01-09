import {
  Order,
  CreateOrderDto,
  CreateOrderResponse,
  OrderPublic,
  OrderStats,
  OrderStatus,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Endpoints públicos ---

export async function createOrder(data: CreateOrderDto): Promise<CreateOrderResponse> {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al crear el pedido");
  }

  return response.json();
}

export async function getOrderPublic(id: string): Promise<OrderPublic> {
  const response = await fetch(`${API_URL}/orders/track/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Pedido no encontrado");
  }

  return response.json();
}

// --- Endpoints de Admin ---

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const url = status
    ? `${API_URL}/orders?status=${status}`
    : `${API_URL}/orders`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener los pedidos");
  }

  return response.json();
}

export async function getOrder(id: string): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Pedido no encontrado");
  }

  return response.json();
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await fetch(`${API_URL}/orders/stats`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener estadísticas");
  }

  return response.json();
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  adminNotes?: string
): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, adminNotes }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el estado del pedido");
  }

  return response.json();
}

export async function updateOrderTracking(
  id: string,
  trackingCode: string,
  courierName?: string
): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${id}/tracking`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trackingCode, courierName }),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el tracking");
  }

  return response.json();
}

export async function deleteOrder(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar el pedido");
  }
}
