-- Expand Talo payment metadata columns to avoid length mismatch errors (P2000)
ALTER TABLE "orders"
ALTER COLUMN "payment_id" TYPE VARCHAR(120),
ALTER COLUMN "payment_status" TYPE VARCHAR(50),
ALTER COLUMN "payment_last_event_key" TYPE VARCHAR(255);
