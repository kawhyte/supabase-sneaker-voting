-- ============================================================================
-- Migration 053: Fix Profiles RLS for Public Wishlist Discovery
-- ============================================================================
-- Purpose: Allow users to view public profiles in the Explore page
-- Date: 2025-11-20
-- Issue: Explore page returns empty results because RLS only allows viewing own profile
-- Fix: Add policy to allow viewing profiles with wishlist_privacy = 'public'
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add RLS policy for viewing public profiles
-- ============================================================================
-- Allow users to view profiles that have public wishlists
-- This enables the Explore page to show users with public wishlists

CREATE POLICY "Users can view public profiles" ON profiles FOR SELECT
  USING (
    -- Rule 1: Users can always view their own profile (existing behavior)
    auth.uid() = id
    OR
    -- Rule 2: Users can view profiles with public wishlists (NEW)
    wishlist_privacy = 'public'
  );

-- ============================================================================
-- STEP 2: Drop the old restrictive policy
-- ============================================================================
-- The old policy only allowed viewing own profile, which blocked Explore page
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- ============================================================================
-- STEP 3: Add helpful comment
-- ============================================================================
COMMENT ON POLICY "Users can view public profiles" ON profiles IS
  'Allows viewing own profile + profiles with public wishlists for Explore page';

COMMIT;
