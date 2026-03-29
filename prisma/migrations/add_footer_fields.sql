-- Agregar campos de footer a la tabla stores
-- Texto derechos reservados (obligatorio)
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "footer_copyright" TEXT DEFAULT '© 2024 Todos los derechos reservados';

-- Toggles y campos para redes sociales (opcionales)
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_facebook" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "facebook_url" TEXT;

ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_instagram" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "instagram_url" TEXT;

ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_tiktok" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "tiktok_url" TEXT;

-- Toggles y campos para información de contacto (opcionales)
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_address" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "address_text" TEXT;

ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_phone" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "phone_text" TEXT;

ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_email" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "email_text" TEXT;

ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "show_hours" BOOLEAN DEFAULT false;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "hours_text" TEXT;
