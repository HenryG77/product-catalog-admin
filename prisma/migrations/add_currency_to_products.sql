-- Agregar columna currency a la tabla products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(10) DEFAULT 'PYG';

-- Actualizar productos existentes
UPDATE "products" SET "currency" = 'PYG' WHERE "currency" IS NULL;
