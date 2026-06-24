-- Add flavor_id to sales table for flavor-level sales tracking
ALTER TABLE "sales" ADD COLUMN "flavor_id" TEXT;

-- Add foreign key constraint
ALTER TABLE "sales" ADD CONSTRAINT "sales_flavor_id_fkey" 
  FOREIGN KEY ("flavor_id") REFERENCES "product_flavors"("id") ON DELETE SET NULL;

-- Create index for looking up sales by flavor
CREATE INDEX "sales_flavor_id_idx" ON "sales" ("flavor_id");
