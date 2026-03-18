import {
  CreateTaloPaymentDto,
  CreateTaloPaymentResponse,
} from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createTaloPayment(
  data: CreateTaloPaymentDto,
): Promise<CreateTaloPaymentResponse> {
  const response = await fetch(`${API_URL}/payments/talo/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al iniciar pago con Talo');
  }

  return response.json();
}
