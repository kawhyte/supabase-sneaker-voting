-- =====================================================
-- COMPREHENSIVE RLS POLICY FIX
-- =====================================================
-- This script enforces strict Row Level Security (RLS) on items,
-- size_preferences, and item_photos tables to ensure complete
-- data isolation between users.
--
-- CRITICAL ISSUE FIXED:
-- Previous "Allow all operations" policies allowed ANY user to
-- access ANY data, completely bypassing security.
--
-- HOW TO RUN:
-- 1. Open Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: ITEMS TABLE - Complete Policy Reset
-- =====================================================

-- Drop ALL existing policies (including the insecure "Allow all operations" policy)
DROP POLICY IF EXISTS "Allow all operations on sneaker_experiences" ON public.items;
DROP POLICY IF EXISTS "Allow individual delete access" ON public.items;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.items;
DROP POLICY IF EXISTS "Allow individual read access" ON public.items;
DROP POLICY IF EXISTS "Allow individual update access" ON public.items;

-- Create secure, user-isolated policies for items table
CREATE POLICY "Users can view only their own items"
ON public.items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert only their own items"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own items"
ON public.items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own items"
ON public.items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled on items table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: SIZE_PREFERENCES TABLE - Complete Policy Reset
-- =====================================================

-- Drop ALL existing policies (including the insecure "Allow all operations" policy)
DROP POLICY IF EXISTS "Allow all operations on size_preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Allow individual delete access on size_preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Allow individual insert access on size_preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Allow individual read access on size_preferences" ON public.size_preferences;
DROP POLICY IF EXISTS "Allow individual update access on size_preferences" ON public.size_preferences;

-- Create secure, user-isolated policies for size_preferences table
CREATE POLICY "Users can view only their own size preferences"
ON public.size_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert only their own size preferences"
ON public.size_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own size preferences"
ON public.size_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own size preferences"
ON public.size_preferences
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled on size_preferences table
ALTER TABLE public.size_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: ITEM_PHOTOS TABLE - Policy Update
-- =====================================================
-- The item_photos table currently has overly permissive policies.
-- We need to ensure photos are only accessible through their
-- parent item's user_id relationship.

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view sneaker photos" ON public.item_photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.item_photos;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.item_photos;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.item_photos;

-- Create secure policies that check ownership via the parent item
CREATE POLICY "Users can view only their own item photos"
ON public.item_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = item_photos.item_id
    AND items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert photos for their own items"
ON public.item_photos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = item_photos.item_id
    AND items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update photos for their own items"
ON public.item_photos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = item_photos.item_id
    AND items.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = item_photos.item_id
    AND items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete photos for their own items"
ON public.item_photos
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = item_photos.item_id
    AND items.user_id = auth.uid()
  )
);

-- Ensure RLS is enabled on item_photos table
ALTER TABLE public.item_photos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 4: VERIFICATION
-- =====================================================
-- After running this script, you can verify the policies with:
--
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('items', 'size_preferences', 'item_photos')
-- ORDER BY tablename, cmd;
--
-- Expected result: All policies should reference auth.uid() = user_id
-- =====================================================

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- RLS policies are now properly configured. Users can only:
-- - CREATE their own records (INSERT enforces user_id = auth.uid())
-- - READ their own records (SELECT enforces user_id = auth.uid())
-- - UPDATE their own records (UPDATE enforces user_id = auth.uid())
-- - DELETE their own records (DELETE enforces user_id = auth.uid())
-- =====================================================
