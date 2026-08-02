# Phase A — Frontend UI Overhaul (Design Spec)

- **Date:** 2026-08-02
- **Sub-project:** A of 3 (A: UI Overhaul → B: Backend → C: Integration)
- **Target app:** `frontend/` (React 19 + Vite 8 + Tailwind v4 + Redux Toolkit + react-router v7)
- **Status:** Draft (pending user approval)

---

## 1. Purpose & Scope

### In scope (this phase)
Rebuild the storefront UI from scratch as a clean, consistent, responsive, fully-functional-against-mock-data e-commerce frontend, with a reusable design-system component layer and modern (≤2 years old) best practices.

- Replace **all** Ant Design usage with from-scratch Tailwind v4 components.
- Establish a layered design-token system in `@theme` (CSS-first).
- Rebuild every screen to be responsive, accessible, and genuinely functional.
- Expand mock data so every interaction works against it (filters, search, sort, pagination, cart, wishlist, coupon, checkout flow).
- Fix real defects (cart/wishlist reset on refresh → localStorage persistence; duplicate `WishlistCard`; unused `AddToCartButton`; dead `App.css`; vestigial `context/` folder; etc.).
- Reorganize into a feature-based folder structure.

### Out of scope (deferred to later phases)
- Real backend, real auth/checkout persistence, real email/payment. (Phase B/C)
- RTK Query / live API wiring. (Phase C — but the data layer is shaped to make this trivial.)
- A real admin dashboard. The current demo `AdminScreen` is **removed** in this phase; a real one is built in Phase B/C.

### Non-goals
- Renaming the brand ("Exclusive" stays).
- Changing the tech stack (still React + Tailwind + Redux + react-router).

---

## 2. Design Direction (decided)

**Aesthetic: Dark + High Contrast, editorial commerce.**

Dark-dominant surfaces (near-black ink, dark-zinc card/section backgrounds) with a vivid red accent for CTAs, badges, prices, and active states. Selective light panels where readability of dense data matters (product detail body, checkout form panels) so the page isn't exhausting to read. Drama comes from contrast, not clutter.

Rationale: you explicitly rejected indigo and asked for dark contrasty colors. Dark + red-on-near-black is maximum WCAG contrast, reuses the brand's red DNA, and signals commerce urgency (deals, sale). This is the Nike / Nothing.tech / modern-launch tier.

### Accent fallback noted
If the red-on-dark ever reads too "old retail," an electric lime (`#A3E635`) was offered as a 2026/techy alternative; not chosen unless you say so.

---

## 3. Design Tokens (Tailwind v4 CSS-first, layered)

Per 2026 guidance: tokens live in `src/index.css` `@theme` as native CSS variables, layered **primitive → semantic → component**, with arbitrary values minimized to protect system integrity.

### Primitive (raw values, rarely used directly)
```
--color-ink:        #0A0A0B   (near-black, text + dark sections)
--color-ink-soft:   #18181B   (zinc-900, raised dark surfaces)
--color-ink-muted:  #27272A   (zinc-800, borders/dividers on dark)
--color-paper:      #FAFAFA   (light panel, used sparingly)
--color-paper-soft: #F4F4F5   (zinc-100)
--color-line:       #E4E4E7   (zinc-200, borders on light)
--color-line-soft:  #D4D4D8   (zinc-300)

--color-accent:     #FF4D4D   (primary accent / red)
--color-accent-hover:#E63B3B
--color-accent-soft:#FFD4D4   (tints/badges)
--color-accent-ink: #2A0606   (accent-on-dark contrast text)

--color-success:    #22C55E
--color-warning:    #F59E0B
--color-error:      #EF4444
--color-rating:     #F5A524

--color-content:    #FAFAFA   (default text color on dark bg)
--color-content-sub:#A1A1AA   (zinc-400, secondary text)
--color-content-mut:#71717A   (zinc-500, muted text)
```

