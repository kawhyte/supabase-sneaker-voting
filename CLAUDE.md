# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PurrView** is a modern wardrobe management and price tracking application built with Next.js 15+ and Supabase. The app helps users catalog their clothing items, track wear statistics, calculate cost-per-wear metrics, and monitor prices for wishlist items.

### Core Features
- **Wardrobe Management**: Track owned items, wishlist, journal (try-on notes), and archived items
- **Cost Per Wear Tracking**: Monitor how well items justify their purchase price through wear statistics
- **Price Monitoring**: Watch wishlist items and get notified when prices drop
- **Photo Management**: Multi-photo upload with drag-and-drop ordering, Cloudinary integration
- **Size & Comfort Tracking**: Record sizing information and comfort ratings for future reference
- **View Modes**: Dashboard tabs for Owned, Want to Buy, and Archive views
- **Brand Integration**: Brand logos and master brand list for visual recognition

## Development Commands

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run clean` - Clear Next.js cache
- `npm run dev:clean` - Clear cache and start dev server
- `npm run db:types` - Generate TypeScript types from Supabase schema
- `npm run db:setup` - Run database setup script
- `npm run db:verify` - Verify database migrations

## Architecture Overview

### Key Technologies
- **Next.js**: v15+ with App Router (React Server Components)
- **Supabase**: Authentication, PostgreSQL database, Row Level Security (RLS)
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: v4.x with custom 8px grid design system
- **Radix UI**: Accessible component primitives (Checkbox, Switch, Dialog, etc.)
- **React Hook Form**: Form management with Zod validation
- **Shadcn/ui**: Component library (New York style)
- **Framer Motion**: Smooth animations and micro-interactions
- **Embla Carousel**: Photo carousel with keyboard navigation
- **Cloudinary**: Image hosting and optimization
- **Lottie**: Animated illustrations (homepage hero)

### Project Structure

```
app/                           # Next.js App Router
  ├── (login)/                 # Auth pages (grouped route)
  │   ├── login/page.tsx
  │   └── signup/page.tsx
  ├── dashboard/page.tsx       # Main wardrobe dashboard (3 tabs)
  ├── collection/page.tsx      # Collection view (owned items)
  ├── archive/page.tsx         # Archived items view
  ├── add-new-item/page.tsx    # Add item form
  ├── profile/page.tsx         # User profile settings
  ├── auth/callback/           # Supabase auth callback
  ├── page.tsx                 # Homepage (hero with Lottie animation)
  ├── layout.tsx               # Root layout (navbar, footer, theming)
  └── globals.css              # Design system tokens

components/
  ├── wardrobe-item-card/      # Modular card components
  │   ├── WardrobeItemCard.tsx        # Main card orchestrator
  │   ├── ItemCardImage.tsx           # Photo carousel integration
  │   ├── ItemCardActions.tsx         # Dropdown menu (edit, archive, delete)
  │   ├── ItemPricingDisplay.tsx      # Price formatting and display
  │   ├── ItemSizeComfortWears.tsx    # Size/comfort/wear count badges
  │   ├── ItemStoreAndDate.tsx        # Store name and purchase date
  │   ├── ItemFooterBadges.tsx        # "View Cost Per Wear" button
  │   ├── WearStatsDrawer.tsx         # Side drawer for wear tracking
  │   └── CostPerWearProgress.tsx     # Progress bar and metrics
  ├── ui/                      # Shadcn/ui base components
  │   ├── button.tsx           # Button with size variants
  │   ├── checkbox.tsx         # 16px checkbox (Material Design)
  │   ├── switch.tsx           # 24px×44px switch (industry standard)
  │   ├── dialog.tsx           # Modal dialogs
  │   ├── sheet.tsx            # Side sheets/drawers
  │   ├── tooltip.tsx          # Contextual tooltips
  │   └── ...                  # 30+ UI primitives
  ├── add-item-form.tsx        # Main item creation form
  ├── multi-photo-upload.tsx   # Drag-and-drop photo uploader
  ├── photo-carousel.tsx       # Photo viewer with navigation
  ├── navbar-client.tsx        # Navigation bar (desktop pill + mobile menu)
  ├── sizing-journal-dashboard.tsx  # Dashboard state management
  ├── sizing-journal-filters-v2.tsx # Filter sidebar (category, brand, search)
  └── types/
      ├── sizing-journal-entry.ts   # Main data model
      └── item-category.ts          # Category configs

