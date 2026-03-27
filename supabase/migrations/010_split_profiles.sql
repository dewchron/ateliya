-- Split profiles into user_profiles (customers) and console_profiles (internal team)
-- Run this in Supabase SQL Editor

-- 1. Rename profiles → user_profiles
ALTER TABLE profiles RENAME TO user_profiles;

-- 2. Drop the role column + dependent RLS policies
ALTER TABLE user_profiles DROP COLUMN IF EXISTS role CASCADE;

-- 3. Create console_profiles for Founders Console
CREATE TABLE console_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'operations'
    CHECK (role IN ('founder', 'operations', 'marketing', 'finance', 'product')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Seed founder account
INSERT INTO console_profiles (id, email, full_name, role)
SELECT id, email, 'Admin', 'founder'
FROM auth.users
WHERE email = 'admin@arteshia.in';

-- 5. RLS on console_profiles
ALTER TABLE console_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Console users can read own row"
  ON console_profiles FOR SELECT
  USING (auth.uid() = id);

-- 6. Update is_admin() to check console_profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM console_profiles WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 7. Update handle_new_user trigger to use user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recreate dropped RLS policies using console_profiles
CREATE POLICY "admin_select_clicks" ON click_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM console_profiles WHERE id = auth.uid())
  );

CREATE POLICY "admin_select_leads" ON leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM console_profiles WHERE id = auth.uid())
  );

CREATE POLICY "admin_update_leads" ON leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM console_profiles WHERE id = auth.uid())
  );
