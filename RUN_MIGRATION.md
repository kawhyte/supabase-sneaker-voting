# Run Sneaker Photos Migration

To enable the photo carousel with multiple images, you need to run the database migration:

## Option 1: Supabase CLI (Recommended)
```bash
supabase db push
```

## Option 2: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/006_create_sneaker_photos.sql`
4. Paste and run in the SQL editor

## Option 3: Direct SQL
Run the migration file directly:
```bash
psql your-database-url < supabase/migrations/006_create_sneaker_photos.sql
```

After running the migration, the form will automatically save all uploaded photos and the carousel will display them in the dashboard.
