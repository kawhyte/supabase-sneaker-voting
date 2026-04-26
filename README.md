# PurrView 👟

> **Track every pair, calculate real value, and know exactly when to cop.**

PurrView is a sneaker-exclusive inventory, financial intelligence, and social discovery platform. Designed for sneakerheads who want to treat their collection like a dynamic portfolio, PurrView goes beyond simple logging by introducing advanced Cost Per Wear (CPW) metrics, automated price scraping, and a community-driven discovery engine.

---

## 🎯 Core Product Vision & Specs

PurrView focuses exclusively on sneakers. The platform is designed to answer three fundamental questions for collectors:
1. What do I own and what is it actually worth right now?
2. Am I getting a good Return on Investment (ROI) based on how often I wear them?
3. What is the community wearing, and when does my wishlist hit my target price?

### 1. Sneaker Inventory Hub
* **Frictionless Onboarding:** Add sneakers via intelligent search, direct URL parsing from supported retailers, or bulk spreadsheet import.
* **Visual Fidelity:** Optimized image galleries utilizing Cloudinary with proxy support and automatic background standardization.
* **Detailed Metadata:** Track sizes, condition, purchase price, target price, and brand categorization.

### 2. Financial Intelligence & Cost Per Wear (CPW)
* **Advanced CPW Engine:** Log wear frequencies to calculate real-time Cost Per Wear. Watch a sneaker's "value" optimize as it transitions from a liability to an asset.
* **Automated Price Monitoring:** Edge functions and background cron jobs scrape retailer data to monitor price drops on wishlisted items.
* **ROI Dashboards:** Visual charts mapping spending trends, average CPW by category, and total saved vs. retail value.

### 3. Gamification & Achievements
* **Dynamic Milestones:** Earn badges and unlock achievements based on wear streaks, collection milestones, and financial savvy.
* **Collection Insights:** Auto-generated lists for "Top Worn," "Least Worn," and "Best Value" to help users make informed decisions about selling or rotating pairs.
* **Fun Facts:** AI-generated quirky insights about individual wearing habits and collection gaps.

### 4. Social & Discovery Engine
* **Public Profiles & Collections:** Opt-in to share sneaker rotations and wishlists publicly. 
* **Community Graph:** Follow other collectors, view their stats, and get inspired by their rotations.
* **Explore Grid:** Discover trending sneakers, popular brands, and new users within the PurrView ecosystem. 
* **Social Wishlist Sharing:** Seamlessly share target pairs with the community.

### 5. Progressive Web App (PWA) & Notifications
* **Native App Feel:** Fully installable PWA with offline caching and background sync capabilities.
* **Smart Push Notifications:** Real-time alerts for price drops hitting target thresholds, seasonal rotation reminders, and wear suggestions for neglected pairs.

---

## 🛠 Technical Architecture

### Frontend Stack
* **Framework:** Next.js 15 (App Router) with React 18.
* **Styling:** Tailwind CSS v4 + PostCSS. 
* **UI Primitives:** Radix UI components (Headless, accessible).
* **State Management & Data Fetching:** React Query, React Hook Form + Zod, and native Server Actions.
* **Animations & Interactions:** Framer Motion, DnD Kit (drag and drop), and Canvas Confetti for milestone celebrations.
* **Visuals:** Recharts and Chart.js for financial data visualization.

### Design System (v2.0)
PurrView utilizes a high-contrast, neo-brutalist inspired aesthetic optimized for product clarity:
* **Background:** Energetic off-white (`blaze-50`) to provide excellent readability and make white product cards pop.
* **Accents:** Vibrant `sun-400` (#FFC700) primary brand color for CTAs and prominent top-borders, paired with `terracotta-400` secondary accents.
* **Spacing:** Strict 8px baseline grid for perfect vertical rhythm.

### Backend Stack (Supabase Ecosystem)
* **Database:** PostgreSQL with Row Level Security (RLS) ensuring strict privacy between public and private collection items.
* **Authentication:** Supabase Auth handling secure logins and social profiles.
* **Edge Functions:** Serverless TypeScript functions managing price scraping (`check-prices`), product parsing (`parse-product`), and notification generation.
* **Cron Jobs:** Automated database triggers running via `pg_cron` for price-checking schedules and stale notification cleanup.

---

## 🚀 Recent Roadmap Implementations

* **Refined Scope:** Complete architectural shift to a sneaker-only platform, removing generic wardrobe and outfit planning overhead to focus entirely on footwear intelligence.
* **Smart Duplicate Detection:** Advanced database logic to prevent redundant entries when importing or adding highly similar sneaker models.
* **Notification Overhaul:** Migration from basic price alerts to a comprehensive, unified notification center handling social follows, price drops, and system alerts.
* **Advanced Social Wishlists:** Robust public/private toggles allowing users to expose their target sneakers to followers without revealing their personal purchase data.