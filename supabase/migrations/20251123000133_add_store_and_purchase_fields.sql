-- Migration: Add store and purchase fields to items table
-- Created: 2025-11-22
-- Description: Adds store_name, store_url, and purchase_date columns

BEGIN;

-- Add store_name column (optional, max 100 chars)
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS store_name TEXT;

-- Add constraint for store_name max length
ALTER TABLE public.items
ADD CONSTRAINT items_store_name_length CHECK (char_length(store_name) <= 100);

-- Add store_url column (optional, max 500 chars)
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS store_url TEXT;

-- Add constraint for store_url max length
ALTER TABLE public.items
ADD CONSTRAINT items_store_url_length CHECK (char_length(store_url) <= 500);

-- Add purchase_date column (optional, date only)
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Add constraint: purchase_date cannot be in the future
ALTER TABLE public.items
ADD CONSTRAINT items_purchase_date_not_future CHECK (purchase_date <= CURRENT_DATE);

-- Add helpful comments
COMMENT ON COLUMN public.items.store_name IS 'Name of the store where item was purchased';
COMMENT ON COLUMN public.items.store_url IS 'URL to the store or product page';
COMMENT ON COLUMN public.items.purchase_date IS 'Date when item was purchased';

COMMIT;
