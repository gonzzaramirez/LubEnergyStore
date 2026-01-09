import {
  DiscountCode,
  CreateDiscountCodeDto,
  UpdateDiscountCodeDto,
  ValidateDiscountCodeResponse,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const response = await fetch(`${API_URL}/discount-codes`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener códigos de descuento");
  }

  return response.json();
}

export async function getDiscountCode(id: string): Promise<DiscountCode> {
  const response = await fetch(`${API_URL}/discount-codes/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener código de descuento");
  }

  return response.json();
}

export async function createDiscountCode(
  data: CreateDiscountCodeDto
): Promise<DiscountCode> {
  const response = await fetch(`${API_URL}/discount-codes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear código de descuento");
  }

  return response.json();
}

export async function updateDiscountCode(
  id: string,
  data: UpdateDiscountCodeDto
): Promise<DiscountCode> {
  const response = await fetch(`${API_URL}/discount-codes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al actualizar código de descuento");
  }

  return response.json();
}

export async function deleteDiscountCode(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/discount-codes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar código de descuento");
  }
}

// Validar código (público - para el carrito)
export async function validateDiscountCode(
  code: string,
  orderAmount: number
): Promise<ValidateDiscountCodeResponse> {
  const response = await fetch(`${API_URL}/discount-codes/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, orderAmount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Código de descuento no válido");
  }

  return response.json();
}
