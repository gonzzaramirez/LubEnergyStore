export class CreateProductDto {
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
