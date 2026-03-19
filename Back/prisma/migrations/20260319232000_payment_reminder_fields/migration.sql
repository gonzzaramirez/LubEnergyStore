-- AlterTable
ALTER TABLE "orders" ADD COLUMN "payment_initiated_at" TIMESTAMP(3),
ADD COLUMN "pending_payment_reminder_sent_at" TIMESTAMP(3),
ADD COLUMN "pending_payment_owner_notified_at" TIMESTAMP(3);
