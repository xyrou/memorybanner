-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  couple_names TEXT NOT NULL,
  event_date DATE NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'premium_plus')),
  storage_used BIGINT NOT NULL DEFAULT 0,
  photo_count INTEGER NOT NULL DEFAULT 0,
  video_count INTEGER NOT NULL DEFAULT 0,
  auto_upgrade_to_premium BOOLEAN NOT NULL DEFAULT false,
  auto_upgrade_to_plus BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  is_setup BOOLEAN NOT NULL DEFAULT false,
  template TEXT NOT NULL DEFAULT 'romantic' CHECK (template IN ('romantic', 'modern', 'rustic', 'minimal')),
  cover_photo_url TEXT,
  location TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  original_name TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guestbook table
CREATE TABLE guestbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_slug ON orders(slug);
CREATE INDEX idx_orders_expires_at ON orders(expires_at);
CREATE INDEX idx_media_order_id ON media(order_id);
CREATE INDEX idx_guestbook_order_id ON guestbook(order_id);

-- Auto-delete expired orders (run via cron job or Supabase scheduled function)
-- DELETE FROM orders WHERE expires_at < NOW();
