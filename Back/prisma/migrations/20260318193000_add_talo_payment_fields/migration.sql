-- Add Talo payment tracking fields to orders
ALTER TABLE "orders"
ADD COLUMN "payment_provider" VARCHAR(50),
ADD COLUMN "payment_external_id" VARCHAR(120),
ADD COLUMN "payment_id" VARCHAR(60),
ADD COLUMN "payment_url" TEXT,
ADD COLUMN "payment_status" VARCHAR(30),
ADD COLUMN "payment_webhook_at" TIMESTAMP(3),
ADD COLUMN "payment_amount_ars" INTEGER,
ADD COLUMN "payment_last_event_key" VARCHAR(120);

CREATE INDEX "orders_payment_external_id_idx" ON "orders"("payment_external_id");
CREATE INDEX "orders_payment_id_idx" ON "orders"("payment_id");