lib/
  ├── wardrobe-item-utils.ts   # Cost per wear calculations
  ├── sizing-journal-utils.ts  # Sort and filter utilities
  ├── item-utils.ts            # Item helper functions
  ├── cloudinary.ts            # Image upload/optimization
  ├── product-cache.ts         # Price scraping cache
  ├── notification-service.ts  # Price drop notifications
  ├── view-density-context.tsx # Compact/comfortable view toggle
  └── utils.ts                 # General utilities (cn, etc.)

utils/supabase/
  ├── client.ts                # Client-side Supabase instance
  ├── server.ts                # Server-side Supabase instance
  └── middleware.ts            # Session management middleware

types/
  └── database.types.ts        # Generated Supabase types
```

### Authentication & Database
- **Supabase Auth**: Email/password authentication with cookie-based sessions
- **Session Management**: Middleware automatically refreshes sessions on requests
- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Database Tables**:
  - `sneakers` (legacy name, now stores all wardrobe items)
  - `item_photos` (multi-photo support with ordering)
  - `brands` (brand master list with logos)
  - `profiles` (user profile data)

### Design System (Tailwind v4.x)

#### Color Palette
```css
/* Primary Colors */
--color-sun-200: #FFF7CC;      /* Light yellow for CTAs */
--color-sun-400: #FFC700;      /* Brand yellow (primary) */
--color-sun-600: #E6B300;      /* Dark yellow */

/* Neutrals */
--color-slate-900: #0F172A;    /* Text (foreground) */
--color-slate-600: #475569;    /* Muted text */
--color-stone-300: #D6D3D1;    /* Borders */
--color-white: #FFFFFF;        /* Cards/backgrounds */

/* Background */
--color-blaze-50: oklch(0.97 0.03 45);  /* Page background (energetic) */

/* Semantic Tokens (USE THESE) */
--color-foreground: var(--color-slate-900);
--color-background: var(--color-blaze-50);
--color-primary: var(--color-sun-400);
--color-card: var(--color-white);
--color-border: var(--color-stone-300);
```

#### Spacing System (Pure 8px Grid)
```css
/* Base unit: 4px (--spacing) */
/* All spacing follows 8px grid except micro UI (4px) */

--spacing-2: 8px;    /* p-2: Compact gaps */
--spacing-4: 16px;   /* p-4: Default element spacing ⭐ */
--spacing-6: 24px;   /* p-6: Card padding ⭐ */
--spacing-8: 32px;   /* p-8: Section separation ⭐ */
--spacing-12: 48px;  /* p-12: Major spacing ⭐ */
--spacing-16: 64px;  /* p-16: Page margins ⭐ */

/* Semantic tokens */
--spacing-element: 16px;       /* Default spacing */
--spacing-component: 24px;     /* Card/modal padding */
--spacing-section: 48px;       /* Between sections */
--spacing-page: 64px;          /* Page-level margins */
```

#### Typography (Perfect 8px Grid Vertical Rhythm)
- Font Family: **Poppins** (geometric, modern fintech aesthetic)
- All line heights are exact 8px multiples (16px, 24px, 32px, 40px, 48px)
- Body: 16px / 24px line-height (text-base)
- Headings: 600-700 weight (SemiBold-Bold)
- WCAG AAA contrast: 16.5:1 ratio (slate-900 on blaze-50)

#### Component Sizing Standards
Following Material Design 3, Apple HIG, and Microsoft Fluent guidelines:

```css
/* Form Controls */
Checkbox: 16px (h-4 w-4)
Switch: 24px × 44px track, 20px thumb (h-6 w-11)

/* Buttons */
Small: 32px height (h-8)
Default: 40px height (h-9)
Large: 44px height (h-10)

/* Icons */
Inline text-xs: 12px (h-3 w-3)
Inline text-sm/base: 16px (h-4 w-4)
Standalone: 20px (h-5 w-5)
Hero/feature: 24px+ (h-6 w-6+)

