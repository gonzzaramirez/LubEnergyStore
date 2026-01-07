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
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

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
