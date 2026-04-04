-- AlterTable
ALTER TABLE "discount_codes" ADD COLUMN     "gym_id" INTEGER,
ADD COLUMN "gym_name" VARCHAR(100);

-- CreateIndex
CREATE INDEX "discount_codes_gym_id_idx" ON "discount_codes"("gym_id");
