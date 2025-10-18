# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server

## Architecture Overview

This is a Next.js 14+ application using the App Router with Supabase for backend services. The application appears to be a sneaker voting/tracking application with product price tracking functionality.

### Key Technologies
- **Next.js**: Latest version with App Router
- **Supabase**: Authentication and database
- **TypeScript**: Full TypeScript support
- **Tailwind CSS**: v4.x with custom configuration
- **Radix UI**: Component primitives for accessible UI
- **React Hook Form**: Form management with Zod validation
- **Shadcn/ui**: Component library (New York style)

### Project Structure
- `app/` - Next.js App Router pages and API routes
  - `types/` - TypeScript type definitions (e.g., `Sneaker.ts`)
  - `(login)/` - Authentication pages (login, signup)
  - `sneakers/` - Sneaker-related pages (create, edit)
  - `auth/callback/` - Supabase auth callback
- `components/` - Reusable React components
  - Uses shadcn/ui components with Radix UI primitives
  - Key components: `CreateEditForm.tsx`, `AuthButton.tsx`, `AddItemForm.tsx`
- `lib/` - Utility libraries and helpers
  - `utils.ts` - General utilities
  - `sneakerUtils.ts` - Sneaker-specific utilities
  - `calculation.ts` - Calculation logic
  - `getLocalBase64.ts` - Image processing utilities
- `utils/supabase/` - Supabase configuration and helpers
  - `client.ts` - Client-side Supabase instance
  - `server.ts` - Server-side Supabase instance
  - `middleware.ts` - Session management middleware

### Authentication & Database
- Uses Supabase for authentication and database
- Session management handled via middleware that updates sessions on requests
- Cookie-based authentication that works across the entire Next.js stack

### Styling & UI
- Tailwind CSS v4.x with custom configuration
- Uses CSS variables for theming with dark mode support
- Shadcn/ui components configured with "new-york" style
- Component aliases configured: `@/components`, `@/lib`, `@/utils`

### Image Handling
- Next.js Image component configured for external domains:
  - `images.soleretriever.com`
  - `images.unsplash.com`
- Custom webpack configuration for server-side image processing

### Environment Setup
- Requires Supabase project URL and anon key in `.env.local`
- Project configured for Supabase integration

## Database Migrations

### Fit Rating Removal (Migration 007)
The `fit_rating` feature has been deprecated from the application. All UI components, type definitions, and analytics have been updated to use `comfort_rating` instead.

**Status**: Code refactoring complete and tested ✅

**Ready to apply**: Migration `007_drop_fit_rating_column.sql` will drop the `fit_rating` column from the sneakers table.

**Migration Command** (when ready to apply):
```sql
ALTER TABLE sneakers DROP COLUMN IF EXISTS fit_rating;
COMMENT ON TABLE sneakers IS 'Sneaker tracking table - fit_rating column removed on [date]';
```

**Changes made**:
- Removed `fit_rating` from `SizingJournalEntry` type definition
- Removed `FIT_RATINGS` array and `FitRating` interface
- Removed fit display from `sizing-journal-entry-card.tsx`
- Removed `FitProfileDashboard` component from dashboard and tracker app
- Updated `sizing-journal-stats.tsx` to remove "Perfect Fits" metric
- Updated sort utility to use `comfort-rating` instead of `fit-rating`
- Removed unused `FitData` import from `add-item-form.tsx`

**Files affected**:
- components/sizing-journal-entry-card.tsx
- components/sizing-journal-stats.tsx
- components/types/sizing-journal-entry.ts
- components/add-item-form.tsx
- components/sneaker-tracker-app.tsx
- app/dashboard/page.tsx
- lib/sizing-journal-utils.ts

**Bundle improvements**: Dashboard component reduced from 9.84 kB to 4.96 kB (49% reduction)

## Data Models

### Sneaker Type
```typescript
type Sneaker = {
  id: number;
  name: string;
  style: string;
  release_date: Date;
  price: number;
  main_image: string;
  brand_id: string;
  images: Array<{
    image_link: string;
    sneaker_id: string;
    main_image: boolean;
  }>;
}
```