# Testing Guide: Social Features (Public Wishlists)

This guide will help you test the social features and debug why you're still seeing "No Public Wishlists Yet".

## Prerequisites Checklist

Before the social features can work, ALL of the following must be true:

- [ ] Database migration 052 has been applied
- [ ] `followers` table exists in database
- [ ] `profiles` table has `wishlist_privacy`, `follower_count`, `following_count` columns
- [ ] `items` table has `is_pinned` column
- [ ] At least one user has `wishlist_privacy = 'public'`
- [ ] That user has at least one item with `status = 'wishlisted'` and `is_archived = false`
- [ ] Next.js app has been restarted after code changes
- [ ] You're logged in as a valid user

---

## Step 1: Check Database Status

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor**
4. Open the file `CHECK_SOCIAL_FEATURES_STATUS.sql` from this repo
5. Copy the entire contents and paste into SQL Editor
6. Click **Run**

### What to look for:

- ✅ All checks should show green checkmarks
- ❌ If you see red X marks or NULL values → **Go to Step 2**
- ⚠️ If you see warnings about no public users → **Go to Step 3**

---

## Step 2: Apply Database Migration (If Not Applied)

**Only do this if Step 1 showed missing tables/columns**

1. In Supabase Dashboard → SQL Editor
2. Open the file `APPLY_SOCIAL_MIGRATION.sql` from this repo
3. Copy the **entire contents** (all 131 lines)
4. Paste into SQL Editor
5. Click **Run**
6. Wait for "Success. No rows returned" message
7. **Go back to Step 1** to verify it worked

### Common Issues:

**Error: "column profiles.user_id does not exist"**
- The trigger is referencing `user_id` but should reference `id`
- Open `APPLY_SOCIAL_MIGRATION.sql`
- Find line 79: `WHERE id = NEW.following_user_id;`
- Make sure it says `id`, not `user_id`

**Error: "relation followers already exists"**
- Migration partially applied
- It's safe to re-run (uses `IF NOT EXISTS` checks)

---

## Step 3: Set Up Test User Data

**Only do this after Step 2 is complete**

### Option A: Via SQL (Fastest)

1. In Supabase Dashboard → SQL Editor
2. Open file `SETUP_TEST_DATA_FOR_SOCIAL.sql` from this repo
3. **IMPORTANT**: Make sure you're logged into the app first
4. Run each query one by one (not all at once)
5. Follow the instructions in the comments

### Option B: Via App UI (Easier)

1. Make sure you're logged into the app
2. Go to **Settings** → **Privacy & Sharing** tab (or press Cmd+4)
3. Under "Wishlist Privacy", select **"Public"**
4. Click **Save Changes**
5. Go to **Dashboard** → **Want to Buy** tab
6. Click **"+ Add Item"**
7. Fill in the form:
   - **Brand**: Nike
   - **Model**: Air Jordan 1
   - **Color**: Chicago
   - **Category**: Sneakers
   - **Status**: Want to Buy ← IMPORTANT
   - **Retail Price**: $170
8. Click **Save**
9. Repeat steps 6-8 to add 3-4 more wishlist items

---

## Step 4: Verify Test Data

1. In Supabase Dashboard → SQL Editor
2. Run this query:

```sql
SELECT
  p.id,
  p.display_name,
  p.wishlist_privacy,
  COUNT(i.id) as wishlist_item_count
FROM profiles p
LEFT JOIN items i ON i.user_id = p.id
  AND i.status = 'wishlisted'
  AND i.is_archived = false
WHERE p.wishlist_privacy = 'public'
GROUP BY p.id, p.display_name, p.wishlist_privacy;
```

### Expected Results:

| id | display_name | wishlist_privacy | wishlist_item_count |
|----|-------------|------------------|---------------------|
| abc-123 | Your Name | public | 4 |

- **wishlist_privacy** should be `public`
- **wishlist_item_count** should be > 0

If the table is empty or shows 0 items → **Go back to Step 3**

---

## Step 5: Restart Your App

**CRITICAL**: Next.js needs to pick up the code changes

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

Wait for "Ready" message, then go to: http://localhost:3000/explore

---

## Step 6: Test the Explore Page

