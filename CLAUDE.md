# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PurrView** is a modern wardrobe management and price tracking application built with Next.js 15+ and Supabase. The app helps users catalog their clothing items, track wear statistics, calculate cost-per-wear metrics, and monitor prices for wishlist items.

### Core Features

#### 1. Wardrobe Management
- Multi-Category Support: Shoes, tops, bottoms, outerwear, accessories, jewelry, watches
- Item Status Tracking: Owned, Wishlisted (Want to Buy), or Archived
- Archive Management: Soft delete with archive reasons (sold, donated, worn out, other)
- Advanced Filtering: By category, brand, color, size, status
- Search & Sorting: Real-time search, sort by date/name/brand/wear count/cost per wear
- Bulk Operations: Archive, delete, edit multiple items
- Duplication Warnings: Smart fuzzy matching with configurable settings
- Size Preferences: Store preferred sizes per brand

#### 2. Cost Per Wear Tracking
- Smart Calculations: (Retail Price or Purchase Price) ÷ Wears
- Dynamic Targets: Budget (<$50): $2/wear, Mid-range ($50-$150): $5/wear, Premium ($150+): $10/wear
- Progress Visualization with milestone celebrations
- Financial Insights: Total spend, average cost per wear, spending trends

#### 3. Outfit Studio
- Outfit Creation: Compose outfits on iPhone mockup canvas
- Smart Auto-Arrange: Category-based positioning
- Manual Layout: Drag-and-drop items with z-index layering
- Manual Cropping: Rectangle-based photo cropping
- Outfit Gallery: Grid/list view with wear tracking
- Occasion Tracking: Categorize by occasion (casual, work, party, etc.)

#### 4. Price Monitoring System
- Automated Price Scraping: Weekly checks for wishlisted items
- Multi-Retailer Support: Nike, Adidas, Foot Locker, Shopify stores
- Price History: Trend analysis with drop detection
- Alert System: Severity levels (low/medium/high) with notifications
- Failure Handling: Auto-disable after 3 consecutive failures

#### 5. Photo Management
- Multi-Photo Support: Up to 5 photos per item
- Drag-and-Drop Reordering with DnD Kit
- Cloudinary Integration: Automatic optimization and CDN delivery
- Photo Gallery: Carousel view with keyboard navigation

#### 6. Size & Comfort Tracking
- Try-On Recording with date tracking
- Size Systems: US, EU, UK, JP, KR, CM, ONE_SIZE
- Comfort Rating: 1-5 scale
- Size Recommendations per brand

#### 7. Smart Duplicate Detection
- Intelligent Fuzzy Matching: Weighted scoring (Category 40%, Color 30%, Brand 20%, Model 10%)
- Two-Tier Detection: Exact duplicates (≥85%), Similar items (60-84%)
- Colorway Intelligence: Won't warn about same brand + different colors
- Non-Blocking Warnings: Shows similarity scores with "Add Anyway" option
- Performance: <200ms for 1000+ item wardrobes
- Library: fastest-levenshtein (34KB, MIT, 0 dependencies)

#### 8. Dashboard & Views
- Tabbed Interface: Owned | Want to Buy | Outfits | Archived Items
- Dashboard Widgets: FTUE checklist, price alerts, wear reminders
- View Density Toggle: Compact or comfortable modes
- Statistics Display: Item counts, total spend, metrics
- Responsive Grid: Auto-adjusting card layout