/* Touch Targets */
Minimum: 44px (via parent container, not direct sizing)
.dense class: Overrides 44px minimum for intentionally compact UIs
```

### Responsive Breakpoints
- Mobile (< 640px): Single column, hamburger menu
- Tablet (640px - 1024px): Grid layouts stable
- Desktop (1024px - 1920px): Full-width content
- Ultra-wide (> 1920px): max-w-[1920px] mx-auto (centered)

## Data Models

### SizingJournalEntry (Main Data Type)
```typescript
interface SizingJournalEntry {
  // Core Identity
  id: string
  user_id: string
  created_at: string

  // Item Details
  brand: string
  brand_id: number | null
  model: string
  color: string
  category: ItemCategory  // 'sneakers' | 'tops' | 'bottoms' | etc.
  size_type: SizeType     // 'US' | 'EU' | 'UK' | etc.
  size_tried: string | null

  // Try-On Experience
  comfort_rating?: number  // 1-5 scale
  has_been_tried: boolean
  try_on_date: string
  notes?: string
  store_name?: string

  // Pricing
  retail_price?: number
  sale_price?: number
  purchase_price?: number
  purchase_date?: string | null
  target_price?: number      // For wishlist items
  ideal_price?: number

  // Wear Tracking (Owned Items)
  wears?: number
  last_worn_date?: string | null

  // Status Management
  status: 'owned' | 'wishlisted' | 'journaled'
  is_archived?: boolean
  archive_reason?: ArchiveReason | null  // 'sold' | 'donated' | 'worn_out' | 'other'
  archived_at?: string | null

  // Images
  image_url?: string           // Legacy single image
  cloudinary_id?: string
  item_photos?: ItemPhoto[]    // New multi-photo support

  // Relations
  brands?: BrandData | null
  would_recommend: boolean | null
}

interface ItemPhoto {
  id: string
  image_url: string
  image_order: number
  is_main_image: boolean
}

interface BrandData {
  id: number
  name: string | null
  brand_logo: string | null
}

type ArchiveReason = 'sold' | 'donated' | 'worn_out' | 'other'
```

### ItemCategory
```typescript
type ItemCategory =
  | 'sneakers'
  | 'tops'
  | 'bottoms'
  | 'outerwear'
  | 'accessories'
  | 'bags'
  | 'hats'
  | 'other'