1. Navigate to http://localhost:3000/explore
2. You should see user cards with wishlist previews

### What to check:

- [ ] User cards appear (not "No Public Wishlists Yet")
- [ ] Each card shows user's display name
- [ ] Each card shows 4 wishlist item photos
- [ ] Follower count shows "0 followers"
- [ ] Follow button appears
- [ ] Clicking a card navigates to user's public profile

---

## Troubleshooting

### Still seeing "No Public Wishlists Yet"?

Run this debug query in Supabase SQL Editor:

```sql
-- Debug: Show ALL profiles and their wishlist status
SELECT
  p.id,
  p.display_name,
  COALESCE(p.wishlist_privacy, 'NULL') as privacy,
  COUNT(i.id) as items,
  CASE
    WHEN p.wishlist_privacy IS NULL THEN '❌ Migration not applied'
    WHEN p.wishlist_privacy != 'public' THEN '⚠️ Privacy not public'
    WHEN COUNT(i.id) = 0 THEN '⚠️ No wishlisted items'
    ELSE '✅ Should appear in Explore'
  END as status
FROM profiles p
LEFT JOIN items i ON i.user_id = p.id
  AND i.status = 'wishlisted'
  AND i.is_archived = false
GROUP BY p.id, p.display_name, p.wishlist_privacy
ORDER BY p.display_name;
```

### Browser console errors?

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors related to `/api/social/explore`
4. Common errors:

**Error: "column followers.follower_id does not exist"**
- ✅ This is fixed in the code you just deployed
- Make sure you restarted the dev server (Step 5)
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Error: "relation followers does not exist"**
- ❌ Migration not applied
- Go back to Step 2

**Error: 401 Unauthorized**
- You're not logged in
- Log in to the app and try again

---

## Creating Multiple Test Users

To see how the Explore page looks with multiple users:

1. Log out of the app
2. Create a new account (different email)
3. Log in as the new user
4. Repeat **Step 3** for this user (set wishlist to public, add items)
5. Log out and log back in as your first user
6. Go to /explore
7. You should see both users now!

---

## Expected Behavior After Setup

### Explore Page (/explore)
- Shows grid of user cards
- Each card displays:
  - User's display name
  - Avatar (if set)
  - 4 wishlist item photos
  - Follower count
  - Follow button
- Clicking card → navigates to user's public profile

### Public Profile (/users/[userId])
- Shows user's full public wishlist
- Items display in grid format
- Pinned items appear first
- Follow button in header

### Settings → Privacy & Sharing
- Radio buttons: Private / Followers Only / Public
- Shows current follower/following counts
- Save button to update settings

---

## Quick Test Commands

### Check if migration applied:
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'followers';
-- Should return: 1
```

### Count public users:
```sql
SELECT COUNT(*) FROM profiles WHERE wishlist_privacy = 'public';
-- Should return: > 0
```

### Count wishlisted items:
```sql
SELECT COUNT(*) FROM items WHERE status = 'wishlisted' AND is_archived = false;
-- Should return: > 0
```

### Your wishlist status:
```sql
SELECT wishlist_privacy FROM profiles WHERE id = auth.uid();
-- Should return: public
```

---

## Still Stuck?

1. Confirm you're on the correct branch: `claude/fix-public-wishlist-01RNyT3GWmd8UXZ5f9gWggrc`
2. Confirm you've pulled the latest changes: `git pull origin claude/fix-public-wishlist-01RNyT3GWmd8UXZ5f9gWggrc`
3. Check the console output when starting the dev server for errors
4. Run `npm run db:types` to regenerate TypeScript types
5. Check browser Network tab for failed API requests to `/api/social/explore`

---

## Summary

The most common issue is that the **database migration hasn't been applied**. Make sure you:

1. ✅ Run `APPLY_SOCIAL_MIGRATION.sql` in Supabase Dashboard
2. ✅ Set at least one user's `wishlist_privacy` to `'public'`
3. ✅ That user has wishlisted items (status = 'wishlisted')
4. ✅ Restart Next.js dev server
5. ✅ You're logged in when testing

Without ALL of these, the Explore page will show "No Public Wishlists Yet".
