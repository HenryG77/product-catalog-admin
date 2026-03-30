-- Migration: Create product_images table
-- Created for multi-image product support

-- Create product_images table
CREATE TABLE IF NOT EXISTS "product_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    
    -- Foreign key constraint
    CONSTRAINT "product_images_product_id_fkey" 
        FOREIGN KEY ("product_id") 
        REFERENCES "products"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create index for faster queries by product_id
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" 
    ON "product_images"("product_id");

-- Comment on table
COMMENT ON TABLE "product_images" IS 'Additional images for products (up to 15 per product)';
