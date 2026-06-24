-- Add unitSalePrice to purchase_order_lines
ALTER TABLE "purchase_order_lines" ADD COLUMN IF NOT EXISTS "unit_sale_price" INTEGER;
