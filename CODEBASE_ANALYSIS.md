# SoleTracker Codebase Analysis

## Current File Organization

### Root Structure
```
supabase-sneaker-voting/
├── app/                    # Next.js App Router pages
│   ├── (login)/           # Authentication pages
│   │   ├── login/         # Login page variants
│   │   └── signup/        # Signup page
│   ├── api/               # API routes
│   │   └── track/         # Product tracking API
│   ├── auth/              # Supabase auth callback
│   ├── dashboard/         # Main dashboard page
│   ├── data/              # Data-related pages
│   ├── sneakers/          # Sneaker management
│   │   ├── create/        # Create sneaker pages
│   │   └── edit/[id]/     # Edit sneaker pages
│   ├── types/             # TypeScript type definitions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ui/                # shadcn/ui components
│   ├── tutorial/          # Tutorial components
│   ├── CreateEditForm.tsx # Main form component
│   ├── Header.tsx         # Navigation header
│   ├── AuthButton.tsx     # Authentication button
│   └── [various].tsx     # Other UI components
├── lib/                   # Utility libraries
│   ├── utils.ts           # General utilities
│   ├── sneakerUtils.ts    # Sneaker-specific utilities
│   ├── calculation.ts     # Calculation logic
│   └── getLocalBase64.ts  # Image processing
├── utils/supabase/        # Supabase configuration
│   ├── client.ts          # Browser client
│   ├── server.ts          # Server client
│   └── middleware.ts      # Session middleware
├── models/                # Data models
├── supabase/              # Supabase project files
└── public/                # Static assets
```

## Component Dependencies

### Core Authentication Flow
- `AuthButton.tsx` → uses `utils/supabase/client.ts`
- `app/(login)/login/page.tsx` → uses Supabase auth
- `app/(login)/signup/page.tsx` → uses Supabase auth
- `middleware.ts` → uses `utils/supabase/middleware.ts`

### Main Application Components
- `layout.tsx` → imports Header, Footer, ReactQueryClientProvider
- `CreateEditForm.tsx` → uses Supabase client, form validation with Zod
- `dashboard/page.tsx` → uses Supabase server client for data fetching
- `ProductCard.tsx` → referenced in dashboard for item display

### Data Flow
- Items stored in Supabase `items` table
- Store links tracked in `store_links` table with price history
- Authentication handled via Supabase Auth
- Real-time updates potentially available via Supabase subscriptions

## Hardcoded Data & Configurations

### Environment-dependent Values
- `app/layout.tsx:14` - `defaultUrl` falls back to `"http://localhost:3000"`
- All Supabase configurations use environment variables (properly configured)

### UI/Branding
- App title: "MTW Sneaker Collection" (in layout.tsx:18)
- App description: "MTW Sneaker Collection & Tracking" (in layout.tsx:19)
- Color scheme: Dark mode enabled by default in layout.tsx:30

### Database Schema References
- `items` table - main product tracking table
- `store_links` table - price tracking with `last_price` field
- Supabase Auth tables (built-in)

## Technology Stack

### Frontend
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS v4.x
- shadcn/ui components (Radix UI primitives)
- React Hook Form with Zod validation
- Lucide icons
- Sonner for toast notifications

### Backend & Database
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Supabase Real-time subscriptions
- Server-side rendering with Supabase SSR

### Build & Development
- Geist font family
- PostCSS
- Chart.js and Recharts for data visualization
- React Query for state management

## Current Status
✅ **No Firebase code detected** - Clean codebase
✅ **Supabase foundation exists** - Properly configured clients
✅ **TypeScript setup** - Full type safety
✅ **Modern React patterns** - Hooks, server components
✅ **Authentication flow** - Complete auth system
✅ **Database integration** - Working Supabase queries

## Key Components for Migration
- All Supabase integration is already in place
- Environment variables are properly configured
- No Firebase remnants to remove
- UI components are framework-agnostic
- Authentication system is functional