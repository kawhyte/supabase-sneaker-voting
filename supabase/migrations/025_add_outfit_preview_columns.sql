-- Migration 025: Add outfit preview generation columns
-- Purpose: Support pre-generated flat-lay card preview images for outfits

ALTER TABLE outfits
ADD COLUMN preview_url TEXT,
ADD COLUMN preview_status TEXT DEFAULT 'pending'
  CHECK (preview_status IN ('pending', 'generating', 'generated', 'failed')),
ADD COLUMN preview_generated_at TIMESTAMPTZ,
ADD COLUMN preview_error TEXT;

-- Index for efficient querying of pending previews
CREATE INDEX idx_outfits_preview_status ON outfits(preview_status);

-- Add comments for documentation
COMMENT ON COLUMN outfits.preview_url IS 'Cloudinary URL for pre-generated card preview image (400x480px, 5:6 aspect ratio)';
COMMENT ON COLUMN outfits.preview_status IS 'Status of preview generation: pending, generating, generated, failed';
COMMENT ON COLUMN outfits.preview_generated_at IS 'Timestamp when preview was last generated successfully';
COMMENT ON COLUMN outfits.preview_error IS 'Error message if preview generation failed (for debugging)';