### Semantic (purpose-based — what components consume)
```
--color-bg:           var(--color-ink)        /* page background */
--color-surface:      var(--color-ink-soft)   /* cards, panels */
--color-surface-2:    var(--color-ink-muted)  /* inputs, raised */
--color-border:       var(--color-ink-muted)
--color-text:         var(--color-content)
--color-text-muted:   var(--color-content-sub)
--color-text-subtle:  var(--color-content-mut)
--color-primary:      var(--color-accent)
--color-primary-hover:var(--color-accent-hover)
--color-focus:        var(--color-accent)
--color-ring:         var(--color-accent)
```

### Radii, typography, spacing, shadows, motion
```
--radius-sm: 6px   --radius-md: 10px   --radius-lg: 16px   --radius-full: 9999px
--font-sans: "Inter Variable", system-ui, sans-serif
--shadow-card:    0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)
--shadow-pop:     0 8px 32px rgba(0,0,0,.55)
--ease-out:       cubic-bezier(.16,1,.3,1)
--dur-fast:140ms --dur-base:200ms --dur-slow:300ms
```

Dark mode is the default; a light "panel" utility (`.surface-paper`) is used inside detail/checkout for readable forms.

---

## 4. Typography

- **Inter only** (variable, self-hosted — already installed via `@fontsource-variable/inter`; if the installed package is non-variable `@fontsource/inter`, standard weights 400/500/600/700/800 are used). Single typeface used well > two mediocre ones.
- **Drop Poppins** (overused, slightly dated, redundant payload).
- Display scale via Tailwind fluid utilities: tight tracking (`tracking-tight`) on headings, heavy weights for hero. No fractional/unusual font-size utilities.

---

## 5. Component Architecture (from scratch, zero Ant Design)

**Pattern:** `class-variance-authority` (CVA) + `clsx` + `tailwind-merge` behind a `cn()` helper — the de-facto 2026 standard for variant components. Complex primitives use **compound components** (Context-based) for flexible composition.