#### 9. User Authentication & Profiles
- Email/Password Auth: Supabase authentication
- Session Management: Automatic token refresh
- Privacy Controls: RLS policies ensure data ownership

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run clean` - Clear Next.js cache
- `npm run db:types` - Generate TypeScript types from Supabase schema
- `npm run db:setup` - Run database setup script
- `npm run db:verify` - Verify database migrations

## Architecture Overview

### Key Technologies
- **Next.js** v15+ with App Router (React Server Components)
- **Supabase**: Auth, PostgreSQL, Row Level Security (RLS)
- **TypeScript**: Full type safety with strict mode
- **Tailwind CSS** v4.x with custom 8px grid design system
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form management with Zod validation
- **Shadcn/ui**: Component library (New York style)
- **Framer Motion**: Animations and micro-interactions
- **Cloudinary**: Image hosting and optimization
- **fastest-levenshtein**: Fuzzy string matching

### Project Structure

See full structure details in repository. Key directories:
- `app/` - Next.js App Router pages
- `components/` - React components (modular wardrobe-item-card/, add-item-form/, outfit-studio/)
- `lib/` - Utilities (wardrobe-item-utils, smart-duplicate-detector, cloudinary, etc.)
- `types/` - TypeScript types (database.types.ts, ItemStatus.ts, SizeType.ts)
- `utils/supabase/` - Supabase client/server instances

### Database Schema
- `items` - Wardrobe items (all categories)
- `item_photos` - Multi-photo support with ordering
- `brands` - Brand master list with logos
- `profiles` - User profile data
- `outfits` - Outfit combinations with visual layout
- `outfit_items` - Items within outfits (positioning, crop data)
- `price_monitors` - Price tracking for wishlist items
- `price_alerts` - Price drop notifications

### Design System (Tailwind v4.x)

**Color Palette:**
- Primary: `--color-sun-400` (#FFC700) - Brand yellow
- Background: `--color-blaze-50` - Energetic page background
- Semantic tokens: `bg-background`, `text-foreground`, `bg-card`, `border-border`

**Spacing System (8px Grid):**
- Base unit: 4px
- Common: p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px), p-12 (48px), p-16 (64px)
- Semantic: `--spacing-element` (16px), `--spacing-component` (24px), `--spacing-section` (48px)

**Typography:**
- Font: Poppins (geometric, modern)
- Line heights: 8px multiples (16px, 24px, 32px, 40px, 48px)
- Body: 16px / 24px (text-base)
- WCAG AAA contrast: 16.5:1 ratio

**Component Sizing:**
- Checkbox: 16px (h-4 w-4) - Material Design 3
- Switch: 24px × 44px track (h-6 w-11) - Industry standard
- Buttons: Small 32px (h-8), Default 40px (h-9), Large 44px (h-10)
- Icons: 12px (h-3), 16px (h-4), 20px (h-5), 24px (h-6)
- Touch Targets: 44px minimum via parent container
- `.dense` class: Overrides 44px for intentionally compact UIs

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px - 1920px
- Ultra-wide: > 1920px (max-w-[1920px] centered)

## Data Models

See full TypeScript interfaces in:
- `types/database.types.ts` - Generated Supabase types
- `components/types/sizing-journal-entry.ts` - Main SizingJournalEntry interface
- `types/ItemStatus.ts` - Const enum (OWNED, WISHLISTED) with helpers
- `types/SizeType.ts` - Const enum (US, EU, UK, JP, KR, CM, ONE_SIZE)

**Key Types:**
```typescript
// Item Status
type ItemStatus = 'owned' | 'wishlisted'
type ArchiveReason = 'sold' | 'donated' | 'worn_out' | 'other'

// Categories
type ItemCategory = 'sneakers' | 'tops' | 'bottoms' | 'outerwear' | 'accessories' | 'bags' | 'hats' | 'other'

// Size Systems
type SizeType = 'US' | 'EU' | 'UK' | 'JP' | 'KR' | 'CM' | 'ONE_SIZE'
```

## Key Implementation Details

### View Modes (Dashboard Tabs)
1. **Owned** (`status === 'owned'`): Collection with wear tracking
2. **Want to Buy** (`status === 'wishlisted'`): Price monitoring and try-on notes
3. **Outfits** (`outfit_items`): Outfit combinations with visual layout
4. **Archive** (`is_archived === true`): Soft-deleted items

### Cost Per Wear Calculation
**Formula:** `(purchase_price || retail_price) ÷ wears`
**Targets:** Budget (<$50): $2/wear, Mid ($50-$150): $5/wear, Premium ($150+): $10/wear
**Location:** `lib/wardrobe-item-utils.ts` → `calculateWorthItMetrics()`

### Add/Edit Item Form (Modular Architecture)
**Location:** `components/add-item-form/`
**Main files:**
- `AddItemForm.tsx` - Orchestrator (489 lines)
- `useFormLogic.ts` - Business logic hook with Zod validation
- Section components: BasicInfoSection, PricingSection, SizingSection, PhotoSection, ProductURLSection, NotesSection, FormActions
- Utilities: `lib/wardrobe-item-display-logic.ts`, `lib/wardrobe-item-validators.ts`

**Key Features:**
- Color field required in Quick mode
- Smart target price suggestions (tiered: 80%/70%/60%)
- Sale Price in Quick and Advanced modes
- URL auto-fill with scraping
- Duplicate detection integration
- Validation with clear error messages

## Styling Guidelines

### Component Patterns

```tsx
// ✅ GOOD: Use semantic tokens
<div className="bg-background text-foreground">
<Card className="bg-card border-border">

// ✅ GOOD: 8px grid alignment
<div className="p-6">          // Component padding (24px)
<section className="space-y-12"> // Section spacing (48px)

// ✅ GOOD: .dense for compact UIs
<div className="dense relative">
  <Checkbox className="h-4 w-4" />
</div>

