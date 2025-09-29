# Push Subscriptions Table Migration

## Quick Setup (Supabase Dashboard Method)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ayfabzqcjedgvhhityxc`
3. **Navigate to SQL Editor**
4. **Copy and paste** the contents of `supabase/migrations/005_create_push_subscriptions.sql`
5. **Click Run** to execute the migration

## What This Creates

- **push_subscriptions table**: Stores browser push notification subscriptions
- **RLS policies**: Ensures users can only manage their own subscriptions
- **Indexes**: For optimal query performance
- **Triggers**: Automatically updates the `updated_at` timestamp

## Verification Query

After running the migration, verify it worked:

```sql
-- Check table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'push_subscriptions';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'push_subscriptions';
```

## Expected Result

You should see:
- 8 columns created (id, user_name, endpoint, p256dh, auth, created_at, updated_at, is_active)
- 4 RLS policies created (view, insert, update, delete)
- 3 indexes created for performance
- 1 trigger function for updated_at

## Next Steps

Once the migration is complete:
1. Test the notification system on `/test-features`
2. Enable notifications and test push functionality
3. The system will now store browser subscriptions in the database