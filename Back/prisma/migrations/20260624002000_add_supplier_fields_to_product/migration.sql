-- Add default supplier and purchase price to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "default_supplier_id" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "purchase_price" INTEGER;

-- Add price and purchase price to product flavors
ALTER TABLE "product_flavors" ADD COLUMN IF NOT EXISTS "price" INTEGER;
ALTER TABLE "product_flavors" ADD COLUMN IF NOT EXISTS "purchase_price" INTEGER;

-- Add foreign key for default supplier
ALTER TABLE "products" ADD CONSTRAINT "products_default_supplier_id_fkey"
  FOREIGN KEY ("default_supplier_id") REFERENCES "suppliers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
