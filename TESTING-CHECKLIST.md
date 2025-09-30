# Phase 6: Testing & Refinement Checklist

## ✅ Build Verification (COMPLETED)
- [x] TypeScript compilation passes with no errors
- [x] All async API routes properly await promises (Next.js 15 compatibility)
- [x] Error handling uses proper type guards (`error instanceof Error`)
- [x] Production build succeeds

## 🔍 Phase 6.2: Scraper Testing

### Nike.com Scraper
Test URLs:
- [ ] https://www.nike.com/t/air-force-1-07-mens-shoes-5QFp5Z
- [ ] https://www.nike.com/t/air-jordan-1-mid-shoes-X5pM09

Expected Data:
- Brand: "Nike" (hardcoded)
- Model: Product title from page
- Colorway: From subtitle
- SKU/Style code: From product details
- Retail price: Current price
- Sale price: If discounted
- Images: Up to 5 product images

### Adidas.com Scraper
Test URLs:
- [ ] https://www.adidas.com/us/ultraboost-light-running-shoes
- [ ] https://www.adidas.com/us/samba-og-shoes

Expected Data:
- Brand: "Adidas" (hardcoded)
- Model: Product title
- Colorway: From subtitle
- Retail/Sale prices
- Images: Up to 5

### StockX Scraper
Test URLs:
- [ ] https://stockx.com/nike-dunk-low-panda
- [ ] https://stockx.com/adidas-yeezy-boost-350-v2-zebra

Expected Data:
- Brand: Extracted from title
- Model: Rest of title after brand
- Colorway: From product details
- Price: Current bid/ask price
- Images: Up to 5

### SoleRetriever Scraper
Test URLs:
- [ ] https://soleretriever.com/nike-air-jordan-1-retro-high-og
- [ ] https://soleretriever.com/adidas-yeezy-slide

Expected Data:
- Brand: First word of title
- Model: Rest of title
- All other fields as available

### Generic Scraper (Fallback)
Test URLs:
- [ ] https://www.footlocker.com/product/~/XXXXX.html
- [ ] Any other sneaker retailer

Expected Behavior:
- Attempts to extract basic product info from common HTML patterns
- Should not crash if data is unavailable

### Scraper Error Handling
- [ ] Invalid URL format returns 400 error
- [ ] Non-HTTP protocol returns error
- [ ] 15-second timeout triggers properly
- [ ] Retry logic (2 retries) works on failure
- [ ] Specific error messages for HTTP 404, 403, timeout
- [ ] Network errors handled gracefully

## 📝 Form State Management Testing

### Auto-save Draft (Phase 5.1)
- [ ] Form auto-saves to localStorage every 30 seconds
- [ ] Console logs show save timestamps
- [ ] Last saved time displays when changes exist
- [ ] Photos count saved (actual images not saved to localStorage)
- [ ] URL data preserved

### Draft Restoration (Phase 5.2)
- [ ] Draft restored on page reload
- [ ] Blue notification shows "Draft restored from previous session"
- [ ] Notification dismissible with X button
- [ ] Drafts older than 7 days automatically deleted
- [ ] Form fields populated correctly from draft
- [ ] URL preview data restored

### Unsaved Changes Warning (Phase 5.3)
- [ ] Browser warning appears when leaving page with unsaved data
- [ ] Warning does NOT appear when form is clean
- [ ] Warning does NOT appear during submission
- [ ] Works with browser back button
- [ ] Works with navigation away from page

### Draft Clearing
- [ ] Draft cleared after successful submission
- [ ] Draft NOT cleared if submission fails
- [ ] "Clear draft" feature (if implemented)

## ♿ Accessibility Testing (Phase 4.2)

### Keyboard Navigation
- [ ] Tab through entire form in logical order
- [ ] All interactive elements reachable via keyboard
- [ ] Focus indicators visible on all elements
- [ ] Enter key submits form
- [ ] Escape key closes dropdowns/modals

### Screen Reader Testing
- [ ] Form labels properly announced
- [ ] Error messages announced when they appear
- [ ] Button states announced (loading, disabled)
- [ ] ARIA labels present on icon-only buttons
- [ ] Decorative icons hidden with aria-hidden

### Focus Management
- [ ] Focus rings visible (blue ring on focus)
- [ ] Focus not trapped unexpectedly
- [ ] Modal/dropdowns return focus on close

## 📱 Mobile Responsiveness (Phase 4.3)

### Touch Targets
- [ ] All buttons minimum 44x44px
- [ ] Fit rating buttons easy to tap (min-h-[80px])
- [ ] Comfort rating stars easy to tap (44x44px)
- [ ] No accidental taps on adjacent elements

