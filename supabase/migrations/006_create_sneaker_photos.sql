-- Create sneaker_photos table for storing multiple images per sneaker
CREATE TABLE IF NOT EXISTS sneaker_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sneaker_id UUID NOT NULL REFERENCES sneakers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_id TEXT,
  image_order INTEGER NOT NULL DEFAULT 0,
  is_main_image BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sneaker_photos_sneaker_id ON sneaker_photos(sneaker_id);
CREATE INDEX idx_sneaker_photos_main_image ON sneaker_photos(sneaker_id, is_main_image) WHERE is_main_image = true;

-- Add RLS policies
ALTER TABLE sneaker_photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read photos
CREATE POLICY "Anyone can view sneaker photos"
  ON sneaker_photos
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert photos
CREATE POLICY "Authenticated users can insert photos"
  ON sneaker_photos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow authenticated users to update their photos
CREATE POLICY "Authenticated users can update photos"
  ON sneaker_photos
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete photos"
  ON sneaker_photos
  FOR DELETE
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create function to ensure only one main image per sneaker
CREATE OR REPLACE FUNCTION ensure_single_main_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is being set as main image, unset all other main images for this sneaker
  IF NEW.is_main_image = true THEN
    UPDATE sneaker_photos
    SET is_main_image = false
    WHERE sneaker_id = NEW.sneaker_id
      AND id != NEW.id
      AND is_main_image = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER ensure_single_main_image_trigger
  BEFORE INSERT OR UPDATE ON sneaker_photos
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_main_image();

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sneaker_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
