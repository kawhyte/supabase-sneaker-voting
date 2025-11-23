# 🧪 Existing Retailers Test Plan

**Purpose**: Verify NO BREAKING CHANGES to existing retailers after implementing Smart Hybrid Architecture

**Date**: November 23, 2025
**Total Retailers to Test**: 15 existing retailers

---

## 📋 Test Checklist

### ✅ High Priority (Most Common)

- [ ] **Nike** (requiresJS: true)
  - Test URL: `https://www.nike.com/t/air-max-90-mens-shoes-6n8Nd/CN8490-002`
  - Expected: Brand, Model, Price, Images
  - Strategy: Browserless /content

- [ ] **Adidas** (requiresJS: true)
  - Test URL: `https://www.adidas.com/us/stan-smith-shoes/FX5501.html`
  - Expected: Brand, Model, Price, Images
  - Strategy: Browserless /content

- [ ] **Foot Locker** (requiresJS: false)
  - Test URL: `https://www.footlocker.com/product/jordan-retro-11-mens/378037.html`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **Shoe Palace** (requiresJS: false) ✅ ALREADY TESTED
  - Test URL: `https://www.shoepalace.com/products/asics-mens-gel-kayano-14-1201a019-020-black-pure-silver`
  - Expected: Complete data (Shopify JSON)
  - Status: ✅ **WORKING** (tested earlier)

- [ ] **Finish Line** (requiresJS: false)
  - Test URL: `https://www.finishline.com/store/product/mens-nike-air-max-90-casual-shoes/prod2794444`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

---

### ⚠️ Medium Priority

- [ ] **Champs Sports** (requiresJS: false)
  - Test URL: `https://www.champssports.com/product/jordan-retro-11-mens/378037.html`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **JD Sports** (requiresJS: true)
  - Test URL: `https://www.jdsports.com/product/black-nike-air-max-90/16462825`
  - Expected: Brand, Model, Price, Images
  - Strategy: Browserless /content

- [ ] **Eastbay** (requiresJS: false)
  - Test URL: `https://www.eastbay.com/product/nike-air-force-1-low-mens/DD8959100.html`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **Hibbett Sports** (requiresJS: false)
  - Test URL: `https://www.hibbett.com/nike-air-force-1-low-mens/DD8959100.html`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **Dick's Sporting Goods** (requiresJS: true)
  - Test URL: `https://www.dickssportinggoods.com/p/nike-mens-air-max-90-shoes-20nikmairmx90xxxmsho/20nikmairmx90xxxmsho`
  - Expected: Brand, Model, Price, Images
  - Strategy: Browserless /content

---

### 🔻 Lower Priority (Less Common)

- [ ] **Old Navy** (requiresJS: true)
  - Test URL: `https://oldnavy.gap.com/browse/product.do?pid=123456` *(Need valid URL)*
  - Expected: Brand, Model, Price, Images
  - Strategy: Browserless /content
  - **Note**: Gap Inc. brand with heavy bot detection

- [ ] **Stance** (requiresJS: false)
  - Test URL: `https://www.stance.com/products/classic-crew-socks`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **Bath & Body Works** (requiresJS: false)
  - Test URL: `https://www.bathandbodyworks.com/p/eucalyptus-spearmint-3-wick-candle-026383001.html`
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **House of Heat** (requiresJS: false)
  - Test URL: `https://houseofheat.co/...` *(Need valid URL - may be news/marketplace, not retailer)*
  - Expected: Brand, Model, Price, Images
  - Strategy: Standard fetch

- [ ] **Shopify Store (Generic)** (requiresJS: false)
  - Test URL: Any Shopify store ending in `.myshopify.com`
  - Expected: Shopify JSON fallback should work
  - Strategy: Shopify JSON backdoor

---

## 🎯 Success Criteria

### Per Retailer:
- ✅ **Success**: Extracts brand, model, price, and at least 1 image
- ⚠️ **Partial**: Extracts brand and model but missing price or images
- ❌ **Failure**: Returns error or no data

