-- Crear tabla banners
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link TEXT,
  whatsapp_message TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  store_id TEXT NOT NULL,
  category_id TEXT
);

-- Agregar foreign keys
ALTER TABLE banners 
ADD CONSTRAINT fk_banners_store 
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

ALTER TABLE banners 
ADD CONSTRAINT fk_banners_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Crear índices
CREATE INDEX idx_banners_store_id ON banners(store_id);
CREATE INDEX idx_banners_category_id ON banners(category_id);
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_order ON banners("order");
