const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type SaleLocation = 'CORRIENTES' | 'MONTE_CASEROS';
export type SalePaymentMethod = 'CASH' | 'TRANSFER';

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: SalePaymentMethod;
  location: SaleLocation;
  createdAt: string;
  product?: {
    name: string;
    price: number;
  };
}

export interface CreateSaleDto {
  productId: string;
  quantity: number;
  paymentMethod: SalePaymentMethod;
  location: SaleLocation;
  createdAt?: string;
}

// --- Reports types ---

export interface ReportsSummary {
  totalRevenue: number;
  totalSales: number;
  totalUnits: number;
  avgTicket: number;
}

export interface RevenueByLocation {
  location: SaleLocation;
  revenue: number;
  count: number;
  units: number;
}

export interface RevenueByPaymentMethod {
  paymentMethod: SalePaymentMethod;
  revenue: number;
  count: number;
  units: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
  units: number;
  salesCount: number;
}

export interface TopCategory {
  name: string;
  revenue: number;
  units: number;
}

export interface SalesByDayOfWeek {
  day: number;
  dayName: string;
  revenue: number;
  count: number;
  units: number;
}

export interface RevenueOverTime {
  date: string;
  revenue: number;
  count: number;
  units: number;
}

export interface SalesReport {
  summary: ReportsSummary;
  revenueByLocation: RevenueByLocation[];
  revenueByPaymentMethod: RevenueByPaymentMethod[];
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  salesByDayOfWeek: SalesByDayOfWeek[];
  revenueOverTime: RevenueOverTime[];
}

export interface ReportsFilters {
  startDate?: string;
  endDate?: string;
  location?: SaleLocation;
  paymentMethod?: SalePaymentMethod;
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
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al crear la venta");
  }

  return response.json();
}

export async function getSalesReports(filters: ReportsFilters = {}): Promise<SalesReport> {
  const url = new URL(`${API_URL}/sales/reports`);
  if (filters.startDate) url.searchParams.append('startDate', filters.startDate);
  if (filters.endDate) url.searchParams.append('endDate', filters.endDate);
  if (filters.location) url.searchParams.append('location', filters.location);
  if (filters.paymentMethod) url.searchParams.append('paymentMethod', filters.paymentMethod);

  const response = await fetch(url.toString(), {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener reportes");
  }

  return response.json();
}
