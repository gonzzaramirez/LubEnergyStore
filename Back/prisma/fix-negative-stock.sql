-- Fix stock negativo existente en la base de datos
-- Correr después del deploy si hay valores negativos acumulados
-- Uso: npx prisma db execute --file prisma/fix-negative-stock.sql

UPDATE products SET stock_quantity = 0 WHERE stock_quantity < 0;
UPDATE product_flavors SET stock_quantity = 0 WHERE stock_quantity < 0;
