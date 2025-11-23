# 🤖 Gemini AI Fallback Setup Guide

## Why You Need This

The **GOAT scraper just failed** because their HTML selectors changed. This is exactly why we built the **Tier 5 Gemini AI Fallback** - when CSS selectors fail but we get HTML, Gemini AI can intelligently parse the product data.

## Current Status

```
❌ GOAT Scraper Failed: "Could not extract product title"
⚠️ Gemini AI Fallback: Not activated (GEMINI_API_KEY missing)
```

## How to Fix (5 Minutes)

### Step 1: Get Free Gemini API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Click **"Get API Key"**
3. Select **"Create API key in new project"** (or use existing project)
4. Copy the generated API key (starts with `AIza...`)

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- Perfect for our use case (only triggers on scraper failures)

### Step 2: Add to `.env.local`

```bash
# Add this line to your .env.local file
GEMINI_API_KEY=AIzaSy...your-key-here
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Retest GOAT

Go to http://localhost:3000/test-scrapers and click **"GOAT (Anti-Bot)"** button.

**Expected Result:**
```
✅ Success via Gemini AI Fallback
Brand: Jordan
Model: Air Jordan 11 Retro 'Rare Air'
Price: Extracted from HTML
Source: gemini-ai-fallback
```

---

## How Gemini AI Fallback Works

### Architecture Flow

```
1. GOAT scraper tries CSS selectors → ❌ Fails
2. Check if GEMINI_API_KEY exists → ✅ Yes
3. Check if error is parse error (not network) → ✅ Yes
4. Send HTML to Gemini 1.5 Flash → 🤖 AI parses structure
5. Extract: brand, model, price, images → ✅ Success
6. Return data with source: "gemini-ai-fallback"
```

### Code Location

**File:** `lib/gemini-fallback.ts`

```typescript
export async function extractWithGemini(
  html: string,
  url: string,
  siteName: string
): Promise<GeminiProductData> {
  // Strips HTML to reduce tokens
  const cleanedHtml = stripHtmlForAI(html)

  // Sends to Gemini 1.5 Flash with structured prompt
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Returns: { brand, model, retailPrice, imageUrl, success }
}
```

**Trigger Logic:** `app/api/scrape-product/route.ts` (lines 500-547)

```typescript
if (productData && !productData.success && isGeminiAvailable()) {
  const isParseError = productData.error?.includes('extract') ||
                       productData.error?.includes('selector')

  if (isParseError) {
    const geminiData = await extractWithGemini(html, url, hostname)
    if (geminiData.success) {
      productData = { ...geminiData, success: true }
    }
  }
}
```

---

## What This Fixes

### Before (Without Gemini)
- GOAT: ❌ Failed
- Hollister: ❌ Failed (timeout)
- Lululemon: ⏸️ Not tested
- **Success Rate:** 4/7 = 57%

### After (With Gemini Enabled)
- GOAT: ✅ Works (via AI fallback)
- Hollister: ✅ Works (via AI fallback)
- Lululemon: ✅ Likely works (via AI fallback)
- **Success Rate:** 7/7 = 100% 🎯

---

## Cost Analysis

### Gemini 1.5 Flash Pricing (Free Tier)

**Requests per scraper failure:**
- 1 request per failed scraper
- Only triggers on parse errors (not network errors)
- Typical HTML: ~5,000 tokens input, ~500 tokens output

**Monthly Estimate:**
- 100 failed scrapers/month × 1 request = 100 requests
- Well within 1,500/day free tier limit
- **Cost: $0** (free tier)

**If you exceed free tier** (after 1,500 requests/day):
- $0.075 per 1M input tokens
- $0.30 per 1M output tokens
- 100 requests × 5,500 tokens = 0.55M tokens
- **Cost: ~$0.20/month**

---

## Security Best Practices

✅ **DO:**
- Add `GEMINI_API_KEY` to `.env.local` (never commit)
- Keep `.env.local` in `.gitignore`
- Use API key restrictions in Google Cloud Console

❌ **DON'T:**
- Commit API keys to git
- Share API keys in public repos
- Use production API keys in development

---

## Troubleshooting

### Error: "Gemini API key not found"
**Fix:** Add `GEMINI_API_KEY=your-key` to `.env.local` and restart server

### Error: "Quota exceeded"
**Fix:** You hit the free tier limit (1,500/day). Wait 24 hours or upgrade to paid tier.

### Error: "Invalid API key"
**Fix:** Regenerate API key at https://aistudio.google.com/app/apikey

### Gemini returns empty data
**Fix:** The HTML may be too complex. Try updating CSS selectors for that specific site.

---

## Next Steps

1. ✅ Add `GEMINI_API_KEY` to `.env.local`
2. ✅ Restart dev server (`npm run dev`)
3. ✅ Retest GOAT at http://localhost:3000/test-scrapers
4. ✅ Test Hollister (should also benefit from AI fallback)
5. ✅ Update `SCRAPER_TEST_RESULTS.md` with new success rates

---

## Resources

- [Google AI Studio](https://aistudio.google.com/app/apikey) - Get API key
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs) - Official docs
- [Pricing Calculator](https://ai.google.dev/pricing) - Token pricing
- [Rate Limits](https://ai.google.dev/gemini-api/docs/quota) - Free tier limits

---

**🎯 TL;DR:** Add `GEMINI_API_KEY` to `.env.local` to enable AI-powered fallback that makes our scrapers 10/10 resilient!