### Overall:
- **Target**: ≥85% of existing retailers work (13/15)
- **Acceptable**: ≥70% of existing retailers work (11/15)
- **Failure**: <70% of existing retailers work

---

## 📊 Test Results

| # | Retailer | Status | Response Time | Data Quality | Notes |
|---|----------|--------|---------------|--------------|-------|
| 1 | Nike | ⏸️ Pending | - | - | - |
| 2 | Adidas | ⏸️ Pending | - | - | - |
| 3 | Foot Locker | ⏸️ Pending | - | - | - |
| 4 | Shoe Palace | ✅ **Working** | ~1.5s | Complete | Tested earlier, Shopify JSON |
| 5 | Finish Line | ⏸️ Pending | - | - | - |
| 6 | Champs Sports | ⏸️ Pending | - | - | - |
| 7 | JD Sports | ⏸️ Pending | - | - | - |
| 8 | Eastbay | ⏸️ Pending | - | - | - |
| 9 | Hibbett Sports | ⏸️ Pending | - | - | - |
| 10 | Dick's | ⏸️ Pending | - | - | - |
| 11 | Old Navy | ⏸️ Pending | - | - | Gap Inc. brand |
| 12 | Stance | ⏸️ Pending | - | - | - |
| 13 | Bath & Body Works | ⏸️ Pending | - | - | - |
| 14 | House of Heat | ⏸️ Pending | - | - | May not be a retailer |
| 15 | Shopify Generic | ⏸️ Pending | - | - | - |

**Current Success Rate**: 1/15 (7%) - Only Shoe Palace tested so far

---

## 🔧 Testing Instructions

### Option 1: Using Test Lab UI
1. Go to `http://localhost:3000/test-scrapers`
2. Use the "Custom URL Test" field
3. Paste each test URL from the checklist above
4. Click "Test"
5. Record results in the table

### Option 2: Using curl (Terminal)
```bash
curl -X POST http://localhost:3000/api/scrape-product \
  -H "Content-Type: application/json" \
  -d '{"url":"TEST_URL_HERE"}' | jq '.'
```

### Option 3: Batch Testing Script
```bash
# Create a test script (save as test-all-retailers.sh)
#!/bin/bash

URLs=(
  "https://www.nike.com/t/air-max-90-mens-shoes-6n8Nd/CN8490-002"
  "https://www.adidas.com/us/stan-smith-shoes/FX5501.html"
  "https://www.footlocker.com/product/jordan-retro-11-mens/378037.html"
  # ... add all URLs
)

for url in "${URLs[@]}"; do
  echo "Testing: $url"
  curl -X POST http://localhost:3000/api/scrape-product \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$url\"}" -s | jq '.success'
  sleep 2
done
```

---

## ⚠️ Known Issues to Watch For

1. **Browserless Rate Limits**: Some retailers use Browserless, may hit rate limits
2. **Anti-Bot Protection**: Nike, Adidas, Dick's may have varying results
3. **Old Navy**: Gap Inc. brand with known bot detection issues
4. **House of Heat**: May be news/marketplace, not direct retailer
5. **Dynamic Pricing**: Some sites show different prices based on location/session

---

## 🆘 If Tests Fail

### Debugging Steps:
1. Check console logs for detailed error messages
2. Verify BROWSERLESS_API_KEY is set in `.env.local`
3. Check if site is temporarily down (test in browser)
4. Try a different product URL for that retailer
5. Check if CSS selectors need updating (sites change their structure)

### Reporting Results:
Update the table above with:
- Status: ✅ Working / ⚠️ Partial / ❌ Failed
- Response Time: In seconds
- Data Quality: Complete / Partial / None
- Notes: Any errors or observations

---

## 🎯 Next Steps After Testing

1. **If ≥85% Success**: All good! Document results and close testing
2. **If 70-85% Success**: Acceptable, but note which retailers failed
3. **If <70% Success**: Investigate breaking changes, may need to revert or fix

---

**Start with HIGH PRIORITY retailers first!** These are the most commonly used.
