-- Actualizar pedidos con estado DELIVERED a SHIPPED
UPDATE "orders" SET "status" = 'SHIPPED' WHERE "status" = 'DELIVERED';

-- Eliminar el campo delivered_at
ALTER TABLE "orders" DROP COLUMN IF EXISTS "delivered_at";

-- Recrear el enum sin DELIVERED
-- Primero crear un nuevo tipo temporal
CREATE TYPE "order_status_new" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED');

-- Eliminar el valor por defecto antes de cambiar el tipo
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;

-- Actualizar la columna para usar el nuevo tipo
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "order_status_new" USING ("status"::text::"order_status_new");

-- Eliminar el tipo viejo
DROP TYPE "order_status";

-- Renombrar el nuevo tipo
ALTER TYPE "order_status_new" RENAME TO "order_status";

-- Restaurar el valor por defecto
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"order_status";
