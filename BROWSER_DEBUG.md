# Browser Debug Steps

Follow these steps to see what the Explore page API is returning:

## Step 1: Open Browser DevTools

1. Go to http://localhost:3000/explore
2. Press **F12** (or **Cmd+Option+I** on Mac)
3. Click on the **Network** tab
4. Refresh the page (**Cmd+R** or **Ctrl+R**)

## Step 2: Find the API Request

1. In the Network tab, look for a request to: **`explore?limit=20&offset=0`**
2. Click on it
3. Click on the **Response** tab

### What to check:

**If you see:**
```json
{
  "users": [],
  "total": 0,
  "hasMore": false
}
```
→ API is running but returning no users. Go to Step 3.

**If you see:**
```json
{
  "error": "..."
}
```
→ API is throwing an error. Check the **Console** tab for the full error.

**If you DON'T see the explore request at all:**
→ The page might not be calling the API. Check Console tab for JavaScript errors.

## Step 3: Check the Console Tab

1. Click on the **Console** tab in DevTools
2. Look for any red error messages
3. Common errors and what they mean:

**"column profiles.user_id does not exist"**
→ The profiles table schema is wrong. The primary key should be `id`, not `user_id`.

**"column followers.follower_id does not exist"**
→ You're running old code. Make sure you pulled the latest changes and restarted the server.

**"401 Unauthorized"**
→ You're not logged in. Log in and refresh.

## Step 4: Manual API Test

Open the Console tab and paste this code to manually call the API:

```javascript
// Test the explore API directly
fetch('/api/social/explore?limit=20&offset=0')
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
    if (data.users && data.users.length > 0) {
      console.log('✅ API returned', data.users.length, 'users');
      console.log('First user:', data.users[0]);
    } else {
      console.log('❌ API returned 0 users');
      console.log('Total count:', data.total);
    }
  })
  .catch(err => console.error('❌ API Error:', err));
```

Press **Enter** and check the output.

## Step 5: Check if you're logged in

In the Console tab, run:

```javascript
// Check authentication
fetch('/api/auth/user')
  .then(res => res.json())
  .then(data => console.log('Current user:', data))
  .catch(err => console.error('Auth error:', err));
```

Or check Supabase auth directly:

```javascript
// Check Supabase session
const { createClient } = await import('/utils/supabase/client');
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('Logged in as:', user?.email);
```

## Step 6: Check the page source

View the page source (Cmd+U or Ctrl+U) and search for "EmptyExplore" or "No Public Wishlists Yet".

If you find it in the HTML, the component is rendering the empty state intentionally because `users.length === 0`.

## What to send me:

After running these steps, please send me:

1. **The API Response from Step 2** (the JSON from `/api/social/explore`)
2. **Any errors from Step 3** (Console tab errors)
3. **The output from Step 4** (Manual API test)
4. **The results from DEBUG_EXPLORE_PAGE.sql Query 3** (the diagnosis column)

This will help me pinpoint exactly where the problem is!