New deps to add: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot` (for polymorphic `asChild` Button/Link). `lucide-react` stays for icons.

### Design-system primitives (`src/components/ui/`)
Each gets its own file + a typed variants config:

| Primitive | Notes |
|---|---|
| `Button` | variants: primary/secondary/outline/ghost/link/destructive; sizes sm/md/lg/icon; `loading`; polymorphic via `asChild` (renders as `<Link>`) |
| `Input` / `Textarea` / `Label` | label + hint + error slots, focus ring |
| `Select` | accessible custom (keyboard nav, listbox), dark themed |
| `Checkbox` / `RadioGroup` (+ item) | label + error slots, accessible |
| `Switch` | toggle (filters) |
| `Badge` | solid/soft/outline tones; used for NEW, sale %, stock, tags |
| `Avatar` / `Separator` / `Skeleton` / `Spinner` | utility |
| `Rating` | accessible stars, half-star, read-only + interactive |
| `Tabs` / `Accordion` / `Dialog` / `Drawer`(Sheet) / `Tooltip` | compound components, animated, focus-trapped |
| `Breadcrumb` / `Pagination` / `Container` / `Section` / `EmptyState` / `QuantityStepper` / `Price` | composition + commerce helpers |

### Commerce components (single source of truth)
- **`ProductCard`** — one card, used in Home, Shop, Wishlist, Related. Replaces the current duplicate `WishlistCard`. Variants: default, compact, wishlist-mode (move-to-cart action). Hover-lift, image zoom, quick-add, wishlist toggle, badges, price + strikethrough + rating.
- **`QuantityStepper`** — used in Cart and Product detail (one component, not N copies).
- **`Price`** — currency + strikethrough + discount %, consistent everywhere.
- **`ProductGrid`** — responsive grid wrapper with skeleton state.

---

## 6. Layout System

- **`Container`** — max-width + responsive gutters (replaces the scattered `px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24` copy-paste).
- **`Section`** — consistent vertical rhythm between page sections.
- **Navbar:** announcement bar + main bar (logo, mega-menu category dropdown, search, account/wishlist/cart with live badges from Redux) + **mobile drawer nav**.
- **Footer:** newsletter (real email validation + success state), link columns, payment badges, social links.
- **Mobile cart drawer (Sheet):** quick-view cart from the navbar icon.
- Responsive breakpoints: Tailwind defaults (sm/md/lg/xl/2xl). Mobile-first throughout.

---

## 7. Functionality (against expanded mock data)

### Data expansion (`src/data/`)
- **`products.js`** → ~40–60 products across real categories, each with full fields (gallery, colors, sizes, stock per variant, rating, reviews, tags). Keep the existing getter API shape so Phase C swaps to API with minimal churn.
- **`categories.js`** (new) — real category tree (Phones, Computers, Audio, Wearables, Cameras, Gaming, Accessories…).
- **`coupons.js`** (new) — mock coupon codes (`SAVE10`, `FREESHIP`, etc.) with type/value/validity for the checkout/cart coupon flow.
- **`reviews.js`** (new) — mock reviews attached to products for richer detail pages.

### Made genuinely functional
- **Shop** — filters (category, price range, rating, in-stock), sort (price asc/desc, rating, newest), **pagination** (12 per page), live result count. URL-synced (`?category=`, `?sort=`, `?page=`, `?search=`).
- **Search** — real name/description matching (header search → `/shop?search=`).
- **Product detail** — color/size selection (stock-aware disable), quantity, add-to-cart, wishlist toggle, related products, reviews, image gallery with thumbnails.
- **Cart & Wishlist** — add/remove/update, **persist to localStorage** (fixes the current reset-on-refresh defect), coupon validation against mock coupons, live totals/subtotals/shipping math.
- **Checkout** — validated multi-section form (contact + shipping + payment), order summary from Redux, "Place order" → order-confirmation state (clears cart, shows order id), empty-cart guard.
- **Auth (Login/SignUp)** — real client-side validation (email format, password length, match). Backend wiring is Phase C; the forms are real and validated now.
- **Newsletter** — real email validation + success toast.
- **Toasts** — `react-hot-toast` (already installed) for all feedback.

### URL state & pagination
Shop filters/sort/page/search live in the URL query string (shareable, back-button friendly). Pagination via a shared `Pagination` component.

---

## 8. State Management (Redux, ready for Phase C)

- Keep `cart` and `wishlist` slices (client state). Add **`localStorage` persistence middleware** (or a simple store-subscribe hydrate/persist) so they survive refresh.
- New **`ui` slice** — mobile nav open, cart drawer open, mobile filters open (replaces scattered local `useState` for global UI chrome).
- New **`auth` slice (mock)** — holds a mock user object for UI personalization (account menu, etc.). Real tokens come in Phase C; the slice shape is designed for it.
- **No RTK Query in Phase A** — data comes from `src/data/` directly via hooks. The data-access hooks (`useProducts`, `useProduct`) keep the same return shape so Phase C swaps the body from `data/*.js` to RTK Query with zero screen changes.

---

## 9. Folder Structure (feature-based)

Per the Redux team's recommendation (feature folders, one slice/API per feature).

```
src/
├── app/                 # store config, providers, router, App
│   ├── store.js
│   ├── providers.jsx
│   └── router.jsx
├── components/
│   ├── ui/              # design-system primitives (from scratch)
│   └── layout/          # Navbar, Footer, MainLayout, Container, Section
├── features/
│   ├── product/         # { components/, data hooks, index.js }
│   ├── cart/            # { cartSlice.js, components/, index.js }
│   ├── wishlist/        # { wishlistSlice.js, components/, index.js }
│   ├── auth/            # { authSlice.js, components/, index.js }
│   └── home/            # home-section components
├── screens/             # route-level page compositions (thin)
├── data/                # mock data (Phase C → API)
├── lib/                 # cn(), formatters (currency/date), constants
└── hooks/               # shared hooks (useCountdown, useMediaQuery…)
```

---

## 10. Accessibility & Responsiveness

- Mobile-first responsive at every breakpoint; tested down to 360px.
- All interactive primitives keyboard-accessible (focus-visible rings using `--color-ring`), correct ARIA roles for custom Select/Tabs/Dialog/Drawer.
- WCAG AA contrast on dark+red palette (verified: `#FF4D4D` on `#0A0A0B` ≈ 5.9:1; text `#FAFAFA` on `#0A0A0B` ≈ 19:1).
- Semantic HTML, alt text on all imagery, `prefers-reduced-motion` respected for hover/transition effects.

---

## 11. Cleanup & Loose-End Removal (in this phase)

Removed / rebuilt so nothing is dead or disconnected:
- Empty `src/App.css` (0 bytes, unimported)
- Unused `src/components/product/AddToCartButton.jsx` (rebuilt + actually wired into Product detail)
- Dead `getProductsByTag` export in `products.js`
- Vestigial empty `src/context/` folder
- Leftover `src/assets/react.svg`, `vite.svg`
- Duplicate `WishlistCard` (consolidated into shared `ProductCard`)
- Template root `README.md` → rewritten (real project readme)
- Demo-only `AdminScreen` (demo toasts = loose end) → **removed**; real admin in Phase B/C
- Pixel-fractional brittle utilities (`text-2.5`, `h-[71.428571%]`, `aspect-27/35`, `lg:w-67.5`…) → replaced with token-based utilities
- **Uninstall `antd` + `@ant-design/icons`** entirely

---

## 12. Tooling & Skill Notes

- The requested `frontend-design` skill is **not installed** in this ZCode environment (only `tailwind-4-docs`, brainstorming, writing-plans, etc. are present). I will use the **`tailwind-4-docs`** skill plus researched 2026 frontend best practices to achieve the same outcome.
- `frontend/` is the actual app folder. There is no separate client/backend in this repo; backend lives in `Backend-Mock` (sibling dir) and is Phase B.

---

## 13. References (2025–2026 standards)

- Design tokens with Tailwind v4: https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/
- Enterprise Tailwind 4 playbook: https://medium.com/@sureshdotariya/tailwind-css-4-best-practices-for-enterprise-scale-projects-2025-playbook-bf2910402581
- Tailwind at scale (avoid arbitrary values): https://www.designsystemscollective.com/tailwind-at-scale-the-best-way-to-kill-your-design-system-without-noticing-3976fc14b7d2
- Reusable React components 2026 (CVA + folder-per-component): https://medium.com/@romko.kozak/building-reusable-react-components-in-2026-a461d30f8ce4
- React design patterns 2026 (compound components): https://www.turbodocx.com/blog/react-design-patterns
- E-commerce UI trends 2026 (bento, dark, app-like, minimalism): https://halothemes.net/blogs/shopify/7-ecommerce-design-trends-in-2026-that-will-dominate-online-shopping
- Redux feature-folder structure: https://redux.js.org/tutorials/essentials/part-2-app-structure , https://github.com/reduxjs/redux-toolkit/discussions/1295

---

## 14. Acceptance Criteria (Phase A complete when…)

- [ ] Zero `antd` / `@ant-design/icons` imports remain; both uninstalled.
- [ ] Every UI primitive in §5 exists, is used, and is built from scratch with CVA.
- [ ] All 15 routes render and are fully responsive (360px → 1536px+).
- [ ] Shop filters/sort/pagination/search all work and are URL-synced.
- [ ] Cart & wishlist persist to localStorage (survives refresh).
- [ ] Coupon validation works against mock coupons; checkout produces a confirmation.
- [ ] All forms (login, signup, contact, checkout, newsletter) validate client-side.
- [ ] No dead code: every file imported somewhere; no unused exports left.
- [ ] Accessibility: keyboard navigable, visible focus, WCAG AA contrast.
- [ ] `npm run build` + `npm run lint` pass clean.