### Layout
- [ ] Two-column layout collapses on mobile
- [ ] Smart Import section readable on small screens
- [ ] Form inputs appropriately sized
- [ ] Dropdown menus usable on mobile
- [ ] Images display correctly

### Touch Interactions
- [ ] touch-manipulation class improves responsiveness
- [ ] Star rating tap and drag works
- [ ] Image upload works on mobile
- [ ] Dropdowns open properly

## ✅ Form Validation (Phase 5.4)

### Required Fields
- [ ] User name required - enhanced error with icon
- [ ] Experience type required - enhanced error
- [ ] Brand required - enhanced error with helper text
- [ ] Model required - enhanced error with example
- [ ] At least 1 photo required

### Try-On Conditional Fields
- [ ] Size required when "Tried On" selected
- [ ] Fit rating required when "Tried On" selected
- [ ] Both show enhanced error messages
- [ ] Fields hidden when "Seen" selected

### Error Message Quality
- [ ] Red background with warning icon
- [ ] Bold error text + helpful hint
- [ ] Specific guidance for each field
- [ ] Errors clear when field valid

## 🎨 Visual Polish (Phase 4.1)

### Loading States
- [ ] Skeleton loader shows during URL scraping
- [ ] Animated pulse effect visible
- [ ] Product preview fades in smoothly
- [ ] Button shows spinner during submission

### Success States
- [ ] Green alert shows after successful save
- [ ] Success message clear and helpful
- [ ] Form clears after 3 seconds

### Error States
- [ ] Red styling for scraper failures
- [ ] Specific error messages helpful
- [ ] Retry functionality works

## 🌐 Cross-Browser Testing

### Chrome/Edge (Chromium)
- [ ] All features work
- [ ] localStorage functions properly
- [ ] beforeunload warning appears
- [ ] CSS animations smooth

### Firefox
- [ ] All features work
- [ ] localStorage functions properly
- [ ] beforeunload warning appears
- [ ] Form submission works

### Safari
- [ ] All features work
- [ ] localStorage functions properly
- [ ] beforeunload warning appears
- [ ] iOS Safari mobile view correct

## ⚡ Performance

### Bundle Size
- [ ] Check Next.js build output for route sizes
- [ ] No unusually large routes (>200KB)
- [ ] Code splitting working properly

### Runtime Performance
- [ ] No excessive re-renders (check React DevTools)
- [ ] Form inputs responsive (no lag)
- [ ] Image preview generation fast
- [ ] Auto-save doesn't block UI

### Network
- [ ] API routes respond quickly (<2s)
- [ ] Scraper timeout at 15s works
- [ ] Images load progressively
- [ ] No unnecessary API calls

## 🐛 Edge Cases

### Data Edge Cases
- [ ] Empty/missing fields handled gracefully
- [ ] Very long text in inputs doesn't break layout
- [ ] Special characters in URLs handled
- [ ] Non-sneaker URLs handled

### User Behavior
- [ ] Rapid form changes don't break auto-save
- [ ] Submitting while auto-saving works
- [ ] Multiple tabs don't conflict
- [ ] Slow network doesn't break app

## 📊 Final Checks

### Console Logs
- [ ] No errors in browser console
- [ ] No warnings in browser console
- [ ] Only expected log messages (drafts, etc.)

### Accessibility
- [ ] Run Lighthouse accessibility audit (aim for 90+)
- [ ] Test with actual screen reader (NVDA/JAWS/VoiceOver)
- [ ] Check color contrast ratios

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Consistent code style
- [ ] Comments where needed

---

## Testing Priority

### P0 (Critical - Must Test)
1. Form submission works end-to-end
2. Draft save/restore works
3. All required validations work
4. Mobile touch targets adequate
5. Build compiles successfully

### P1 (High - Should Test)
1. All scrapers work with real URLs
2. Keyboard navigation complete
3. Error messages helpful
4. Auto-save doesn't lose data
5. Cross-browser basics work

### P2 (Medium - Nice to Test)
1. Screen reader experience
2. Performance metrics
3. Edge case handling
4. All loading states
5. Animation smoothness

### P3 (Low - Optional)
1. Very slow network conditions
2. Multiple simultaneous users
3. Extremely long input strings
4. Unusual browser configurations

---

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Form Functionality: ☐ Pass ☐ Fail
Scrapers: ☐ Pass ☐ Fail
Accessibility: ☐ Pass ☐ Fail
Mobile: ☐ Pass ☐ Fail
Performance: ☐ Pass ☐ Fail

Issues Found:
1. ___________
2. ___________
3. ___________

Notes:
___________
```