type SizeType = 'US' | 'EU' | 'UK' | 'JP' | 'KR' | 'CM' | 'ONE_SIZE'
```

## Key Features & Implementation

### View Modes (Dashboard Tabs)
1. **Owned** (`status === 'owned'`): Collection view with wear tracking
2. **Wishlist** (`status === 'wishlisted'`): Items to buy with price monitoring
3. **Journal** (`status === 'journaled'`): Try-on notes and sizing reference
4. **Archive** (`is_archived === true`): Sold/donated items

### Cost Per Wear Tracking
- **Formula**: `(purchase_price || retail_price) ÷ wears`
- **Target Calculation**: Dynamic based on price tier
  - Budget (< $50): $2/wear target
  - Mid-range ($50-$150): $5/wear target
  - Premium ($150+): $10/wear target
- **Progress Tracking**: Visual progress bar with milestone celebrations
- **Location**: `lib/wardrobe-item-utils.ts` → `calculateWorthItMetrics()`

### Photo Management
- **Multi-Photo Support**: Up to 5 photos per item (configurable)
- **Drag-and-Drop Reordering**: DnD Kit for intuitive sorting
- **Main Image Selection**: Flag one photo as primary
- **Cloudinary Integration**: Automatic optimization and CDN delivery
- **Compact UI**: 24px delete buttons, 12px badges (industry standard)
- **Location**: `components/multi-photo-upload.tsx`

### Filtering & Search
- **Category Filter**: Multi-select checkbox (all 8 categories)
- **Brand Filter**: Multi-select dropdown with brand logos
- **Search**: Real-time search across brand, model, color fields
- **Sort Options**: Newest, Oldest, By Fit Rating, By Brand
- **Persistence**: Filters saved to localStorage
- **Location**: `components/sizing-journal-filters-v2.tsx`

## Recent Updates & Migrations

### UI/UX Standardization (October 2024)
Comprehensive update to align all components with industry standards (Google Material Design, Apple HIG, Microsoft Fluent):

**Changes Made:**
1. **Switch Component**: 8px×16px → 24px×44px track (Material Design standard)
2. **Checkbox Component**: 12px → 16px box (Material Design 3)
3. **Photo Upload UI**: Compact badges (text-xs), 24px delete buttons, 16px icons
4. **Global .dense Class**: Applied to 12 locations for intentionally compact UIs
5. **Button Sizing**: Standardized to 32px/40px/44px hierarchy
6. **Icon Sizing**: Audited 59 files, standardized to 12px/16px/20px/24px
7. **Tooltip Contrast**: Fixed Cost Per Wear tooltip (white text on dark bg)

**Files Modified:** 11 total
- Core: `components/ui/switch.tsx`, `components/ui/checkbox.tsx`
- Photos: `components/multi-photo-upload.tsx`, `components/photo-carousel.tsx`
- Cards: `components/wardrobe-item-card/*` (4 files)
- Filters: `components/sizing-journal-filters*.tsx` (2 files)
- Nav: `components/navbar-client.tsx`
- Forms: `components/add-item-form.tsx`

**Accessibility Improvements:**
- All components meet WCAG AAA standards
- 44px touch targets via parent containers (mobile-friendly)
- Enhanced focus rings on all interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigation fully supported

### Fit Rating Removal (Migration 007) ✅ COMPLETED
The `fit_rating` feature has been deprecated. All UI components and analytics now use `comfort_rating` (1-5 scale) instead.

**Status**: Code refactoring complete and tested

**Ready to apply**: Migration `007_drop_fit_rating_column.sql` will drop the `fit_rating` column from the database.

**Changes made**:
- Removed `fit_rating` from `SizingJournalEntry` type definition
- Removed `FIT_RATINGS` array and `FitRating` interface
- Removed fit display from wardrobe item cards
- Removed `FitProfileDashboard` component from dashboard
- Updated sort utility to use `comfort-rating` instead of `fit-rating`

**Files affected**:
- `components/types/sizing-journal-entry.ts`
- `components/wardrobe-item-card/*`
- `app/dashboard/page.tsx`
- `lib/sizing-journal-utils.ts`

**Bundle improvements**: Dashboard component reduced from 9.84 kB to 4.96 kB (49% reduction)

### Phase 1: Foundation Cleanup (October 2025) ✅ COMPLETED
Consolidated and simplified the codebase for improved maintainability and clarity. All changes implement the PurrView Strategic Audit Phase 1 plan.

**Status**: ✅ Code cleanup complete, database migration created, TypeScript build passing

**Changes made**:
- **Deleted** `lib/size-analytics.ts` (348 lines) - Used deprecated `fit_rating` field
- **Deleted** `components/fit-profile-dashboard.tsx` - Unused UI component
- **Merged** Journal and Wishlist statuses - Consolidated 'journaled' into 'wishlisted' status
- **Created** Migration 013 (`013_merge_journal_into_wishlisted.sql`) - Auto-migrates all journaled items to wishlisted
- **Renamed** Dashboard tab from "Wishlist" → "Want to Buy" - Clearer user intent
- **Updated** TypeScript types - Removed 'journaled' status option (now: 'owned' | 'wishlisted' only)

**Files updated**:
- `components/types/sizing-journal-entry.ts` - Removed 'journaled' from status union type
- `app/dashboard/page.tsx` - Updated tab name and status array
- `components/wardrobe-dashboard.tsx` - Removed journaled checks and updated types
- `components/wardrobe-item-card/wardrobe-item-actions.tsx` - Simplified status logic
- `components/add-item-form.tsx` - Removed journaled from type casting
- `hooks/useItemDisplayLogic.ts` - Simplified wishlist check
- `app/archive/page.tsx` - Removed journaled from status array
- `CLAUDE.md` - Updated documentation

**Bundle improvements**: Removed ~19KB of unused code (size-analytics + fit-profile-dashboard)

**Database migration**:
```sql
-- Migration 013_merge_journal_into_wishlisted.sql
UPDATE sneakers SET status = 'wishlisted' WHERE status = 'journaled';
ALTER TABLE sneakers ADD CONSTRAINT sneakers_status_check CHECK (status IN ('owned', 'wishlisted'));
```

## Styling & UI Guidelines

### Component Patterns

#### Using Semantic Tokens
```tsx
// ✅ GOOD: Use semantic tokens
<div className="bg-background text-foreground">
<Card className="bg-card border-border">
<Button className="bg-primary text-primary-foreground">

// ❌ BAD: Hardcoded colors
<div className="bg-white text-black">
<Card className="bg-gray-50 border-gray-200">
```

#### Spacing Patterns
```tsx
// ✅ GOOD: Semantic spacing
<div className="p-6">          // Component padding (24px)
<section className="space-y-12"> // Section spacing (48px)

// ✅ GOOD: 8px grid alignment
<div className="gap-4">        // 16px
<div className="gap-8">        // 32px

// ❌ BAD: Off-grid spacing
<div className="gap-5">        // 20px - breaks rhythm
<div className="gap-7">        // 28px - not aligned
```

#### The `.dense` Class
Use `.dense` to override global 44px touch target minimums for intentionally compact UIs:

```tsx
// Photo carousel with tiny navigation arrows (16px)
<div className="dense relative">
  <Button size="icon" className="h-4 w-4">
    <ChevronLeft className="h-2 w-2" />
  </Button>
</div>

// Filter sidebar with compact checkboxes (16px)
<div className="dense space-y-3">
  <Checkbox className="h-4 w-4" />
</div>
```

**When to use `.dense`:**
- Photo carousels (compact navigation)
- Filter sidebars (many options)
- Navbar elements (space constraints)
- Drawer controls (focused UI)
- Photo upload overlays (minimize obstruction)

**When NOT to use `.dense`:**
- Primary CTAs (should be easy to tap)
- Form submissions (critical actions)
- Delete buttons in main content (avoid accidents)

### Animation Guidelines

```tsx
// ✅ GOOD: Motion-safe animations
<div className="motion-safe:transition-transform motion-safe:duration-150">

// ✅ GOOD: Framer Motion with reduced motion support
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// ❌ BAD: No motion-safe wrapper
<div className="transition-all duration-500">
```

## Performance Optimizations

### Image Handling
- **Next.js Image**: Automatic lazy loading, WebP conversion
- **Cloudinary**: CDN delivery, automatic format selection, responsive images
- **Configured Domains**:
  - `res.cloudinary.com` (Cloudinary CDN)
  - `images.unsplash.com` (placeholder images)

### Code Splitting
- Dynamic imports for Lottie animations (homepage)
- Suspense boundaries in dashboard tabs
- Route-based code splitting via App Router

### Caching Strategy
- `product-cache.ts`: In-memory cache for price scraping results
- localStorage: User filter preferences, view density settings
- Supabase: Database query caching via RLS policies

## Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Browserless (for price scraping)
BROWSERLESS_API_KEY=your-browserless-key
```

## Common Tasks

### Adding a New Item Category
1. Update `components/types/item-category.ts` → `CATEGORY_CONFIGS`
2. Add category label, icon, and size type
3. Update filters UI to include new category
4. No database migration needed (categories stored as strings)

### Adding a New View Mode
1. Add new `status` type to `SizingJournalEntry` interface
2. Update `app/dashboard/page.tsx` → Add new tab
3. Update filter logic in `sizing-journal-dashboard.tsx`
4. Add new icon from `lucide-react`

### Modifying Cost Per Wear Thresholds
Edit `lib/wardrobe-item-utils.ts` → `calculateWorthItMetrics()`:
```typescript
const targetWears =
  price < 50 ? 25 :    // Budget: $2/wear
  price < 150 ? 30 :   // Mid: $5/wear
  50;                  // Premium: $10/wear
```

## Testing

### TypeScript Type Checking
```bash
npx tsc --noEmit
```

### Database Type Generation
After schema changes in Supabase:
```bash
npm run db:types
```

### Build Verification
```bash
npm run build
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

## Related Documentation

- **Design System**: See `app/globals.css` (lines 1-700)
- **Component Library**: Shadcn/ui docs at https://ui.shadcn.com
- **Tailwind v4**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Next.js App Router**: https://nextjs.org/docs/app
