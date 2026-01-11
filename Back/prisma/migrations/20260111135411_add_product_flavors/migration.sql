-- CreateTable
CREATE TABLE "product_flavors" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sku" VARCHAR(50),
    "image_url" TEXT,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_flavors_pkey" PRIMARY KEY ("id")
);

-- Add columns to order_items
ALTER TABLE "order_items" ADD COLUMN "flavor_id" TEXT;
ALTER TABLE "order_items" ADD COLUMN "flavor_name" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "product_flavors_sku_key" ON "product_flavors"("sku");

-- AddForeignKey
ALTER TABLE "product_flavors" ADD CONSTRAINT "product_flavors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_flavor_id_fkey" FOREIGN KEY ("flavor_id") REFERENCES "product_flavors"("id") ON DELETE SET NULL ON UPDATE CASCADE;