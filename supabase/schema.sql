-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  couple_names TEXT NOT NULL,
  event_date DATE NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'silver', 'gold', 'premium')),
  storage_used BIGINT NOT NULL DEFAULT 0,
  photo_count INTEGER NOT NULL DEFAULT 0,
  video_count INTEGER NOT NULL DEFAULT 0,
  auto_upgrade_to_premium BOOLEAN NOT NULL DEFAULT false,
  auto_upgrade_to_plus BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  is_setup BOOLEAN NOT NULL DEFAULT false,
  template TEXT NOT NULL DEFAULT 'romantic' CHECK (template IN ('romantic', 'noir', 'golden', 'garden', 'burgundy', 'sage')),
  cover_photo_url TEXT,
  location TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr', 'de', 'it', 'es')),
  pin_required BOOLEAN NOT NULL DEFAULT false,
  access_pin_hash TEXT,
  moderate_media BOOLEAN NOT NULL DEFAULT false,
  moderate_guestbook BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  album_name TEXT NOT NULL DEFAULT 'General',
  url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  original_name TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'guest',
  is_approved BOOLEAN NOT NULL DEFAULT true,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guestbook table
CREATE TABLE guestbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RSVP table
CREATE TABLE rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT,
  attending BOOLEAN NOT NULL,
  plus_one BOOLEAN NOT NULL DEFAULT false,
  meal_preference TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth connections table (external providers per user)
CREATE TABLE oauth_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('canva')),
  user_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  scope TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, user_email)
);

-- Canva imported exports saved in our storage
CREATE TABLE canva_design_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  design_id TEXT NOT NULL,
  design_title TEXT,
  export_format TEXT NOT NULL,
  canva_export_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  asset_url TEXT NOT NULL,
  byte_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invitation page state (draft/published Canva exports per order)
CREATE TABLE invitation_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  draft_export_id UUID REFERENCES canva_design_exports(id) ON DELETE SET NULL,
  published_export_id UUID REFERENCES canva_design_exports(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_slug ON orders(slug);
CREATE INDEX idx_orders_expires_at ON orders(expires_at);
CREATE INDEX idx_media_order_id ON media(order_id);
CREATE INDEX idx_media_order_album ON media(order_id, album_name);
CREATE INDEX idx_media_order_approved ON media(order_id, is_approved);
CREATE INDEX idx_guestbook_order_id ON guestbook(order_id);
CREATE INDEX idx_guestbook_order_approved ON guestbook(order_id, is_approved);
CREATE INDEX idx_rsvps_order_id ON rsvps(order_id);
CREATE INDEX idx_oauth_connections_user_provider ON oauth_connections(user_email, provider);
CREATE INDEX idx_canva_design_exports_user ON canva_design_exports(user_email);
CREATE INDEX idx_canva_design_exports_order ON canva_design_exports(order_id);
CREATE INDEX idx_invitation_pages_user ON invitation_pages(user_email);
CREATE INDEX idx_invitation_pages_order ON invitation_pages(order_id);

-- Auto-delete expired orders (run via cron job or Supabase scheduled function)
-- DELETE FROM orders WHERE expires_at < NOW();
