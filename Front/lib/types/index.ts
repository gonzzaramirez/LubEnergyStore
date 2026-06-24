// Product Types
export interface ProductFlavor {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  stockQuantity: number;
  price?: number | null;
  purchasePrice?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductFlavorDto {
  name: string;
  sku?: string;
  imageUrl?: string;
  stockQuantity: number;
  price?: number;
  purchasePrice?: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  categoryId?: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity?: number;
  purchasePrice?: number | null;
  defaultSupplierId?: string | null;
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
  flavors?: ProductFlavor[];
  defaultSupplier?: { id: string; name: string } | null;
}

export interface CreateProductDto {
  categoryId?: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity?: number;
  purchasePrice?: number;
  defaultSupplierId?: string;
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
  flavors?: CreateProductFlavorDto[];
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
  /** Origen SaaS (gym.gym_id) */
  gymId?: number;
  /** Snapshot de gym.name al crear el cupón */
  gymName?: string;
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
  gymId?: number;
  gymName?: string;
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
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';

export interface OrderItem {
  id?: string;
  productId: string;
  flavorId?: string;
  productName: string;
  flavorName?: string;
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

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

// Purchase Order Types
export type POStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

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
  product?: Product | null;
  flavor?: ProductFlavor | null;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: POStatus;
  notes?: string;
  totalAmount: number;
  createdAt: string;
  receivedAt?: string;
  updatedAt: string;
  supplier: Supplier;
  lines: PurchaseOrderLine[];
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
