-- Migration: Add Quiz Gate Settings to Profiles
-- Description: Add enable_quiz_gate and quiz_gate_outfit_threshold columns to profiles table
-- for the "Can You Style This?" purchase prevention feature

-- Add quiz gate enable/disable toggle
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS enable_quiz_gate BOOLEAN DEFAULT TRUE;

-- Add quiz gate outfit threshold (default: 3 outfits required)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS quiz_gate_outfit_threshold INTEGER DEFAULT 3;

-- Add check constraint to ensure threshold is between 2 and 10
ALTER TABLE profiles
ADD CONSTRAINT quiz_gate_outfit_threshold_range
CHECK (quiz_gate_outfit_threshold >= 2 AND quiz_gate_outfit_threshold <= 10);

-- Create index for quiz gate lookups
CREATE INDEX IF NOT EXISTS idx_profiles_quiz_gate ON profiles(enable_quiz_gate);

-- Update existing users to have default values
UPDATE profiles
SET enable_quiz_gate = TRUE,
    quiz_gate_outfit_threshold = 3
WHERE enable_quiz_gate IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.enable_quiz_gate IS 'Whether the "Can You Style This?" quiz gate is enabled for this user';
COMMENT ON COLUMN profiles.quiz_gate_outfit_threshold IS 'Number of outfits user must create before they can add items to wishlist (2-10)';
