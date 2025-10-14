-- =====================================================
-- PROFILES TABLE AUTO-CREATION SETUP
-- =====================================================
-- This script sets up automatic profile creation for new users
-- and ensures proper RLS policies for profile privacy.
--
-- HOW TO RUN:
-- 1. Open Supabase SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: Update RLS Policies for Better Privacy
-- =====================================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Create a more secure SELECT policy - users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- =====================================================
-- PART 2: Auto-Create Profile Function
-- =====================================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: Create Trigger
-- =====================================================

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 4: Ensure Storage Bucket Exists
-- =====================================================

-- Note: Storage buckets are typically created through the Supabase Dashboard
-- but we can check if the 'avatars' bucket exists
-- If not, create it manually in the Supabase Storage section

-- Check if avatars bucket exists (for reference)
-- You may need to create this bucket manually in the Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named "avatars"
-- 3. Set it to "Public" if you want avatars to be publicly accessible

-- =====================================================
-- PART 5: Storage Policies (Run this after creating the bucket)
-- =====================================================

-- Note: These policies assume the 'avatars' bucket exists
-- Uncomment and run these AFTER creating the avatars bucket

-- Allow users to upload their own avatar
-- CREATE POLICY "Users can upload their own avatar"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow users to update their own avatar
-- CREATE POLICY "Users can update their own avatar"
-- ON storage.objects
-- FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow users to delete their own avatar
-- CREATE POLICY "Users can delete their own avatar"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow everyone to view avatars (public bucket)
-- CREATE POLICY "Anyone can view avatars"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'avatars');

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Profiles will now be automatically created for new users.
-- Users can only view and edit their own profile.
--
-- NEXT STEPS:
-- 1. Create 'avatars' storage bucket in Supabase Dashboard
-- 2. Uncomment and run the storage policies above
-- =====================================================
