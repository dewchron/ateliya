-- Add delivery_date column to orders
-- Run this in Supabase SQL Editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_date date;
