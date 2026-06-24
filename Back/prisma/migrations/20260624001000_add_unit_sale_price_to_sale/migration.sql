-- Add unitSalePrice to sales table
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "unit_sale_price" INTEGER;
