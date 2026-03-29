-- Agregar columna currency a tabla stores existente
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(10) DEFAULT 'PYG';

-- Actualizar registros existentes para que tengan valor por defecto
UPDATE "stores" SET "currency" = 'PYG' WHERE "currency" IS NULL;
