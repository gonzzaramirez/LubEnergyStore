-- AlterTable
ALTER TABLE "products" ADD COLUMN     "discount_end_date" TIMESTAMP(3),
ADD COLUMN     "discount_percent" INTEGER,
ADD COLUMN     "discount_start_date" TIMESTAMP(3),
ADD COLUMN     "min_quantity_discount" INTEGER,
ADD COLUMN     "quantity_discount_percent" INTEGER;

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "old_price" INTEGER NOT NULL,
    "new_price" INTEGER NOT NULL,
    "change_percent" DOUBLE PRECISION NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "discount_percent" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "min_order_amount" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "discount_codes"("code");

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
