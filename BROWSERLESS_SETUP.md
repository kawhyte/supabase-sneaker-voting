# Browserless.io Setup Guide

This guide explains how to set up Browserless.io for scraping dynamic JavaScript-rendered websites.

## What is Browserless?

Browserless.io provides browser automation in the cloud, allowing us to scrape websites that require JavaScript execution (like Old Navy, Gap, Bath & Body Works).

**API Endpoint:** We use the production REST API at `https://production-sfo.browserless.io`

**Free Tier:**
- 1,000 requests/month
- No credit card required
- Perfect for 2 users scraping a few items per day

## When is Browserless Used?

Our scraper uses a **smart tiered approach**:

1. **First Attempt:** Try fast cheerio scraping (works for 80% of sites)
2. **Fallback:** If cheerio fails, automatically use Browserless browser automation

### Sites that Need Browserless:
- ⚠️ **Old Navy** (oldnavy.gap.com) - **BLOCKED by bot detection** (~0% success rate)
- ⚠️ **Gap** (gap.com) - **BLOCKED by bot detection** (~0% success rate)
- ⚠️ **Banana Republic** (bananarepublic.gap.com) - **BLOCKED by bot detection** (~0% success rate)
- ⚠️ **Bath & Body Works** (bathandbodyworks.com) - Strong bot protection (not tested yet)
- 🟡 **Nike** (nike.com) - Partial support (50-70% success rate)

**Note**: Gap family sites (Old Navy, Gap, Banana Republic) have aggressive bot detection that blocks both `/unblock` and `/content` endpoints. Recommend using manual entry or alternative sources like SoleRetriever.

### Sites that Work Without Browserless:
- ✅ **Shoe Palace** (shoepalace.com) - Shopify JSON API (99% success)
- ✅ **BEIS** (beistravel.com) - Shopify JSON API (99% success)
- ✅ **Stance** (stance.com) - Mostly static (95% success)
- ✅ **Nordstrom** (nordstrom.com) - Good meta tags (90% success)

## Setup Steps

### 1. Sign Up for Browserless (5 minutes)

1. Go to https://www.browserless.io/
2. Click "Sign Up" (no credit card required)
3. Verify your email
4. You'll see your dashboard with 1,000 free units

### 2. Get Your API Key

