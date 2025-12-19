# PurrView

**Your wardrobe deserves better than a messy closet.**

PurrView is a modern wardrobe management app that helps you catalog your clothing, track what you actually wear, and make smarter purchasing decisions. Built for people who love fashion but hate clutter.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js" alt="Next.js 15+">
  <img src="https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
</p>

---

## What It Does

### Wardrobe Management
Catalog everything from sneakers to outerwear. Each item gets its own profile with photos, purchase info, sizing notes, and wear tracking. Filter by category, brand, color, or status. Search instantly. Never forget what you own.

### Cost Per Wear Tracking
Finally answer the question: "Was this worth it?" Track how often you wear each item and watch your cost-per-wear drop. The app calculates smart targets based on price tier (budget items hit $2/wear, premium pieces aim for $10/wear).

### Outfit Studio
Compose outfits on a visual canvas, arrange items with drag-and-drop, and save your favorite combinations. Track which outfits you've worn and get inspired by what you already own.

### Smart Duplicate Detection
Before you buy the same white sneakers for the third time, PurrView warns you. Intelligent fuzzy matching catches duplicates and similar items based on category, color, brand, and model.

### Price Monitoring
Wishlist items get automatic weekly price checks across major retailers. Drop alerts notify you when it's time to buy. Stop refreshing product pages manually.

### Multi-Photo Support
Up to 5 photos per item with drag-and-drop reordering. Show different angles, close-ups, or wear photos. All images are optimized and delivered via Cloudinary CDN.

---

## Tech Stack

**Frontend**
- Next.js 15+ (App Router, React Server Components)
- TypeScript (strict mode)
- Tailwind CSS v4 (8px grid design system)
- Radix UI (accessible primitives)
- Shadcn/ui (New York style)
- Framer Motion (animations)
- React Hook Form + Zod (form validation)

**Backend**
- Supabase (PostgreSQL + Auth + Row Level Security)
- Cloudinary (image hosting & optimization)
- Browserless (web scraping for price monitoring)

**Performance**
- Code splitting with dynamic imports
- Next.js Image optimization
- In-memory caching for product data
- Lazy loading with Suspense boundaries

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account ([create one here](https://database.new))
- Cloudinary account ([sign up here](https://cloudinary.com/users/register/free))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/purrview.git
   cd purrview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Rename `.env.local.example` to `.env.local` and add your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   BROWSERLESS_API_KEY=your-browserless-key  # Optional
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   npm run db:verify
   ```

5. **Generate TypeScript types**
   ```bash
   npm run db:types
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
purrview/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main wardrobe dashboard
│   ├── outfits/           # Outfit studio
│   └── api/               # API routes (price monitoring, notifications)
├── components/
│   ├── add-item-form/     # Modular form (8 section components)
│   ├── wardrobe-item-card/ # Item display components
│   ├── outfit-studio/     # Outfit creation UI
│   └── ui/                # Shadcn/ui components
├── lib/
│   ├── smart-duplicate-detector.ts  # Fuzzy matching logic
│   ├── wardrobe-item-utils.ts       # Cost-per-wear calculations
│   ├── cloudinary.ts                # Image upload helpers
│   └── product-scraper.ts           # Price monitoring
├── types/                 # TypeScript definitions
├── utils/supabase/        # Supabase client instances
└── supabase/
    └── migrations/        # Database migrations
```

---

## Key Features in Detail

### Dashboard Views
- **Owned**: Your full collection with wear tracking
- **Want to Buy**: Wishlist items with price monitoring
- **Outfits**: Saved outfit combinations
- **Archive**: Items you've sold, donated, or retired

### Size & Comfort Tracking
Record try-on dates, size preferences, and comfort ratings (1-5 scale). Support for US, EU, UK, JP, KR, CM, and ONE_SIZE systems. Store preferred sizes per brand.

### Archive Management
Soft delete items with reasons (sold, donated, worn out, other). Archived items stay in your history but don't clutter your active wardrobe.

### Responsive Design
Built mobile-first with breakpoints at 640px (tablet), 1024px (desktop), and 1920px (ultra-wide). Compact density mode for power users.

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run clean        # Clear Next.js cache
npm run db:types     # Generate types from Supabase schema
npm run db:setup     # Run database setup
npm run db:verify    # Verify migrations
```

---

## Design System

### Color Palette
- **Primary**: Sun 400 (#FFC700) - Brand yellow
- **Background**: Blaze 50 - Energetic page background
- **Semantic tokens**: `bg-background`, `text-foreground`, `bg-card`, `border-border`

### Spacing (8px Grid)
All spacing follows 8px increments: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-12` (48px), `p-16` (64px).

### Typography
- **Font**: Poppins (geometric, modern)
- **Base size**: 16px with 24px line height
- **Line heights**: 8px multiples for vertical rhythm
- **Contrast**: WCAG AAA compliant (16.5:1 ratio)

### Component Sizing
- Checkboxes: 16px (Material Design 3)
- Switches: 24px × 44px (Industry standard)
- Touch targets: 44px minimum for accessibility

---

## Database Schema

### Core Tables
- `items` - Wardrobe items (all categories)
- `item_photos` - Multi-photo support with ordering
- `brands` - Brand master list with logos
- `profiles` - User profile data
- `outfits` - Outfit combinations with visual layout
- `outfit_items` - Items within outfits (positioning, cropping)
- `price_monitors` - Price tracking for wishlist items
- `price_alerts` - Price drop notifications

### Row Level Security
All tables use RLS policies to ensure users only see their own data. No way to accidentally see someone else's wardrobe.

---

## Contributing

This is a personal project, but if you find bugs or have suggestions, feel free to open an issue.

---

## Performance

- **Bundle size**: ~102 kB first load (optimized)
- **Duplicate detection**: <200ms for 1000+ items
- **Image loading**: Lazy loading + Cloudinary optimization
- **Database queries**: Cached with Supabase query optimization

---

## License

MIT License - see LICENSE file for details.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - The React framework
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Shadcn/ui](https://ui.shadcn.com) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Cloudinary](https://cloudinary.com) - Image optimization
- [Radix UI](https://www.radix-ui.com) - Accessible component primitives

---

**PurrView** - Because your wardrobe deserves better.
