const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  location: 'CORRIENTES' | 'MONTE_CASEROS';
  createdAt: string;
  product?: {
    name: string;
    price: number;
  };
}

export interface CreateSaleDto {
  productId: string;
  quantity: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  location: 'CORRIENTES' | 'MONTE_CASEROS';
  createdAt?: string;
}

export async function getSales(startDate?: string, endDate?: string): Promise<Sale[]> {
  const url = new URL(`${API_URL}/sales`);
  if (startDate) url.searchParams.append('startDate', startDate);
  if (endDate) url.searchParams.append('endDate', endDate);

  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener ventas");
  }

  return response.json();
}

export async function createSale(data: CreateSaleDto): Promise<Sale> {
  const response = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al crear la venta");
  }

  return response.json();
}