// ✅ GOOD: Motion-safe animations
<div className="motion-safe:transition-transform motion-safe:duration-150">
```

**When to use `.dense`:**
- Photo carousels, filter sidebars, navbar elements, drawer controls

**When NOT to use `.dense`:**
- Primary CTAs, form submissions, delete buttons in main content

## Performance Optimizations

- **Image Handling**: Next.js Image with lazy loading, Cloudinary CDN
- **Code Splitting**: Dynamic imports, Suspense boundaries, route-based splitting
- **Caching**: In-memory cache (product-cache.ts), localStorage (filters, view density), Supabase query caching

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BROWSERLESS_API_KEY=your-browserless-key  # Optional
```

## Common Tasks

### Adding a New Item Category
1. Update `components/types/item-category.ts` → `CATEGORY_CONFIGS`
2. Add category label, icon, and size type
3. Update filters UI
4. No database migration needed (categories stored as strings)

### Adding a New View Mode
1. Add new `status` type to `SizingJournalEntry` interface
2. Update `app/dashboard/page.tsx` → Add new tab
3. Update filter logic in `sizing-journal-dashboard.tsx`

### Modifying Cost Per Wear Thresholds
Edit `lib/wardrobe-item-utils.ts` → `calculateWorthItMetrics()`:
```typescript
const targetWears =
  price < 50 ? 25 :    // Budget: $2/wear
  price < 150 ? 30 :   // Mid: $5/wear
  50;                  // Premium: $10/wear
```

## Testing

```bash
npx tsc --noEmit           # TypeScript type checking
npm run db:types           # Generate types from Supabase
npm run build              # Build verification
```

## Important Notes for AI Assistants

1. **DO NOT** remove or modify existing features without explicit user request
2. **DO** preserve all current logic when making UI/styling changes
3. **DO** use semantic design tokens (bg-background, text-foreground, etc.)
4. **DO** maintain 8px grid spacing alignment
5. **DO** follow industry-standard component sizing (16px checkboxes, 24×44px switches)
6. **DO** wrap animations with `motion-safe:` variant for accessibility
7. **DO** use `.dense` class only for intentionally compact UIs
8. **DO** verify TypeScript compilation after changes
9. **DO NOT** hardcode colors - use CSS variables and Tailwind tokens
10. **DO NOT** break the 8px grid with odd spacing values (5px, 7px, 13px, etc.)

## Recent Updates

See `CHANGELOG.md` for detailed phase-by-phase history of migrations, refactors, and feature additions.

### Icon System Update (November 2025) ✅ COMPLETED
Replaced emoji icons with Lucide icons in WardrobeStatsWidget and AchievementsPreview for better accessibility and visual consistency.

**Changes Made:**
- Replaced emoji icons with Lucide React icons (Trophy, Target, TrendingUp, Calendar, Star)
- Improved semantic clarity and accessibility
- Better cross-platform rendering consistency
- Consistent icon sizing and styling across components

**Files Modified:**
- `components/navbar/WardrobeStatsWidget.tsx`
- `components/navbar/AchievementsPreview.tsx`

### Notification Types Removal (November 2025) ✅ COMPLETED
Removed three unnecessary notification features to simplify the notification system and reduce user complexity.

**Status**: ✅ All code changes complete, migration created, ready for database migration

**Notification Types Removed:**
1. **Shopping Reminders** - "Gentle reminders to use what you have" notifications
2. **Cooling-Off Period** - Notifications when wishlist items finished cooling-off period
3. **Quiet Hours** - Timezone-aware notification scheduling feature

**Rationale**: These features added unnecessary complexity without providing significant user value. Core notification types (Price Alerts, Wear Reminders, Seasonal Tips, Cost-Per-Wear Milestones, Achievements) remain fully functional.

**Database Changes:**
- **Migration 051**: Drops 7 columns from `notification_preferences` table
  - Removed: `shopping_reminders_in_app`, `shopping_reminders_push`, `shopping_reminders_email`
  - Removed: `quiet_hours_enabled`, `quiet_hours_start`, `quiet_hours_end`, `user_timezone`
  - Note: `cooling_off_ready_*` columns already removed in Migration 049
- Marks existing `shopping_reminder` and `cooling_off_ready` notifications as read (preserves history)

**Code Changes (7 files modified):**
1. **`lib/notification-creator.ts`** (73 lines removed)
   - Removed `'shopping_reminder'` and `'cooling_off_ready'` from `NotificationType` union
   - Removed `isInQuietHours()` function (33 lines) and quiet hours checking logic
   - Removed preference mappings for deleted notification types

2. **`components/NotificationPreferences.tsx`** (165 lines removed)
   - Removed Shopping Reminders UI toggle and settings
   - Removed Cooling-Off Ready UI toggle and settings
   - Removed Quiet Hours UI section (toggle, time pickers, timezone display)
   - Removed unused imports: `ShoppingBag`, `Unlock`, `Clock` from lucide-react

