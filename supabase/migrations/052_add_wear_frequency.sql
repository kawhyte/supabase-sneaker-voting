-- Migration 052: Add wear_frequency column to items table
-- Stores the user's expected wear frequency for CPW projection calculations.
-- Used by the AddItemForm frequency picker; CPW metrics calculated on save.

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS wear_frequency TEXT DEFAULT 'weekly'
  CHECK (wear_frequency IN ('rarely', 'monthly', 'weekly', 'daily'));
