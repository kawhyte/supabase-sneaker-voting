# PurrView Changelog

## Recent Updates & Migrations

### UI/UX Standardization (October 2024) ✅ COMPLETED
Comprehensive update to align all components with industry standards (Google Material Design, Apple HIG, Microsoft Fluent).

**Changes Made:**
1. Switch Component: 8px×16px → 24px×44px track (Material Design standard)
2. Checkbox Component: 12px → 16px box (Material Design 3)
3. Photo Upload UI: Compact badges (text-xs), 24px delete buttons, 16px icons
4. Global .dense Class: Applied to 12 locations for intentionally compact UIs
5. Button Sizing: Standardized to 32px/40px/44px hierarchy
6. Icon Sizing: Audited 59 files, standardized to 12px/16px/20px/24px
7. Tooltip Contrast: Fixed Cost Per Wear tooltip (white text on dark bg)

**Files Modified:** 11 total (switch.tsx, checkbox.tsx, multi-photo-upload.tsx, photo-carousel.tsx, wardrobe-item-card/*, sizing-journal-filters*.tsx, navbar-client.tsx, add-item-form.tsx)

**Accessibility Improvements:**
- All components meet WCAG AAA standards
- 44px touch targets via parent containers
- Enhanced focus rings on all interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigation fully supported

---

### Smart Duplicate Detection (November 2025) ✅ COMPLETED
Intelligent fuzzy matching system to detect duplicate items with typo tolerance and advanced similarity scoring.

**Features Implemented:**
1. Fuzzy Text Matching - Levenshtein distance algorithm
2. Weighted Scoring - Category (40%), Color (30%), Brand (20%), Model (10%)
3. Two-Tier Detection - Exact duplicates (≥85%) and Similar items (60-84%)
4. Colorway Intelligence - Ignores same brand + different colors
5. Limited Edition Detection - Catches re-releases
6. User Settings - Two independent toggles (both default ON)
7. Non-Blocking Warnings - Shows similarity scores, top 2 matches
8. Performance Optimized - <200ms for 1000+ item wardrobes

**Database Changes:**
- Migration 050: Added `enable_similar_item_warnings` column (default: TRUE)
- Updated `enable_duplication_warnings` default to TRUE
- Added indexes for efficient queries

**Files Created:**
- `lib/smart-duplicate-detector.ts` (350 lines)
- `supabase/migrations/050_add_smart_duplicate_detection.sql`

**Files Modified:**
- `components/PurchasePreventionSettings.tsx`
- `components/DuplicationWarningBanner.tsx`
- `components/add-item-form/useFormLogic.ts`
- `components/add-item-form/AddItemForm.tsx`

**Dependencies Added:**
- `fastest-levenshtein@1.0.16` (34KB, MIT license, 0 runtime dependencies)

---

### Notification Types Removal (November 2025) ✅ COMPLETED
Removed three unnecessary notification features to simplify the notification system.

**Notification Types Removed:**
1. Shopping Reminders - "Gentle reminders to use what you have"
2. Cooling-Off Period - Notifications when wishlist items finished cooling-off
3. Quiet Hours - Timezone-aware notification scheduling

**Database Changes:**
- Migration 051: Dropped 7 columns from `notification_preferences` table
- Marked existing `shopping_reminder` and `cooling_off_ready` notifications as read

**Files Modified:** 7 files, ~250 lines removed

---

### Fit Rating Removal (Migration 007) ✅ COMPLETED
Deprecated `fit_rating` feature. All UI components now use `comfort_rating` (1-5 scale).

**Changes:**
- Removed `fit_rating` from `SizingJournalEntry` type
- Removed `FitProfileDashboard` component
- Updated sort utility to use `comfort-rating`
- Migration 007 drops `fit_rating` column

**Bundle improvements:** Dashboard reduced from 9.84 kB to 4.96 kB (49% reduction)

---

### Phase 1: Foundation Cleanup (October 2025) ✅ COMPLETED
Consolidated and simplified codebase for improved maintainability.

**Changes:**
- Deleted `lib/size-analytics.ts` (348 lines)
- Deleted `components/fit-profile-dashboard.tsx`
- Merged 'journaled' status into 'wishlisted'
- Created Migration 013
- Renamed "Wishlist" → "Want to Buy"
- Updated TypeScript types (now: 'owned' | 'wishlisted' only)

**Bundle improvements:** Removed ~19KB of unused code

---

### Phase 2: Outfit Visualization Core (October 2025) ✅ COMPLETED
Complete outfit composition and visualization system.

**Features:**
1. Outfit Creation Studio - Modal with live canvas preview
2. iPhone Mockup Canvas - 375×667px with draggable items
3. Smart Auto-Arrange - Category-based positioning
4. Manual Crop Tool - Rectangle cropping with handles
5. Outfit Gallery - Grid/list view
6. Wear Tracking - Times worn, last worn date
7. Dashboard Integration - New "Outfits" tab

**Database Schemas:**
- `outfits` table
- `outfit_items` table
- RLS Policies

**API Endpoints:**
- POST/GET/PUT/DELETE `/api/outfits`

**Components Created:**
- OutfitStudio.tsx (~360 lines)
- OutfitCanvas.tsx (~250 lines)
- ManualCropTool.tsx (~280 lines)
- OutfitListView.tsx (~280 lines)
- OutfitsDashboard.tsx (~230 lines)
- outfit-layout-engine.ts (~250 lines)

---

### Phase 3: Component Refactoring (November 2025) ✅ COMPLETED
Modularization of AddItemForm component.

**Changes:**
- Split AddItemForm (1580 lines) into 8 modular components
- Extracted business logic to `useFormLogic` hook
- Extracted display logic to `lib/wardrobe-item-display-logic.ts`
- Extracted validators to `lib/wardrobe-item-validators.ts`

**Components Created:**
- AddItemForm.tsx (orchestrator)
- useFormLogic.ts (383 lines)
- 6 section components (BasicInfo, Pricing, Sizing, Photo, ProductURL, Notes, FormActions)
- 2 utility libraries (display-logic, validators)

**Bundle:** -2.4KB (better tree-shaking)

---

### Phase 4: Database Table Rename ✅ VERIFIED
Migration from `sneakers` to `items` table completed in production.

**Details:**
- Production uses `items` table
- All data migrated
- All code references updated
- RLS policies applied
- Zero `.from('sneakers')` references found

**Migration Strategy:** 3-step zero-downtime approach

---

### Phase 5: Type System & Final Polish (November 2025) ✅ COMPLETED
Const enums and magic string elimination.

**Changes:**
- Created `types/ItemStatus.ts` - Const enum with helpers
- Created `types/SizeType.ts` - Const enum with category arrays
- Replaced ~50+ magic strings across 23 files
- Added `noFallthroughCasesInSwitch` to tsconfig
- Removed ~50 unused imports

**Build Status:** TypeScript PASSING, Build PASSING (102 kB first load)

---

### Phase 6: Verification & Testing (November 2025) ✅ COMPLETED
Comprehensive verification and documentation.

**Automated Checks:**
- TypeScript compilation: PASSING
- Production build: PASSING (102 kB first load, < 500 kB target)
- No warnings or errors
- Code splitting working

**Manual Testing Framework:** 14 comprehensive test procedures documented

**Documentation:** All phases documented in CLAUDE.md

---

### Add/Edit Item Form UX Improvements (November 2025) ✅ COMPLETED
Complete overhaul of add/edit item form with smart UX features.

**Features:**
1. Color field now required and visible in Quick mode
2. Smart target price suggestions (tiered: 80%/70%/60% based on price)
3. Sale Price field in both Quick and Advanced modes
4. Removed AccordionTrigger redundancy
5. Removed all emojis from forms
6. Improved error messaging and validation
7. URL auto-fill for sale prices

**Files Modified:** 7 files (716 insertions, 266 deletions)

**Components Updated:**
- useFormLogic.ts (schema validation)
- BasicInfoSection.tsx (color field)
- PricingSection.tsx (smart suggestions)
- SizingSection.tsx (removed accordion)
- AddItemForm.tsx (complete rewrite, 489 lines)
- add-new-item/page.tsx (switched to modular form)
- EditItemModal.tsx (updated to new form)