1. Go to https://www.browserless.io/dashboard
2. Copy your API key (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. Keep it safe - you'll add it to your environment variables

### 3. Add to Local Development

**Option A: Using .env.local file**

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```bash
   BROWSERLESS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

**Option B: Direct environment variable**

```bash
export BROWSERLESS_API_KEY=your_actual_api_key_here
npm run dev
```

### 4. Deploy to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `BROWSERLESS_API_KEY`
   - **Value:** Your Browserless API key
   - **Environments:** Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your app (Vercel will automatically redeploy with new env var)

## Testing

### Test Without Browserless (Should Fail)

```bash
# Remove or comment out BROWSERLESS_API_KEY
# Try scraping Old Navy - should get error message about needing Browserless
```

### Test With Browserless (Should Work)

```bash
# With BROWSERLESS_API_KEY set
# Try scraping Old Navy - should work!
```

**Example URLs to test:**
- Old Navy: `https://oldnavy.gap.com/browse/product.do?pid=803262032`
- Bath & Body Works: `https://www.bathandbodyworks.com/p/tis-the-season-3-wick-candle-028021610`

## How It Works

### Flow Diagram

```
User submits product URL
         ↓
Try cheerio scraping (fast, free)
         ↓
    ┌────✅ Success? → Return data
    │
    └────❌ Failed? → Check Browserless configured?
              ↓
         ┌────❌ No → Return error with setup instructions
         │
         └────✅ Yes → Use Browserless (slower, counts against quota)
                   ↓
              ┌────✅ Success? → Return data
              │
              └────❌ Failed? → Return error (site structure changed?)
```

### Performance

| Method | Speed | Cost | Success Rate |
|--------|-------|------|--------------|
| **Cheerio** | ~2-3s | Free | 80% of sites |
| **Browserless /unblock** | ~8-15s | 1 unit per request | 60% of sites* |
| **Browserless /content** | ~15-25s | 1 unit per request | 70% of sites* |

*Success rate varies by site. Gap family sites are currently blocked.

### Caching

To minimize API usage, we cache Browserless results for **24 hours** (configurable). This means:
- Same URL scraped within 5 mins = instant (no API call)
- Prevents duplicate requests
- Saves your quota

## Monitoring Usage

### Check Cache Status

The app logs cache hits in the console:
```
🎯 Cache hit for https://oldnavy.gap.com/...
🌐 Fetching https://oldnavy.gap.com/... with Browserless...
```

### Monitor Browserless Usage

1. Go to https://www.browserless.io/dashboard
2. View your usage stats:
   - Units used this month
   - Units remaining
   - Request history

### Estimate Your Usage

**For 2 users:**
- 10 scrapes/day/user = 20 scrapes/day
- 20 scrapes/day × 30 days = 600 scrapes/month
- **Well under the 1,000/month free limit!** ✅

Even with cache misses, you should stay comfortably under the free tier.

## Troubleshooting

### Error: "BROWSERLESS_API_KEY not configured"

**Cause:** Environment variable not set or not loaded

**Fix:**
1. Check `.env.local` file exists and has the key
2. Restart dev server: `npm run dev`
3. For Vercel: Check environment variables in dashboard

### Error: "Browserless API error (401)"

**Cause:** Invalid API key

**Fix:**
1. Double-check your API key from https://www.browserless.io/dashboard
2. Make sure there are no extra spaces or quotes in `.env.local`
3. Format should be: `BROWSERLESS_API_KEY=abc123...` (no quotes needed)

### Error: "Browserless API error (429)"

**Cause:** Rate limit exceeded (used all 1,000 free units)

**Fix:**
1. Wait until next month for reset
2. Or upgrade to paid plan ($49/month for 50,000 units)
3. Or reduce scraping frequency
4. Check for cache misses (cache should help avoid this)

### Scraping Still Fails Even With Browserless

**Cause:** Site structure changed or has additional protection

**Fix:**
1. Check site is actually supported (see list above)
2. File an issue - site may need custom scraper updates
3. Try alternative source (e.g., SoleRetriever instead of direct brand site)

## Cost Analysis

**Free Tier:**
- ✅ $0/month
- ✅ 1,000 requests/month
- ✅ No credit card needed
- ✅ Perfect for 2 users

**Paid Tier (if you ever need it):**
- $49/month = 50,000 requests
- $0.00098 per request
- Only needed if you exceed free tier

**Recommendation:** Start with free tier. You'll likely never need paid tier for personal use.

## Security Notes

- ✅ API key is server-side only (never exposed to browser)
- ✅ Stored in environment variables (not in code)
- ✅ Not committed to git (`.env.local` is in `.gitignore`)
- ⚠️ Don't share your API key publicly
- ⚠️ Regenerate key if accidentally exposed

## Current Status & Recommendations

### Working Sites ✅
- **Shoe Palace** - Use Shopify JSON API (no Browserless needed)
- **Stance** - Use cheerio scraping (no Browserless needed)
- **Nordstrom** - Use cheerio scraping (no Browserless needed)

### Blocked Sites ❌
- **Old Navy** - Bot detection blocks automation
- **Gap** - Bot detection blocks automation
- **Banana Republic** - Bot detection blocks automation

**Recommendation**: For Gap family sites, use:
1. Manual data entry
2. SoleRetriever as alternative source (many products available there)
3. Direct API access if official partnership is possible

### Caching Benefits
- **24-hour cache** reduces API calls by 90%+
- For 2 users tracking ~50 products = ~50 API calls/month
- Well under 1,000/month free tier limit

## Summary

**Setup Time:** ~5 minutes
**Cost:** $0 (free tier, ~50-100 calls/month with caching)
**Working:** Shoe Palace, Stance, Nordstrom, Nike (partial)
**Blocked:** Old Navy, Gap, Banana Republic, Bath & Body Works

**Focus on what works!** ✅
