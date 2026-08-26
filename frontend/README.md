# Exclusive — Midnight Showroom

**Exclusive** is a modern e-commerce storefront UI built as a from-scratch rebuild of a legacy Ant Design app. The interface is a dark "Midnight Showroom" aesthetic: a cool, blue-tinted midnight base palette, a single warm **gold** signature accent, and **red** reserved strictly for sale and urgency (price drops, countdowns, out-of-stock). Typography pairs **Satoshi** (self-hosted variable, for display/headings) with **Inter** (for body). Every screen, primitive, and interaction was rebuilt with Tailwind CSS v4 and class-variance-authority — no component library. Cart and wishlist persist to `localStorage`, and all flows (filters, sort, pagination, search, cart math, coupon validation) are fully functional against in-memory mock data.

> Phase A (this frontend UI overhaul) is complete. Phase B (Node/Express/MongoDB backend) and Phase C (frontend↔backend integration with RTK Query, real auth and checkout) are separate upcoming phases.

## Tech stack

- **React 19** + **Vite 8** (Rolldown-powered)
- **Tailwind CSS v4** (CSS-first `@theme` tokens via `@tailwindcss/vite`)
- **Redux Toolkit 2** + **react-redux** (feature-folder slices, `localStorage` persistence)
- **react-router-dom 7**
- **class-variance-authority** + **clsx** + **tailwind-merge** (`cn()` helper)
- **@radix-ui/react-slot** (for the polymorphic `Button asChild`)
- **lucide-react** (icons)
- **react-hot-toast**
- **@fontsource/inter** (self-hosted Satoshi woff2 in `src/assets/fonts/`)
- **Vitest 4** (logic tests, node environment — no DOM)

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the Vite dev server (HMR)      |
| `npm run build`       | Production build to `dist/`          |
| `npm run preview`     | Preview the production build locally |
| `npm run lint`        | Run ESLint                           |
| `npm test`            | Run the Vitest suite once            |
| `npm run test:watch`  | Run tests in watch mode              |

## Folder structure

```
frontend/
├── src/
│   ├── app/                  # App shell: store, providers, router
│   │   ├── store.js          #   Redux store + localStorage persistence
│   │   ├── providers.jsx     #   Redux -> Router -> Toaster
│   │   └── router.jsx        #   Route table (MainLayout + 13 routes)
│   ├── components/
│   │   ├── ui/               # Design-system primitives (CVA, barrel index.js)
│   │   ├── layout/           # Navbar, Footer, MainLayout, mobile drawers
│   │   ├── product/          # ProductCard, ProductGrid, gallery, etc.
│   │   ├── home/             # HeroSection, FlashSales, category rails
│   │   └── about/            # About-page sections
│   ├── features/             # Feature folders (Redux)
│   │   ├── cart/             #   cartSlice + cart-drawer component
│   │   ├── wishlist/         #   wishlistSlice
│   │   ├── ui/               #   uiSlice (drawers, mobile nav)
│   │   ├── auth/             #   authSlice (mock user)
│   │   └── shop/             #   selectors (filter/sort/paginate)
│   ├── screens/              # Route-level screens (thin compositions)
│   ├── data/                 # Mock data (products, categories, coupons, reviews)
│   ├── lib/                  # cn(), formatters, constants
│   ├── hooks/                # useCountdown, useMediaQuery, useDebounce, useProducts…
│   ├── assets/fonts/         # Self-hosted Satoshi woff2
│   ├── main.jsx              # Entry point
│   └── index.css             # Midnight Showroom tokens (@theme)
├── tests/                    # Vitest — lib/, features/, data/
├── vitest.config.js
└── package.json
```

## Roadmap

- **Phase A — Frontend UI overhaul (this repository, complete):** Rebuilt the storefront from scratch as a distinctive dark "Midnight Showroom" UI with a Tailwind v4 token system, a full set of CVA design-system primitives, feature-folder Redux state with `localStorage` persistence, expanded mock data, and 13 fully-functional routes. Fully antd-free. Build, lint (0 errors), and tests (42 passing) all green.
- **Phase B — Backend (upcoming):** Node/Express/MongoDB API with real product, user, order, and auth endpoints.
- **Phase C — Integration (upcoming):** Connect this frontend to the backend via RTK Query, replacing mock data and `localStorage` with real auth, product feeds, cart sync, and checkout.
