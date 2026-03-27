-- Schema cleanup: align DB with current app flow
-- Run this in Supabase SQL Editor

-- 1. Change order_services.service_type from enum to text (now holds service_prices UUIDs)
ALTER TABLE order_services
  ALTER COLUMN service_type TYPE text;

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS service_type_enum CASCADE;

-- 2. Add payment columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS total_amount integer DEFAULT 0;

-- 3. Add custom_community to orders (may already exist from dashboard)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS custom_community text;

-- 4. Change appointment_time from time to text (we store range strings like "1:00PM - 3:00PM")
ALTER TABLE orders
  ALTER COLUMN appointment_time TYPE text;
