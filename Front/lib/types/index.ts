// Product Types
export interface Product {
  id: string;
  categoryId?: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity?: number;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  // Promociones
  discountPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  // Descuento por cantidad
  minQuantityDiscount?: number;
  quantityDiscountPercent?: number;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
}

export interface CreateProductDto {
  categoryId?: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity?: number;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  // Promociones
  discountPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  // Descuento por cantidad
  minQuantityDiscount?: number;
  quantityDiscountPercent?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Bulk Price Update
export interface BulkPriceUpdateDto {
  percentChange: number;
  categoryId?: number;
  reason?: string;
}

export interface BulkPriceUpdateResponse {
  updated: number;
  percentChange: number;
  message: string;
}

// Price History
export interface PriceHistory {
  id: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  reason: string;
  createdAt: string;
}

// Discount Codes
export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  discountPercent: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  minOrderAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeDto {
  code: string;
  description?: string;
  discountPercent: number;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  minOrderAmount?: number;
}

export interface UpdateDiscountCodeDto extends Partial<CreateDiscountCodeDto> {}

export interface ValidateDiscountCodeResponse {
  valid: boolean;
  code: string;
  discountPercent: number;
  description?: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface GuestCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  customerNotes?: string;
  trackingCode?: string;
  courierName?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  guestCustomer?: GuestCustomer;
  items: OrderItem[];
}

export interface CreateOrderDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
  customerNotes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
}

export interface CreateOrderResponse {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  trackingUrl: string;
}

export interface OrderPublic {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  trackingCode?: string;
  courierName?: string;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
  }[];
  customerName: string;
  city: string;
}

export interface OrderStats {
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

// GeoRef Argentina Types
export interface Provincia {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
  provincia: {
    id: string;
    nombre: string;
  };
}