3. **`components/notification-center/NotificationCard.tsx`** (2 lines removed)
   - Removed icon mappings for `shopping_reminder` and `cooling_off_ready`

4. **`components/notification-center/NotificationCenter.tsx`** (3 lines removed)
   - Removed "Cooling-Off" filter button from notification type filters

5. **`app/api/user-preferences/route.ts`** (4 lines removed)
   - Removed quiet hours default values from POST endpoint initialization

6. **`types/database.types.ts`** (Auto-regenerated)
   - Will automatically update after migration 051 is applied

7. **`supabase/migrations/051_remove_notification_types.sql`** (New file created)
   - Transaction-safe migration with BEGIN/COMMIT
   - Marks old notifications as read before dropping columns

**Total Lines Removed**: ~250 lines across 7 files

**Remaining Notification Types** (6 active):
1. `price_alert` - Price drop notifications for wishlist items
2. `wear_reminder` - Reminders to wear underutilized items
3. `seasonal_tip` - Seasonal wardrobe suggestions
4. `achievement_unlock` - Gamification achievements
5. `outfit_suggestion` - Outfit composition suggestions
6. `cost_per_wear_milestone` - Cost-per-wear goal celebrations

### Codebase Cleanup - Unused Code Removal (November 2025) ✅ COMPLETED
Comprehensive audit and removal of unused components, utilities, and debug endpoints to reduce codebase complexity and improve maintainability.

**Status**: ✅ All unused files identified and removed, no breaking changes

**Files Removed (8 total):**

**Components (4 files):**
1. **`components/AddItemForm.tsx`** (1,414 lines) - Old monolithic form component
   - Superseded by modular architecture in `components/add-item-form/AddItemForm.tsx` (492 lines)
   - New version uses separated section components (BasicInfoSection, PricingSection, SizingSection, etc.)
   - Improved maintainability and testability

2. **`components/AddProductFormWrapper.tsx`** (64 lines) - Thin wrapper component
   - Only imported the old AddItemForm.tsx
   - No longer needed with modular form architecture

3. **`components/CollectionGrid.tsx`** (66 lines) - Grid layout component
   - Not imported anywhere in the codebase
   - Functionality replaced by WardrobeDashboard's built-in grid layout

4. **`components/ProductUrlParser.tsx`** (355 lines) - Standalone URL parser
   - Product parsing functionality integrated into AddItemForm's ProductURLSection
   - Duplicate functionality, not referenced

**Utilities (1 file):**
5. **`lib/wardrobe-duplication-detector.ts`** (176 lines) - Basic duplicate detection
   - Superseded by `lib/smart-duplicate-detector.ts` with advanced fuzzy matching
   - New version uses weighted scoring (Category 40%, Color 30%, Brand 20%, Model 10%)
   - New version has <200ms performance for 1000+ items

**API Debug Endpoints (3 routes):**
6. **`app/api/notifications-debug/route.ts`** (55 lines) - Debug endpoint for notification count
7. **`app/api/notifications-full-debug/route.ts`** (111 lines) - Full debug with query logs
8. **`app/api/notifications-direct/route.ts`** (52 lines) - Direct notification creation for testing

**Impact:**
- **Total lines removed**: ~2,293 lines of unused code
- **Components cleaned up**: 4 unused components removed
- **API surface reduced**: 3 debug endpoints removed (cleaner production API)
- **Improved maintainability**: Single source of truth for duplicate detection and form management
- **No functionality lost**: All features preserved in newer implementations

**Verification:**
- Comprehensive import analysis across entire codebase
- No references found to removed files (except self-references)
- TypeScript compilation verified (no new errors introduced)

**Current Active Components:**
- Add/Edit Form: `components/add-item-form/` (modular architecture with 9 files)
- Duplicate Detection: `lib/smart-duplicate-detector.ts` (fuzzy matching with fastest-levenshtein)
- Main Notification API: `app/api/notifications/route.ts` (production endpoint)

**Latest Status:**
- ✅ Phase 1-6 refactoring complete (foundation cleanup, outfit studio, component modularization, type system)
- ✅ Smart duplicate detection with fuzzy matching
- ✅ Icon system update with Lucide icons
- ✅ Notification system simplified (3 types removed)
- ✅ Codebase cleanup complete (8 unused files removed, ~2,293 lines of code removed)
- ✅ Add/Edit form UX improvements (color required, smart target price, sale price in Quick mode)
- ✅ Database: `items` table (renamed from `sneakers`)
- ✅ Status types: `owned` | `wishlisted` (removed `journaled`)
- ✅ All components meet WCAG AAA standards

## Related Documentation

- Design System: `app/globals.css` (lines 1-700)
- Component Library: https://ui.shadcn.com
- Tailwind v4: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs
- Next.js App Router: https://nextjs.org/docs/app
