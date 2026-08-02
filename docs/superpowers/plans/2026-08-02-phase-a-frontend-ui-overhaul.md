# Phase A — Frontend UI Overhaul ("Midnight Showroom") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Exclusive storefront from scratch as a distinctive dark "Midnight Showroom" e-commerce UI — replace all Ant Design with from-scratch Tailwind v4 components, expand mock data, make every interaction genuinely functional, and leave zero dead code.

**Architecture:** Tailwind v4 CSS-first layered tokens (`@theme`) → CVA-based design-system primitives (`src/components/ui/`) → feature-based Redux (cart/wishlist/ui/auth) with localStorage persistence → thin screens composing primitives. Logic is test-covered (Vitest, no DOM); UI is verified via lint + build + manual browser checks.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite`), Redux Toolkit 2, react-router-dom 7, class-variance-authority + clsx + tailwind-merge, @radix-ui/react-slot, lucide-react, react-hot-toast, Vitest (logic tests). Fonts: Satoshi (self-hosted, Fontshare) + Inter (`@fontsource/inter`).

**Spec:** `docs/superpowers/specs/2026-08-02-phase-a-frontend-ui-overhaul-design.md`

**Conventions for every task:**
- All shell commands run from the `frontend/` directory (the git repo root).
- Commit after each task. Branch: `mahad`.
- Run `npm run lint` before committing if a task touches JS/JSX. Run `npm test` if it adds/changes logic.
- Currency: USD `$`; whole dollars omit decimals, fractional show 2 decimals (`formatPrice`).

---

## File Structure (what gets created/modified)

```
frontend/
├── src/
│   ├── app/                          # NEW
│   │   ├── store.js  providers.jsx  router.jsx
│   ├── lib/                          # NEW
│   │   ├── cn.js  format.js  constants.js
│   ├── data/                         # EXPANDED
│   │   ├── products.js  categories.js  coupons.js  reviews.js
│   ├── features/                     # NEW — feature folders
│   │   ├── cart/      { cartSlice.js, index.js }
│   │   ├── wishlist/  { wishlistSlice.js, index.js }
│   │   ├── ui/        { uiSlice.js, index.js }
│   │   ├── auth/      { authSlice.js, index.js }
│   │   └── shop/      { selectors.js, index.js }
│   ├── components/
│   │   ├── ui/                       # REBUILT (no antd), barrel index.js
│   │   ├── layout/                   # REBUILT
│   │   ├── product/                  # REBUILT
│   │   └── home/                     # REBUILT
│   ├── hooks/                        # KEEP useCountdown; ADD useMediaQuery, useDebounce
│   ├── screens/                      # REBUILT (AdminScreen deleted)
│   ├── main.jsx                      # MODIFIED
│   ├── index.css                     # REWRITTEN
│   └── assets/fonts/                 # NEW — Satoshi woff2
├── tests/                            # NEW — Vitest, node env, no DOM
├── vitest.config.js  package.json  eslint.config.js
```

**Deleted:** `src/App.jsx`, `src/App.css`, `src/components/product/AddToCartButton.jsx`, `src/context/`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/screens/AdminScreen.jsx`. Ant Design uninstalled.

---

## Milestones

- **M1 — Foundation:** deps, tokens, fonts, cn, formatters, app shell, Vitest. (Tasks 1–7)
- **M2 — Design-system primitives:** all `components/ui/*`. (Tasks 8–16)
- **M3 — State + data:** Redux features, localStorage, mock data, shop selectors. (Tasks 17–22)
- **M4 — Layout + commerce:** Navbar/Footer/Layout, ProductCard, gallery, drawers. (Tasks 23–27)
- **M5 — Screens:** 13 routes rebuilt + functional. (Tasks 28–40)
- **M6 — Cleanup + verify:** dead code gone, antd gone, build+lint+test pass. (Tasks 41–44)

---

## Milestone 1 — Foundation

### Task 1: Install dependencies; uninstall Ant Design

**Files:** Modify `package.json`, `package-lock.json`

- [ ] **Step 1: Install runtime deps**

Run: `npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot`
Expected: packages added to `dependencies`.

- [ ] **Step 2: Install Vitest**

Run: `npm install -D vitest`
Expected: `vitest` in `devDependencies`.

- [ ] **Step 3: Uninstall Ant Design**

Run: `npm uninstall antd @ant-design/icons`
Expected: both removed. (App breaks until M5 — expected mid-rebuild.)

- [ ] **Step 4: Add test scripts**

Edit `package.json` `scripts`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Verify**

Run: `npm ls class-variance-authority clsx tailwind-merge @radix-ui/react-slot vitest`
Expected: all listed, no "missing".

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add CVA/clsx/tailwind-merge/radix-slot/vitest; drop antd"
```

---

### Task 2: Configure Vitest + ESLint test globals

**Files:** Create `vitest.config.js`; Modify `eslint.config.js`

- [ ] **Step 1: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
})
```

- [ ] **Step 2: Add test-globals override to eslint.config.js**

Read `eslint.config.js`. Append inside the config array:
```js
{
  files: ['tests/**/*.test.js'],
  languageOptions: {
    globals: {
      ...globals.node,
      describe: 'readonly', it: 'readonly', test: 'readonly',
      expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly',
    },
  },
}
```
Add `import globals from 'globals'` at top if missing (`npm i -D globals` if absent).

- [ ] **Step 3: Smoke test**

Create `tests/sanity.test.js`:
```js
import { describe, it, expect } from 'vitest'
describe('sanity', () => { it('runs vitest', () => { expect(1 + 1).toBe(2) }) })
```

- [ ] **Step 4: Run**

Run: `npm test` → Expected: 1 pass.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.js eslint.config.js tests/sanity.test.js package.json package-lock.json
git commit -m "chore(test): configure Vitest + ESLint test globals"
```

---

### Task 3: Self-host the Satoshi font

**Files:** Create `src/assets/fonts/Satoshi-Variable.woff2`, `Satoshi-VariableItalic.woff2`

- [ ] **Step 1: Download Satoshi from Fontshare (returns a zip)**

Run:
```bash
mkdir -p src/assets/fonts
curl -L -o /tmp/satoshi.zip "https://api.fontshare.com/v2/fonts/download/satoshi"
cd /tmp && unzip -o satoshi.zip -d satoshi_extracted
find satoshi_extracted -iname "*Variable*.woff2"
```
Copy `Satoshi-Variable.woff2` and `Satoshi-VariableItalic.woff2` (paths printed by `find`) into `frontend/src/assets/fonts/`. If only static weights exist in the zip (no `Variable` files), copy `Satoshi-Medium.woff2`, `Satoshi-Bold.woff2`, `Satoshi-Black.woff2` instead and adjust the `@font-face` in Task 4 to declare each weight explicitly (font-family still "Satoshi").

- [ ] **Step 2: Verify**

Run: `ls -la src/assets/fonts/` → Expected: 2 woff2 files, each > 20KB; magic bytes `wOF2`.

- [ ] **Step 3: Commit**

```bash
git add src/assets/fonts/
git commit -m "chore(fonts): self-host Satoshi variable woff2"
```

---

### Task 4: Rewrite index.css — Midnight Showroom tokens

**Files:** Modify `src/index.css` (full rewrite)

- [ ] **Step 1: Replace all of src/index.css**

```css
@import "tailwindcss";

/* MIDNIGHT SHOWROOM — design tokens (Tailwind v4 CSS-first).
   Layered: primitive -> semantic. Components consume semantic. */
@theme {
  /* Fonts */
  --font-sans: "Inter", system-ui, "Segoe UI", Roboto, sans-serif;
  --font-display: "Satoshi", "Inter", system-ui, sans-serif;

  /* Primitive: cool blue-tinted midnight scale */
  --color-midnight:     #070A12;
  --color-midnight-700: #0C1018;
  --color-midnight-600: #131826;
  --color-midnight-500: #1C2333;
  --color-midnight-400: #2A3344;
  --color-paper:        #F7F5F0;
  --color-paper-soft:   #EFEBE2;
  --color-line:         #DFD9CC;

  /* Signature gold accent (warm-on-cool) */
  --color-gold:         #E8B339;
  --color-gold-hover:   #F0C251;
  --color-gold-press:   #C9941F;

  /* Semantic red — sale/urgency ONLY */
  --color-sale:         #FF4D4D;
  --color-sale-hover:   #E63B3B;

  /* Semantic system */
  --color-success: #34D399;
  --color-warning: #F59E0B;
  --color-error:   #F87171;
  --color-rating:  #E8B339;

  /* Text — warm off-white on cool midnight */
  --color-content:     #F2EFE8;
  --color-content-sub: #B9B4A7;
  --color-content-mut: #7E7A70;
  --color-content-inv: #0A0D14;

  /* Semantic aliases (components use these) */
  --color-bg:            var(--color-midnight);
  --color-surface:       var(--color-midnight-700);
  --color-surface-2:     var(--color-midnight-600);
  --color-border:        var(--color-midnight-500);
  --color-border-strong: var(--color-midnight-400);
  --color-text:          var(--color-content);
  --color-text-muted:    var(--color-content-sub);
  --color-text-subtle:   var(--color-content-mut);
  --color-primary:       var(--color-gold);
  --color-primary-hover: var(--color-gold-hover);
  --color-on-primary:    var(--color-content-inv);
  --color-focus:         var(--color-gold);
  --color-ring:          var(--color-gold);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 2px rgba(0,0,0,.5), 0 12px 32px rgba(0,0,0,.35);
  --shadow-pop:  0 12px 40px rgba(0,0,0,.6);
}

/* Satoshi @font-face (self-hosted variable). If Task 3 fell back to
   static weights, replace this block with three @font-face rules
   (Medium 500, Bold 700, Black 900) all named "Satoshi". */
@font-face {
  font-family: "Satoshi";
  src: url("./assets/fonts/Satoshi-Variable.woff2") format("woff2-variations");
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: "Satoshi";
  src: url("./assets/fonts/Satoshi-VariableItalic.woff2") format("woff2-variations");
  font-weight: 300 900;
  font-display: swap;
  font-style: italic;
}

@layer base {
  * { border-color: var(--color-border); }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3, h4, h5 {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }
  :focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/* Warm light panel for dense readable content (checkout/legal) */
@utility surface-paper {
  background-color: var(--color-paper);
  color: var(--color-content-inv);
}

/* Tabular numerals for prices/stats — commerce signature */
@utility nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

- [ ] **Step 2: Smoke-check Vite**

Run: `npm run dev` (Ctrl-C once booted) → Expected: no PostCSS/@theme errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(theme): Midnight Showroom token system (gold/midnight, Satoshi)"
```

---

### Task 5: cn() helper

**Files:** Create `src/lib/cn.js`; Test `tests/lib/cn.test.js`

- [ ] **Step 1: Failing test** — create `tests/lib/cn.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { cn } from '../../src/lib/cn'

describe('cn', () => {
  it('joins plain classes', () => { expect(cn('a', 'b')).toBe('a b') })
  it('handles conditionals', () => { expect(cn('base', { active: true, hidden: false })).toBe('base active') })
  it('merges conflicts (later wins)', () => { expect(cn('p-2', 'p-4')).toBe('p-4') })
  it('keeps non-conflicting', () => { expect(cn('text-red-500', 'font-bold')).toBe('text-red-500 font-bold') })
  it('ignores falsy', () => { expect(cn('x', false, null, undefined, '')).toBe('x') })
})
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test -- tests/lib/cn.test.js` → FAIL (module not found).

- [ ] **Step 3: Implement src/lib/cn.js**:
```js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** clsx (conditionals) + tailwind-merge (conflict resolution). Use everywhere. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npm test -- tests/lib/cn.test.js` → 5 pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cn.js tests/lib/cn.test.js
git commit -m "feat(lib): add cn() class-name helper"
```

---

### Task 6: Formatters + constants

**Files:** Create `src/lib/format.js`, `src/lib/constants.js`; Test `tests/lib/format.test.js`

- [ ] **Step 1: Failing test** — create `tests/lib/format.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { formatPrice, formatNumber, formatDate, discountPercent } from '../../src/lib/format'

describe('formatPrice', () => {
  it('whole dollars', () => { expect(formatPrice(650)).toBe('$650') })
  it('fractional 2 decimals', () => { expect(formatPrice(19.5)).toBe('$19.50') })
  it('zero', () => { expect(formatPrice(0)).toBe('$0') })
})
describe('formatNumber', () => {
  it('thousands', () => { expect(formatNumber(10500)).toBe('10,500') })
  it('small', () => { expect(formatNumber(42)).toBe('42') })
})
describe('formatDate', () => {
  it('iso readable', () => {
    expect(formatDate('2026-08-02T12:00:00Z')).toMatch(/Aug/)
    expect(formatDate('2026-08-02T12:00:00Z')).toMatch(/2026/)
  })
})
describe('discountPercent', () => {
  it('floored', () => { expect(discountPercent(900, 650)).toBe(28) })
  it('no discount', () => { expect(discountPercent(100, 100)).toBe(0) })
  it('missing original', () => {
    expect(discountPercent(undefined, 100)).toBe(0)
    expect(discountPercent(0, 100)).toBe(0)
  })
})
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test -- tests/lib/format.test.js` → FAIL.

- [ ] **Step 3: Implement src/lib/format.js**:
```js
/** USD; whole dollars omit decimals, fractional show 2 decimals. */
export function formatPrice(value) {
  if (value == null || Number.isNaN(value)) return '$0'
  const n = Number(value)
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

/** Thousands-separated integer. */
export function formatNumber(value) {
  if (value == null) return '0'
  return Number(value).toLocaleString('en-US')
}

/** Human-readable date from an ISO string. */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Integer discount % between original and current price (floored, min 0). */
export function discountPercent(originalPrice, price) {
  if (!originalPrice || originalPrice <= 0) return 0
  if (price >= originalPrice) return 0
  return Math.floor(((originalPrice - price) / originalPrice) * 100)
}
```

- [ ] **Step 4: Implement src/lib/constants.js**:
```js
export const SHIPPING_FEE = 50
export const FREE_SHIP_THRESHOLD = 1000
export const PER_PAGE = 12

export const ROUTES = {
  HOME: '/', SHOP: '/shop', PRODUCT: '/product/:slug', CART: '/cart',
  CHECKOUT: '/checkout', WISHLIST: '/wishlist', LOGIN: '/login', SIGNUP: '/sign-up',
  ABOUT: '/about', CONTACT: '/contact', FAQ: '/faq',
  PRIVACY: '/privacy-policy', TERMS: '/terms-of-use', NOT_FOUND: '*',
}

export const STORAGE_KEYS = {
  CART: 'exclusive.cart',
  WISHLIST: 'exclusive.wishlist',
  AUTH: 'exclusive.auth',
}
```

- [ ] **Step 5: Run — expect pass**

Run: `npm test -- tests/lib/format.test.js` → all pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/format.js src/lib/constants.js tests/lib/format.test.js
git commit -m "feat(lib): formatters (price/number/date/discount) + constants"
```

---

### Task 7: Extract app/ (store, providers, router); delete App.jsx + App.css

**Files:** Create `src/app/store.js`, `app/providers.jsx`, `app/router.jsx`; Modify `src/main.jsx`; Delete `src/App.jsx`, `src/App.css`

> Feature-folder slices + ui/auth + persistence land in M3. This task uses the existing slices so the store compiles now.

- [ ] **Step 1: src/app/store.js**
```js
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../store/slices/cartSlice'
import wishlistReducer from '../store/slices/wishlistSlice'

// M3 swaps these for feature-folder slices + ui/auth + localStorage persistence.
export const store = configureStore({
  reducer: { cart: cartReducer, wishlist: wishlistReducer },
})
```

- [ ] **Step 2: src/app/providers.jsx** (no antd ConfigProvider)
```jsx
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './store'

/** Redux -> Router -> children -> Toaster. */
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  )
}
```

- [ ] **Step 3: src/app/router.jsx** — copy every screen import + `<Route>` from the current `src/App.jsx` into:
```jsx
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../components/layout/main-layout'
// paste each screen import from App.jsx here

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* paste the exact <Route> list from App.jsx */}
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}
```
Note: `MainLayout` is `main-layout.jsx` after M4 Task 23. Until then import from the existing `MainLayout.jsx` path. Keep `AdminScreen` import for now (removed in M6 Task 41).

- [ ] **Step 4: Rewrite src/main.jsx**
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './app/router'
import { Providers } from './app/providers'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>,
)
```
(Poppins `@fontsource/poppins` imports removed.)

- [ ] **Step 5: Delete App.jsx + App.css**

Run: `git rm src/App.jsx src/App.css`

- [ ] **Step 6: Commit**

```bash
git add src/app/ src/main.jsx
git commit -m "feat(app): extract providers/router/store; drop antd ConfigProvider + App.css"
```

---
## Milestone 2 — Design-system primitives (from scratch, no antd)

> Pattern for all primitives: CVA variant config + `cn()` + `forwardRef`. Each is self-contained, accessible (keyboard + ARIA), themed via tokens. No DOM tests — verify by lint + dev server render. Keep each file < 90 lines.

### Task 8: Button (polymorphic via asChild)

**Files:** Create `src/components/ui/button.jsx`

- [ ] **Step 1: Implement**
```jsx
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'
import { Spinner } from './spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-gold-press)]',
        secondary: 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border-strong)]',
        outline: 'border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
        ghost: 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
        sale: 'bg-[var(--color-sale)] text-white hover:bg-[var(--color-sale-hover)]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), loading && 'opacity-70 pointer-events-none', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </Comp>
  )
})
```

- [ ] **Step 2: Lint** — Run: `npm run lint` → no new errors in this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.jsx
git commit -m "feat(ui): Button primitive (CVA variants, asChild, loading)"
```

---

### Task 9: Spinner + Skeleton + Separator + Avatar

**Files:** Create `src/components/ui/spinner.jsx`, `skeleton.jsx`, `separator.jsx`, `avatar.jsx`

- [ ] **Step 1: spinner.jsx**
```jsx
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-[var(--color-primary)]', className)} aria-hidden="true" />
}
```

- [ ] **Step 2: skeleton.jsx**
```jsx
import { cn } from '../../lib/cn'
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-[var(--color-surface-2)]', className)} aria-hidden="true" />
}
```

- [ ] **Step 3: separator.jsx**
```jsx
import { cn } from '../../lib/cn'
export function Separator({ className, orientation = 'horizontal' }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('bg-[var(--color-border)]', orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)}
    />
  )
}
```

- [ ] **Step 4: avatar.jsx**
```jsx
import { cn } from '../../lib/cn'
export function Avatar({ src, alt = '', fallback = '', className }) {
  return (
    <span className={cn('inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]', className)}>
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : <span className="font-display font-bold">{fallback || alt.charAt(0)}</span>}
    </span>
  )
}
```

- [ ] **Step 5: Lint + Commit**

```bash
git add src/components/ui/spinner.jsx skeleton.jsx separator.jsx avatar.jsx
npm run lint
git commit -m "feat(ui): Spinner, Skeleton, Separator, Avatar primitives"
```

---

### Task 10: Input + Textarea + Label

**Files:** Create `src/components/ui/input.jsx`, `textarea.jsx`, `label.jsx`

- [ ] **Step 1: input.jsx** (label/error/hint slots, focus ring)
```jsx
import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'

export const Input = forwardRef(function Input({ label, error, hint, id, className, ...props }, ref) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={fieldId} className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${fieldId}-msg` : undefined}
        className={cn(
          'h-11 w-full rounded-md border bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] transition-colors',
          'border-[var(--color-border)] focus:border-[var(--color-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
          className
        )}
        {...props}
      />
      {(hint || error) && (
        <p id={`${fieldId}-msg`} className={cn('text-xs', error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-subtle)]')}>
          {error || hint}
        </p>
      )}
    </div>
  )
})
```

- [ ] **Step 2: textarea.jsx** — same pattern, `<textarea>` with `min-h-[96px] py-2 resize-y`.

```jsx
import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'

export const Textarea = forwardRef(function Textarea({ label, error, hint, id, className, ...props }, ref) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={fieldId} className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${fieldId}-msg` : undefined}
        className={cn(
          'min-h-[96px] w-full resize-y rounded-md border bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]',
          'border-[var(--color-border)] focus:border-[var(--color-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
          error && 'border-[var(--color-error)]',
          className
        )}
        {...props}
      />
      {(hint || error) && (
        <p id={`${fieldId}-msg`} className={cn('text-xs', error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-subtle)]')}>
          {error || hint}
        </p>
      )}
    </div>
  )
})
```

- [ ] **Step 3: label.jsx** (standalone)
```jsx
import { cn } from '../../lib/cn'
export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-[var(--color-text)]', className)} {...props} />
}
```

- [ ] **Step 4: Lint + Commit**

```bash
git add src/components/ui/input.jsx textarea.jsx label.jsx
npm run lint
git commit -m "feat(ui): Input, Textarea, Label primitives (label/error/hint slots)"
```

---

### Task 11: Select (accessible custom listbox)

**Files:** Create `src/components/ui/select.jsx`

- [ ] **Step 1: Implement** — native-styled custom select using a button + popover, keyboard-navigable (ArrowUp/Down, Enter, Esc), ARIA listbox roles.

```jsx
import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Select({ label, value, onChange, options, placeholder = 'Select…', error, id }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const autoId = useId()
  const fieldId = id || autoId
  const ref = useRef(null)
  const options_ = options // [{ value, label }]

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function choose(val) { onChange?.(val); setOpen(false) }
  function onKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpen(true); return }
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, options_.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(options_[active].value) }
  }

  const selected = options_.find(o => o.value === value)

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={fieldId} className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <div ref={ref} className="relative">
        <button
          type="button"
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen(o => !o)}
          onKeyDown={onKeyDown}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)]',
            'border-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
            error && 'border-[var(--color-error)]'
          )}
        >
          <span className={cn(!selected && 'text-[var(--color-text-subtle)]')}>{selected ? selected.label : placeholder}</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <ul role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-pop)]">
            {options_.map((opt, i) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt.value)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm',
                  i === active ? 'bg-[var(--color-surface-2)]' : '',
                  opt.value === value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                )}>
                {opt.label}
                {opt.value === value && <Check className="h-4 w-4" />}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Lint + Commit**

```bash
git add src/components/ui/select.jsx
npm run lint
git commit -m "feat(ui): accessible custom Select (keyboard listbox)"
```

---

### Task 12: Checkbox + RadioGroup + Switch

**Files:** Create `src/components/ui/checkbox.jsx`, `radio-group.jsx`, `switch.jsx`

- [ ] **Step 1: checkbox.jsx**
```jsx
import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Checkbox({ checked, onChange, label, id, disabled }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <label htmlFor={fieldId} className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]', disabled && 'opacity-50 pointer-events-none')}>
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <input id={fieldId} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} className="peer sr-only" />
        <span className={cn('h-5 w-5 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-ring)]')} />
        {checked && <Check className="pointer-events-none absolute h-3.5 w-3.5 text-[var(--color-on-primary)]" strokeWidth={3} />}
      </span>
      {label && <span>{label}</span>}
    </label>
  )
}
```

- [ ] **Step 2: radio-group.jsx** (compound via props, not context — keep simple)
```jsx
import { useId } from 'react'
import { cn } from '../../lib/cn'

export function RadioGroup({ label, value, onChange, options, name, error }) {
  const autoName = useId()
  const groupName = name || autoName
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={label}>
      {label && <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <label key={opt.value} className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
              selected ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
            )}>
              <input type="radio" name={groupName} checked={selected} onChange={() => onChange?.(opt.value)} className="peer sr-only" />
              <span className={cn('h-4 w-4 rounded-full border', selected ? 'border-[var(--color-primary)]' : 'border-[var(--color-border-strong)]')}>
                {selected && <span className="m-1 block h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
              </span>
              {opt.label}
            </label>
          )
        })}
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: switch.jsx**
```jsx
import { useId } from 'react'
import { cn } from '../../lib/cn'
export function Switch({ checked, onChange, label, id }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <label htmlFor={fieldId} className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
      <span className="relative inline-flex h-6 w-11 items-center">
        <input id={fieldId} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange?.(e.target.checked)} className="peer sr-only" />
        <span className={cn('h-6 w-11 rounded-full bg-[var(--color-surface-2)] transition-colors peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-ring)]')} />
        <span className={cn('absolute left-0.5 h-5 w-5 rounded-full bg-[var(--color-content)] transition-transform peer-checked:translate-x-5')} />
      </span>
      {label && <span>{label}</span>}
    </label>
  )
}
```

- [ ] **Step 4: Lint + Commit**

```bash
git add src/components/ui/checkbox.jsx radio-group.jsx switch.jsx
npm run lint
git commit -m "feat(ui): Checkbox, RadioGroup, Switch primitives"
```

---

### Task 13: Badge + Rating + Price

**Files:** Create `src/components/ui/badge.jsx`, `rating.jsx`, `price.jsx`

- [ ] **Step 1: badge.jsx**
```jsx
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    tone: {
      gold: 'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
      sale: 'bg-[var(--color-sale)] text-white',
      success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
      neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
      outline: 'border border-[var(--color-border-strong)] text-[var(--color-text)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Badge({ tone, className, children }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>
}
```

- [ ] **Step 2: rating.jsx** (accessible stars, half-star, read-only default)
```jsx
import { Star } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Rating({ value = 0, onChange, size = 16, className, readOnly = true }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} of 5`}>
      {stars.map((s) => {
        const filled = value >= s
        const half = !filled && value >= s - 0.5
        return (
          <button
            key={s}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(s)}
            className={cn(!readOnly && 'cursor-pointer', readOnly && 'cursor-default')}
            aria-label={`${s} star${s > 1 ? 's' : ''}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                filled || half ? 'text-[var(--color-rating)]' : 'text-[var(--color-content-mut)]'
              )}
              fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'}
              strokeWidth={2}
            />
          </button>
        )
      })}
    </div>
  )
}
```
(For half-star fill, add an `<svg><linearGradient id="half">` once at app root if needed; acceptable to render full star for `filled||half` as a simplification — choose full-star-on-half for v1 and note it.)

- [ ] **Step 3: price.jsx** (signature: Satoshi + tabular nums + strikethrough + discount)
```jsx
import { formatPrice, discountPercent } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Badge } from './badge'

export function Price({ price, originalPrice, size = 'md', showDiscount = true, className }) {
  const hasDiscount = originalPrice && originalPrice > price
  const pct = discountPercent(originalPrice, price)
  const sizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl', xl: 'text-3xl' }
  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('font-display font-bold nums text-[var(--color-text)]', sizes[size])}>{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className={cn('nums text-[var(--color-text-subtle)] line-through', size === 'lg' || size === 'xl' ? 'text-base' : 'text-sm')}>{formatPrice(originalPrice)}</span>
          {showDiscount && <Badge tone="sale">-{pct}%</Badge>}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Lint + Commit**

```bash
git add src/components/ui/badge.jsx rating.jsx price.jsx
npm run lint
git commit -m "feat(ui): Badge, Rating, Price (commerce signature) primitives"
```

---

### Task 14: Container + Section + EmptyState + Breadcrumb

**Files:** Create `src/components/ui/container.jsx`, `section.jsx`, `empty-state.jsx`, `breadcrumb.jsx`

- [ ] **Step 1: container.jsx**
```jsx
import { cn } from '../../lib/cn'
export function Container({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10', className)}>{children}</div>
}
```

- [ ] **Step 2: section.jsx**
```jsx
import { cn } from '../../lib/cn'
export function Section({ className, children, id }) {
  return <section id={id} className={cn('py-12 sm:py-16 lg:py-20', className)}>{children}</section>
}
```

- [ ] **Step 3: empty-state.jsx**
```jsx
import { cn } from '../../lib/cn'
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center', className)}>
      {Icon && <Icon className="h-10 w-10 text-[var(--color-text-subtle)]" />}
      <div>
        <h3 className="font-display text-lg font-bold text-[var(--color-text)]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
```

- [ ] **Step 4: breadcrumb.jsx** (items: [{label, to?}])
```jsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-[var(--color-text-muted)]', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {it.to && !last ? (
                <Link to={it.to} className="hover:text-[var(--color-primary)]">{it.label}</Link>
              ) : (
                <span className={cn(last && 'text-[var(--color-text)]')}>{it.label}</span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-subtle)]" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

- [ ] **Step 5: Lint + Commit**

```bash
git add src/components/ui/container.jsx section.jsx empty-state.jsx breadcrumb.jsx
npm run lint
git commit -m "feat(ui): Container, Section, EmptyState, Breadcrumb primitives"
```

---

### Task 15: QuantityStepper + Pagination + Tooltip

**Files:** Create `src/components/ui/quantity-stepper.jsx`, `pagination.jsx`, `tooltip.jsx`

- [ ] **Step 1: quantity-stepper.jsx** (shared by Cart + Product detail)
```jsx
import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'

export function QuantityStepper({ value, min = 1, max = 99, onChange, size = 'md', className }) {
  const sizes = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
  const btn = 'inline-flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:pointer-events-none'
  return (
    <div className={cn('inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)]', sizes[size], className)}>
      <button type="button" aria-label="Decrease quantity" className={cn(btn, 'px-2.5')} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2ch] text-center font-display text-sm font-semibold nums text-[var(--color-text)]">{value}</span>
      <button type="button" aria-label="Increase quantity" className={cn(btn, 'px-2.5')} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: pagination.jsx**
```jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Pagination({ page, pageCount, onChange, className }) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
          className={cn('inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm nums',
            p === page ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]')}>
          {p}
        </button>
      ))}
      <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onChange(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
```

- [ ] **Step 3: tooltip.jsx** (CSS hover/focus, title-free)
```jsx
import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
export function Tooltip({ label, children, className }) {
  const [show, setShow] = useState(false)
  const id = useId()
  return (
    <span className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      <span aria-describedby={show ? id : undefined}>{children}</span>
      {show && (
        <span role="tooltip" id={id} className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-content-inv)] px-2 py-1 text-xs text-[var(--color-paper)] shadow-[var(--shadow-pop)]">
          {label}
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 4: Lint + Commit**

```bash
git add src/components/ui/quantity-stepper.jsx pagination.jsx tooltip.jsx
npm run lint
git commit -m "feat(ui): QuantityStepper, Pagination, Tooltip primitives"
```

---

### Task 16: Accordion + Tabs + Dialog + Drawer (compound/overlay)

**Files:** Create `src/components/ui/accordion.jsx`, `tabs.jsx`, `dialog.jsx`, `drawer.jsx`; then `src/components/ui/index.js` barrel.

- [ ] **Step 1: accordion.jsx** (FAQ uses this; native-ish, animated)
```jsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Accordion({ items, className }) {
  const [open, setOpen] = useState(null)
  return (
    <div className={cn('divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]', className)}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left font-medium text-[var(--color-text)]">
              <span>{it.question}</span>
              <ChevronDown className={cn('h-5 w-5 shrink-0 text-[var(--color-text-muted)] transition-transform', isOpen && 'rotate-180')} />
            </button>
            <div className={cn('grid transition-all duration-200', isOpen ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden text-sm text-[var(--color-text-muted)]">{it.answer}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: tabs.jsx**
```jsx
import { useState } from 'react'
import { cn } from '../../lib/cn'

export function Tabs({ tabs, defaultIndex = 0, className }) {
  const [idx, setIdx] = useState(defaultIndex)
  const active = tabs[idx]
  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((t, i) => (
          <button key={i} role="tab" aria-selected={i === idx} onClick={() => setIdx(i)}
            className={cn('-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              i === idx ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">{active?.content}</div>
    </div>
  )
}
```

- [ ] **Step 3: dialog.jsx** (modal: overlay, focus-trap-lite via Escape, portal-lite via fixed)
```jsx
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Dialog({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-lg rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-pop)]', className)}>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[var(--color-text)]">{title}</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="h-5 w-5" /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: drawer.jsx** (side sheet: mobile nav + cart drawer; side: 'left'|'right')
```jsx
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Drawer({ open, onClose, side = 'right', title, children }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  return (
    <div className={cn('fixed inset-0 z-[100]', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      <div className={cn('absolute inset-0 bg-black/60 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title}
        className={cn('absolute top-0 flex h-full w-full max-w-sm flex-col border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)] transition-transform duration-300',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full')}>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
          <h2 className="font-display text-base font-bold text-[var(--color-text)]">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: ui barrel index.js**
```js
export { Button } from './button'
export { Spinner } from './spinner'
export { Skeleton } from './skeleton'
export { Separator } from './separator'
export { Avatar } from './avatar'
export { Input } from './input'
export { Textarea } from './textarea'
export { Label } from './label'
export { Select } from './select'
export { Checkbox } from './checkbox'
export { RadioGroup } from './radio-group'
export { Switch } from './switch'
export { Badge } from './badge'
export { Rating } from './rating'
export { Price } from './price'
export { Container } from './container'
export { Section } from './section'
export { EmptyState } from './empty-state'
export { Breadcrumb } from './breadcrumb'
export { QuantityStepper } from './quantity-stepper'
export { Pagination } from './pagination'
export { Tooltip } from './tooltip'
export { Accordion } from './accordion'
export { Tabs } from './tabs'
export { Dialog } from './dialog'
export { Drawer } from './drawer'
```

- [ ] **Step 6: Lint + Commit**

```bash
git add src/components/ui/accordion.jsx tabs.jsx dialog.jsx drawer.jsx index.js
npm run lint
git commit -m "feat(ui): Accordion, Tabs, Dialog, Drawer + ui barrel"
```

---
## Milestone 3 — State + data (Redux features, persistence, mock data, shop selectors)

### Task 17: Move cart + wishlist into feature folders; add ui + auth slices

**Files:** Create `src/features/cart/cartSlice.js`, `src/features/wishlist/wishlistSlice.js`, `src/features/ui/uiSlice.js`, `src/features/auth/authSlice.js`, and each `index.js`; later delete `src/store/slices/`.

> Keep slice logic **identical** to current `cartSlice`/`wishlistSlice` (actions already correct); only relocate. Add `ui` and `auth` slices new.

- [ ] **Step 1: src/features/cart/cartSlice.js** — start from the current `src/store/slices/cartSlice.js` logic, but make `addToCart` **quantity-aware** (fixes the existing defect where the detail page had to dispatch N times). Full file:
```js
import { createSlice } from '@reduxjs/toolkit'

/**
 * Shopping cart slice. State: { items: Array<Product & { quantity }> }.
 * Persisted to localStorage via the store subscriber (Task 18).
 */
const initialState = { items: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Accepts a product, or { product, quantity }. Defaults quantity 1.
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload?.product
        ? action.payload
        : { product: action.payload, quantity: 1 }
      const existing = state.items.find((item) => item.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ ...product, quantity })
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)
      if (item) item.quantity = Math.max(1, quantity)
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item) item.quantity += 1
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity > 1) item.quantity -= 1
    },
    clearCart: (state) => { state.items = [] },
    // Hydration action for localStorage preload (Task 18).
    setCart: (state, action) => { state.items = action.payload },
  },
})

export const {
  addToCart, removeFromCart, updateQuantity, incrementQuantity,
  decrementQuantity, clearCart, setCart,
} = cartSlice.actions

export default cartSlice.reducer
```
NOTE: `addToCart(product)` still works (back-compat for ProductCard's quick-add), AND `addToCart({ product, quantity })` works for the detail page's quantity-aware add. Both call sites below use this correctly.

- [ ] **Step 2: src/features/cart/index.js**
```js
export { default as cartReducer } from './cartSlice'
export * from './cartSlice'
```

- [ ] **Step 3: Test the new quantity-aware addToCart** — create `tests/features/cart/cartSlice.test.js`:
```js
import { describe, it, expect } from 'vitest'
import reducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../../../src/features/cart/cartSlice'

const product = { id: 'p1', name: 'X', price: 10, slug: 'x', image: '/x.png' }
const state0 = { items: [] }

describe('cartSlice', () => {
  it('adds a new product with quantity 1 (bare product payload)', () => {
    const s = reducer(state0, addToCart(product))
    expect(s.items).toHaveLength(1)
    expect(s.items[0].quantity).toBe(1)
  })
  it('increments quantity when adding an existing product', () => {
    const s1 = reducer(state0, addToCart(product))
    const s2 = reducer(s1, addToCart(product))
    expect(s2.items).toHaveLength(1)
    expect(s2.items[0].quantity).toBe(2)
  })
  it('accepts { product, quantity } and adds the given quantity', () => {
    const s = reducer(state0, addToCart({ product, quantity: 3 }))
    expect(s.items[0].quantity).toBe(3)
  })
  it('increments by quantity when product already in cart', () => {
    const s1 = reducer(state0, addToCart({ product, quantity: 2 }))
    const s2 = reducer(s1, addToCart({ product, quantity: 3 }))
    expect(s2.items[0].quantity).toBe(5)
  })
  it('removes a product by id', () => {
    const s1 = reducer(state0, addToCart(product))
    const s2 = reducer(s1, removeFromCart('p1'))
    expect(s2.items).toHaveLength(0)
  })
  it('updateQuantity sets absolute quantity (min 1)', () => {
    const s1 = reducer(state0, addToCart(product))
    expect(reducer(s1, updateQuantity({ id: 'p1', quantity: 5 })).items[0].quantity).toBe(5)
    expect(reducer(s1, updateQuantity({ id: 'p1', quantity: 0 })).items[0].quantity).toBe(1)
  })
  it('clearCart empties the cart', () => {
    const s1 = reducer(state0, addToCart(product))
    expect(reducer(s1, clearCart()).items).toHaveLength(0)
  })
})
```

- [ ] **Step 4: Run — expect pass**

Run: `npm test -- tests/features/cart/cartSlice.test.js` → Expected: 7 pass (the slice is implemented in Step 1).

- [ ] **Step 5: src/features/wishlist/wishlistSlice.js** — copy current `wishlistSlice.js` verbatim. Add `setWishlist` for hydration:
```js
    setWishlist: (state, action) => { state.items = action.payload },
// export setWishlist
```

- [ ] **Step 6: src/features/wishlist/index.js**
```js
export { default as wishlistReducer } from './wishlistSlice'
export * from './wishlistSlice'
```

- [ ] **Step 7: src/features/ui/uiSlice.js + index.js**
```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = { mobileNavOpen: false, cartDrawerOpen: false, mobileFiltersOpen: false }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav: (state) => { state.mobileNavOpen = !state.mobileNavOpen },
    closeMobileNav: (state) => { state.mobileNavOpen = false },
    openCartDrawer: (state) => { state.cartDrawerOpen = true },
    closeCartDrawer: (state) => { state.cartDrawerOpen = false },
    toggleCartDrawer: (state) => { state.cartDrawerOpen = !state.cartDrawerOpen },
    toggleMobileFilters: (state) => { state.mobileFiltersOpen = !state.mobileFiltersOpen },
    closeMobileFilters: (state) => { state.mobileFiltersOpen = false },
  },
})
export const { toggleMobileNav, closeMobileNav, openCartDrawer, closeCartDrawer, toggleCartDrawer, toggleMobileFilters, closeMobileFilters } = uiSlice.actions
export default uiSlice.reducer
```
`src/features/ui/index.js`:
```js
export { default as uiReducer } from './uiSlice'
export * from './uiSlice'
```

- [ ] **Step 8: src/features/auth/authSlice.js + index.js** (mock user; real tokens in Phase C)
```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = { user: null, status: 'idle' } // status: 'idle' | 'authenticated'

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => { state.user = action.payload; state.status = 'authenticated' },
    logout: (state) => { state.user = null; state.status = 'idle' },
  },
})
export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
```
`src/features/auth/index.js`:
```js
export { default as authReducer } from './authSlice'
export * from './authSlice'
```

- [ ] **Step 9: Commit** (slices still wired in next task)
```bash
git add src/features/ tests/features/cart/cartSlice.test.js
git commit -m "feat(state): feature-folder cart/wishlist/ui/auth slices (+hydration actions)"
```

---

### Task 18: localStorage persistence + wire store

**Files:** Modify `src/app/store.js`

- [ ] **Step 1: Rewrite src/app/store.js** — combine all four feature reducers + subscribe-based persistence for cart & wishlist.
```js
import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from '../features/cart'
import { wishlistReducer } from '../features/wishlist'
import { uiReducer } from '../features/ui'
import { authReducer } from '../features/auth'
import { STORAGE_KEYS } from '../lib/constants'

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch { return undefined }
}

const preloadedCart = load(STORAGE_KEYS.CART)
const preloadedWishlist = load(STORAGE_KEYS.WISHLIST)

export const store = configureStore({
  reducer: { cart: cartReducer, wishlist: wishlistReducer, ui: uiReducer, auth: authReducer },
  preloadedState: {
    ...(preloadedCart ? { cart: preloadedCart } : {}),
    ...(preloadedWishlist ? { wishlist: preloadedWishlist } : {}),
  },
})

let saveTimer
function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(store.getState().cart))
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(store.getState().wishlist))
    } catch { /* quota/private mode — ignore */ }
  }, 300)
}
store.subscribe(persist)
```

- [ ] **Step 2: Delete old slices folder**

Run: `git rm -r src/store/slices`
Then if `src/store/` is now empty, `git rm -r src/store` (or keep `src/store/index.js` re-exporting `store` from `app/store.js` if anything imports it — grep first).

- [ ] **Step 3: Verify no stale imports**

Run: `grep -rn "store/slices" src/` → Expected: no matches.

- [ ] **Step 4: Lint + Commit**

```bash
git add src/app/store.js
git rm -r src/store/slices
npm run lint
git commit -m "feat(state): localStorage persistence for cart/wishlist; wire ui+auth"
```

---

### Task 19: Shop selectors (filter/sort/paginate) — TDD

**Files:** Create `src/features/shop/selectors.js`, `src/features/shop/index.js`; Test `tests/features/shop/selectors.test.js`

- [ ] **Step 1: Failing test** — create `tests/features/shop/selectors.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { filterProducts, sortProducts, paginate, applyShopQuery } from '../../../src/features/shop/selectors'

const sample = [
  { id: 'a', name: 'Alpha', price: 100, rating: 4.5, stock: 5, category: 'Phones', tags: ['new'], createdAt: '2026-01-02' },
  { id: 'b', name: 'Beta Bear', price: 50, rating: 3.0, stock: 0, category: 'Audio', tags: [], createdAt: '2026-01-01' },
  { id: 'c', name: 'Gamma', price: 200, rating: 5.0, stock: 3, category: 'Phones', tags: ['bestseller'], createdAt: '2026-01-03' },
]

describe('filterProducts', () => {
  it('searches by name (case-insensitive)', () => {
    expect(filterProducts(sample, { search: 'bear' }).map(p => p.id)).toEqual(['b'])
  })
  it('filters by category', () => {
    expect(filterProducts(sample, { category: 'Phones' }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('filters by price range', () => {
    expect(filterProducts(sample, { minPrice: 60, maxPrice: 150 }).map(p => p.id)).toEqual(['a'])
  })
  it('filters by min rating', () => {
    expect(filterProducts(sample, { minRating: 4 }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('excludes out of stock when inStockOnly', () => {
    expect(filterProducts(sample, { inStockOnly: true }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('combines filters', () => {
    expect(filterProducts(sample, { category: 'Phones', minRating: 4.8 }).map(p => p.id)).toEqual(['c'])
  })
  it('empty filter returns all', () => {
    expect(filterProducts(sample, {}).length).toBe(3)
  })
})

describe('sortProducts', () => {
  it('price-asc', () => { expect(sortProducts(sample, 'price-asc').map(p => p.id)).toEqual(['b', 'a', 'c']) })
  it('price-desc', () => { expect(sortProducts(sample, 'price-desc').map(p => p.id)).toEqual(['c', 'a', 'b']) })
  it('rating', () => { expect(sortProducts(sample, 'rating').map(p => p.id)).toEqual(['c', 'a', 'b']) })
  it('newest', () => { expect(sortProducts(sample, 'newest').map(p => p.id)).toEqual(['c', 'a', 'b']) })
  it('default (no sort) preserves order', () => { expect(sortProducts(sample, '').map(p => p.id)).toEqual(['a', 'b', 'c']) })
})

describe('paginate', () => {
  it('slices by page+perPage', () => {
    expect(paginate(['a', 'b', 'c', 'd', 'e'], 1, 2)).toEqual(['a', 'b'])
    expect(paginate(['a', 'b', 'c', 'd', 'e'], 3, 2)).toEqual(['e'])
  })
  it('clamps page overrange to empty', () => {
    expect(paginate(['a', 'b'], 5, 2)).toEqual([])
  })
  it('pageCount', () => {
    expect(Math.ceil(5 / 2)).toBe(3)
  })
})

describe('applyShopQuery', () => {
  it('end-to-end pipeline returns {items, pagination}', () => {
    const r = applyShopQuery(sample, { search: '', category: 'Phones', sort: 'price-desc', page: 1, perPage: 10, minRating: 0, minPrice: 0, maxPrice: Infinity, inStockOnly: false })
    expect(r.items.map(p => p.id)).toEqual(['c', 'a'])
    expect(r.pagination).toEqual({ page: 1, perPage: 10, total: 2, pageCount: 1 })
  })
})
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test -- tests/features/shop/selectors.test.js` → FAIL.

- [ ] **Step 3: Implement src/features/shop/selectors.js**:
```js
/** Pure shop pipeline functions. No React/Redux — fully testable. */

export function filterProducts(list, q) {
  const { search = '', category = '', minPrice = 0, maxPrice = Infinity, minRating = 0, inStockOnly = false, tag = '' } = q
  const term = String(search).trim().toLowerCase()
  return list.filter((p) => {
    if (term && !(p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term))) return false
    if (category && p.category !== category) return false
    if (p.price < minPrice || p.price > maxPrice) return false
    if (p.rating < minRating) return false
    if (inStockOnly && p.stock <= 0) return false
    if (tag && !(p.tags || []).includes(tag)) return false
    return true
  })
}

export function sortProducts(list, sort) {
  const copy = [...list]
  switch (sort) {
    case 'price-asc': return copy.sort((a, b) => a.price - b.price)
    case 'price-desc': return copy.sort((a, b) => b.price - a.price)
    case 'rating': return copy.sort((a, b) => b.rating - a.rating)
    case 'newest': return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default: return copy
  }
}

export function paginate(list, page, perPage) {
  const start = (page - 1) * perPage
  return list.slice(start, start + perPage)
}

export function pageCount(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage))
}

/** Full pipeline: filter -> sort -> paginate. Returns { items, pagination }. */
export function applyShopQuery(list, q) {
  const { sort = '', page = 1, perPage = 12 } = q
  const filtered = filterProducts(list, q)
  const sorted = sortProducts(filtered, sort)
  const clampedPage = Math.min(Math.max(1, page), pageCount(filtered.length, perPage))
  const items = paginate(sorted, clampedPage, perPage)
  return { items, pagination: { page: clampedPage, perPage, total: filtered.length, pageCount: pageCount(filtered.length, perPage) } }
}
```

`src/features/shop/index.js`:
```js
export * from './selectors'
```

- [ ] **Step 4: Run — expect pass**

Run: `npm test -- tests/features/shop/selectors.test.js` → all pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/shop/ tests/features/shop/selectors.test.js
git commit -m "feat(shop): pure filter/sort/paginate selectors (TDD)"
```

---

### Task 20: Expand products data (~40-60 products)

**Files:** Modify `src/data/products.js`

- [ ] **Step 1: Expand the products array** to 40-60 items by extending the existing 18 + adding more across each category (Phones, Computers, Audio, Wearables, Cameras, Gaming, Accessories, Home & Lifestyle, etc.). Each product keeps the existing shape and **adds `createdAt`** (ISO string, used by `sortProducts('newest')`) and `brand`. Reuse existing image paths under `/images/products/` (don't invent new asset paths that don't exist). Keep the `tags` vocabulary: `featured`, `todays-deal`, `bestseller`, `new`.

Example new entry shape (match existing fields + createdAt + brand):
```js
{
  id: 'p19',
  name: 'Wireless Noise-Cancelling Headphones',
  slug: 'wireless-noise-cancelling-headphones',
  image: '/images/products/jbl-speaker.png', // reuse an existing asset
  images: ['/images/products/jbl-speaker.png'],
  price: 220, originalPrice: 300, rating: 4.6, reviews: 180,
  description: '...', stock: 25, category: 'HeadPhones',
  colors: [{ name: 'Black', value: '#171717' }],
  sizes: ['Standard'],
  tags: ['featured', 'new'],
  brand: 'Sonic',
  createdAt: '2026-07-15T00:00:00Z',
}
```
Action: add ~25-40 more products following this shape, distributed across categories. Ensure each category has at least 5 products so filters look populated.

- [ ] **Step 2: Remove dead export** — delete `getProductsByTag` (unused per spec cleanup).

- [ ] **Step 3: Update getter JSDoc** to mention `createdAt`/`brand` exist but aren't in summaries.

- [ ] **Step 4: Lint + Commit**

```bash
git add src/data/products.js
npm run lint
git commit -m "feat(data): expand products to ~50; add createdAt+brand; drop dead getProductsByTag"
```

---

### Task 21: Categories + Coupons + Reviews data

**Files:** Create `src/data/categories.js`, `src/data/coupons.js`, `src/data/reviews.js`

- [ ] **Step 1: src/data/categories.js**
```js
/** Category tree for nav, mega-menu, and shop filters. */
export const categories = [
  { slug: 'phones', name: 'Phones', icon: 'Smartphone' },
  { slug: 'computers', name: 'Computers', icon: 'Laptop' },
  { slug: 'audio', name: 'Audio', icon: 'Headphones' },
  { slug: 'wearables', name: 'Wearables', icon: 'Watch' },
  { slug: 'cameras', name: 'Cameras', icon: 'Camera' },
  { slug: 'gaming', name: 'Gaming', icon: 'Gamepad2' },
  { slug: 'accessories', name: 'Accessories', icon: 'Cable' },
  { slug: 'home-lifestyle', name: 'Home & Lifestyle', icon: 'Sofa' },
]
// NOTE: product.category strings must map to these names. If existing data uses
// free-text categories (e.g. "HeadPhones", "Camera"), normalize them in M5
// ShopScreen or migrate the data strings here. For now the mega-menu links to
// /shop?category=<name> using the product.category exact string.
export const getCategoryByName = (name) => categories.find((c) => c.name === name)
```

- [ ] **Step 2: src/data/coupons.js** — TDD the validator
Create `tests/data/coupons.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { validateCoupon } from '../../src/data/coupons'

describe('validateCoupon', () => {
  it('accepts a valid fixed coupon above threshold', () => {
    const r = validateCoupon('SAVE50', 200)
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(50)
  })
  it('accepts a valid percent coupon', () => {
    const r = validateCoupon('SAVE10', 200)
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(20)
  })
  it('rejects below minimum subtotal', () => {
    const r = validateCoupon('SAVE50', 100)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/minimum/i)
  })
  it('rejects unknown code', () => {
    const r = validateCoupon('NOPE', 500)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/invalid/i)
  })
  it('handles freeship', () => {
    const r = validateCoupon('FREESHIP', 100)
    expect(r.valid).toBe(true)
    expect(r.freeShipping).toBe(true)
  })
})
```

- [ ] **Step 3: Run — expect fail** → Run: `npm test -- tests/data/coupons.test.js` → FAIL.

- [ ] **Step 4: Implement src/data/coupons.js**:
```js
/** Mock coupons. Phase C moves validation to backend. */
export const coupons = [
  { code: 'SAVE10', type: 'percent', value: 10, minSubtotal: 0 },
  { code: 'SAVE50', type: 'fixed', value: 50, minSubtotal: 150 },
  { code: 'FREESHIP', type: 'freeship', value: 0, minSubtotal: 0 },
]

/** Returns { valid, discount, freeShipping, message }. */
export function validateCoupon(code, subtotal) {
  const c = coupons.find((x) => x.code === String(code || '').toUpperCase().trim())
  if (!c) return { valid: false, discount: 0, freeShipping: false, message: 'Invalid coupon code.' }
  if (subtotal < c.minSubtotal) return { valid: false, discount: 0, freeShipping: false, message: `Requires a minimum subtotal of $${c.minSubtotal}.` }
  if (c.type === 'freeship') return { valid: true, discount: 0, freeShipping: true, message: 'Free shipping applied.' }
  const discount = c.type === 'percent' ? Math.round(subtotal * (c.value / 100)) : c.value
  return { valid: true, discount, freeShipping: false, message: `$${discount} discount applied.` }
}
```

- [ ] **Step 5: Run — expect pass** → Run: `npm test -- tests/data/coupons.test.js` → all pass.

- [ ] **Step 6: src/data/reviews.js**
```js
/** Mock reviews keyed by product slug. */
export const reviews = {
  'ips-lcd-gaming-monitor': [
    { id: 'r1', author: 'Jamie L.', rating: 5, date: '2026-06-12', title: 'Crisp and fast', body: 'Zero ghosting, colors pop right out of the box.' },
    { id: 'r2', author: 'Riya P.', rating: 4, date: '2026-05-30', title: 'Great for the price', body: 'Stand could be better but the panel is excellent.' },
  ],
  // add a few entries for 3-4 more slugs; default to [] when absent
}
export const getReviews = (slug) => reviews[slug] || []
```

- [ ] **Step 7: Commit**

```bash
git add src/data/categories.js coupons.js reviews.js tests/data/coupons.test.js
npm test
git commit -m "feat(data): categories, coupons (TDD), reviews"
```

---

### Task 22: Rewrite data hooks (useCart, useWishlist, useProducts, useProduct) + add useMediaQuery, useDebounce

**Files:** Modify `src/hooks/useCart.js`, `useWishlist.js`, `useProducts.js`, `useProduct.js`; Create `src/hooks/useMediaQuery.js`, `useDebounce.js`

- [ ] **Step 1: useCart.js** — point at feature slice (selectors/actions now from `../features/cart`). Add `subtotal`, `totalItems`, `count` derived values + the new actions.
```js
import { useSelector, useDispatch } from 'react-redux'
import { addToCart, removeFromCart, updateQuantity, incrementQuantity, decrementQuantity, clearCart } from '../features/cart'

export function useCart() {
  const items = useSelector((s) => s.cart.items)
  const dispatch = useDispatch()
  const totalItems = items.reduce((n, i) => n + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return {
    items, totalItems, subtotal, count: items.length,
    // addToCart(product) or addToCart(product, quantity)
    addToCart: (p, quantity = 1) => dispatch(addToCart(quantity > 1 ? { product: p, quantity } : p)),
    removeFromCart: (id) => dispatch(removeFromCart(id)),
    updateQuantity: (id, q) => dispatch(updateQuantity({ id, quantity: q })),
    increment: (id) => dispatch(incrementQuantity(id)),
    decrement: (id) => dispatch(decrementQuantity(id)),
    clear: () => dispatch(clearCart()),
  }
}
```

- [ ] **Step 2: useWishlist.js**
```js
import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlist, removeFromWishlist, clearWishlist } from '../features/wishlist'

export function useWishlist() {
  const items = useSelector((s) => s.wishlist.items)
  const dispatch = useDispatch()
  return {
    items, count: items.length,
    isInWishlist: (id) => items.some((i) => i.id === id),
    toggle: (p) => dispatch(toggleWishlist(p)),
    remove: (id) => dispatch(removeFromWishlist(id)),
    clear: () => dispatch(clearWishlist()),
    moveAllToCart: (addToCartFn) => items.forEach((p) => addToCartFn(p)),
  }
}
```

- [ ] **Step 3: useProducts.js** — keep return shape (`{ all, todaysDeals, bestsellers, featured }`) but drop unused `featured` if no caller uses it (spec says it's unused) — actually keep it since it's cheap and future-proof; just use summaries.
```js
import { useMemo } from 'react'
import { products, getProductSummaries, getProductSummariesByTag } from '../data/products'

export function useProducts() {
  return useMemo(() => ({
    all: getProductSummaries(),
    todaysDeals: getProductSummariesByTag('todays-deal'),
    bestsellers: getProductSummariesByTag('bestseller'),
    featured: getProductSummariesByTag('featured'),
  }), [])
}
```

- [ ] **Step 4: useProduct.js** — keep signature; ensure it returns full product.
```js
import { getProductBySlug } from '../data/products'
export function useProduct(slug) {
  return getProductBySlug(slug)
}
```

- [ ] **Step 5: useMediaQuery.js**
```js
import { useState, useEffect } from 'react'
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const handler = () => setMatches(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [query])
  return matches
}
```

- [ ] **Step 6: useDebounce.js**
```js
import { useState, useEffect } from 'react'
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
```

- [ ] **Step 7: Lint + Commit**

```bash
git add src/hooks/
npm run lint
git commit -m "feat(hooks): rewire cart/wishlist to feature slices; add useMediaQuery, useDebounce"
```

---
## Milestone 4 — Layout + commerce components

### Task 23: MainLayout (rename + rebuild shell)

**Files:** Create `src/components/layout/main-layout.jsx` (rename from `MainLayout.jsx`); delete old `MainLayout.jsx`

- [ ] **Step 1: src/components/layout/main-layout.jsx**
```jsx
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { CartDrawer } from '../../features/cart/components/cart-drawer'
import { MobileNav } from './mobile-nav'

export function MainLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <MobileNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
```

- [ ] **Step 2: Delete old PascalCase file**

Run: `git rm src/components/layout/MainLayout.jsx`
If `app/router.jsx` imports `MainLayout` from the old path, update it to `from '../components/layout/main-layout'`.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/main-layout.jsx src/app/router.jsx
git rm src/components/layout/MainLayout.jsx
git commit -m "feat(layout): MainLayout shell (Navbar/Footer/MobileNav/CartDrawer)"
```

> NOTE: this task references `Navbar`, `Footer`, `MobileNav`, `CartDrawer` which are built in the following tasks. The app won't render until Task 27. That's expected — commit incrementally.

---

### Task 24: AnnouncementBar + SearchBar + MegaMenu

**Files:** Create `src/components/layout/announcement-bar.jsx`, `search-bar.jsx`, `mega-menu.jsx`

- [ ] **Step 1: announcement-bar.jsx**
```jsx
export function AnnouncementBar() {
  return (
    <div className="bg-[var(--color-content-inv)] text-[var(--color-paper)] text-xs sm:text-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-4 py-2 text-center">
        <span className="font-display font-semibold text-[var(--color-primary)]">Summer Drop</span>
        <span className="opacity-80">— up to 50% off selected tech. Ends soon.</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: search-bar.jsx** (header search → /shop?search=, debounced)
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

export function SearchBar() {
  const [term, setTerm] = useState('')
  const debounced = useDebounce(term, 300)
  const navigate = useNavigate()
  function submit(e) {
    e.preventDefault()
    navigate(`/shop?search=${encodeURIComponent(debounced.trim())}`)
  }
  return (
    <form onSubmit={submit} role="search" className="relative flex-1 max-w-md">
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
      />
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
    </form>
  )
}
```

- [ ] **Step 3: mega-menu.jsx** (desktop category dropdown on hover/focus)
```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/categories'
import * as Icon from 'lucide-react'

export function MegaMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
        onClick={() => setOpen(o => !o)} aria-expanded={open}>
        Categories
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-pop)]">
          {categories.map((c) => {
            const I = Icon[c.icon] || Icon.Tag
            return (
              <Link key={c.slug} to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-primary)]">
                <I className="h-4 w-4" /> {c.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/announcement-bar.jsx search-bar.jsx mega-menu.jsx
git commit -m "feat(layout): AnnouncementBar, SearchBar (debounced), MegaMenu"
```

---

### Task 25: Navbar + MobileNav

**Files:** Create `src/components/layout/navbar.jsx`, `mobile-nav.jsx`

- [ ] **Step 1: navbar.jsx** — announcement bar + main bar (logo, nav links, search, account/wishlist/cart with Redux-driven badges).
```jsx
import { Link, NavLink } from 'react-router-dom'
import { Heart, ShoppingBag, User, Menu } from 'lucide-react'
import { Container } from '../ui/container'
import { Button } from '../ui/button'
import { AnnouncementBar } from './announcement-bar'
import { SearchBar } from './search-bar'
import { MegaMenu } from './mega-menu'
import { useCart, useWishlist } from '../../hooks'
import { useDispatch } from 'react-redux'
import { toggleMobileNav, openCartDrawer } from '../../features/ui'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { totalItems } = useCart()
  const { count: wishCount } = useWishlist()
  const dispatch = useDispatch()
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <AnnouncementBar />
      <Container className="flex h-16 items-center gap-4">
        <button type="button" className="lg:hidden text-[var(--color-text)]" aria-label="Open menu" onClick={() => dispatch(toggleMobileNav())}>
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="font-display text-xl font-black tracking-tight text-[var(--color-text)]">
          EXCLUSIVE<span className="text-[var(--color-primary)]">.</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ml-4">
          <MegaMenu />
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block flex-1 flex justify-center">
          <SearchBar />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Account"><Link to="/login"><User className="h-5 w-5" /></Link></Button>
          <Button asChild variant="ghost" size="icon" aria-label={`Wishlist, ${wishCount} items`} className="relative">
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <Badge count={wishCount} />}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Cart, ${totalItems} items`} className="relative" onClick={() => dispatch(openCartDrawer())}>
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && <Badge count={totalItems} />}
          </Button>
        </div>
      </Container>
      <div className="md:hidden px-4 pb-3"><SearchBar /></div>
    </header>
  )
}

function Badge({ count }) {
  return <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)] nums">{count}</span>
}
```

- [ ] **Step 2: mobile-nav.jsx** — Drawer on the left, controlled by ui slice.
```jsx
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Drawer } from '../ui/drawer'
import { closeMobileNav } from '../../features/ui'
import { categories } from '../../data/categories'

export function MobileNav() {
  const open = useSelector((s) => s.ui.mobileNavOpen)
  const dispatch = useDispatch()
  return (
    <Drawer open={open} onClose={() => dispatch(closeMobileNav())} side="left" title="Menu">
      <nav className="flex flex-col gap-1 p-4" onClick={() => dispatch(closeMobileNav())}>
        <Link to="/" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">Home</Link>
        <Link to="/shop" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">Shop</Link>
        <Link to="/about" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">About</Link>
        <Link to="/contact" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">Contact</Link>
        <div className="my-2 h-px bg-[var(--color-border)]" />
        <p className="px-3 pb-1 text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">Categories</p>
        {categories.map((c) => (
          <Link key={c.slug} to={`/shop?category=${encodeURIComponent(c.name)}`} className="rounded-md px-3 py-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]">{c.name}</Link>
        ))}
      </nav>
    </Drawer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/navbar.jsx mobile-nav.jsx
git commit -m "feat(layout): Navbar (gold wordmark, badges, search) + MobileNav drawer"
```

---

### Task 26: Footer + CartDrawer

**Files:** Create `src/components/layout/footer.jsx`; `src/features/cart/components/cart-drawer.jsx`

- [ ] **Step 1: footer.jsx** — newsletter (real validation + toast), link columns, payment badges, socials.
```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../ui/container'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import toast from 'react-hot-toast'

const cols = [
  { title: 'Shop', links: [['Home', '/'], ['Shop', '/shop'], ['Wishlist', '/wishlist'], ['Cart', '/cart']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq']] },
  { title: 'Legal', links: [['Privacy Policy', '/privacy-policy'], ['Terms of Use', '/terms-of-use']] },
]

export function Footer() {
  const [email, setEmail] = useState('')
  function subscribe(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Enter a valid email address.'); return }
    toast.success('Subscribed. Watch your inbox for drops.')
    setEmail('')
  }
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-xl font-black tracking-tight text-[var(--color-text)]">EXCLUSIVE<span className="text-[var(--color-primary)]">.</span></p>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">Premium tech & lifestyle, curated and showcased. Get early access to drops.</p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2 max-w-sm">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for drops" aria-label="Email address" className="h-10" />
              <Button type="submit" size="md" className="shrink-0">Subscribe</Button>
            </form>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-display text-sm font-bold text-[var(--color-text)]">{c.title}</h3>
              <ul className="mt-3 space-y-2">
                {c.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-subtle)]">© {new Date().getFullYear()} Exclusive. All rights reserved.</p>
          <div className="flex gap-2 text-xs text-[var(--color-text-subtle)]">
            <span className="rounded border border-[var(--color-border)] px-2 py-1">VISA</span>
            <span className="rounded border border-[var(--color-border)] px-2 py-1">MC</span>
            <span className="rounded border border-[var(--color-border)] px-2 py-1">bKash</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 2: src/features/cart/components/cart-drawer.jsx** — quick cart from navbar, controlled by ui slice.
```jsx
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Drawer, Button, QuantityStepper, EmptyState, Price } from '../../../components/ui'
import { closeCartDrawer } from '../../ui'
import { useCart } from '../../../hooks'
import { formatPrice } from '../../../lib/format'
import { ShoppingBag } from 'lucide-react'

export function CartDrawer() {
  const open = useSelector((s) => s.ui.cartDrawerOpen)
  const dispatch = useDispatch()
  const { items, subtotal, totalItems, updateQuantity: upd, removeFromCart: rm } = useCart()
  return (
    <Drawer open={open} onClose={() => dispatch(closeCartDrawer())} side="right" title={`Cart (${totalItems})`}>
      {items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Browse the showroom and add something you love."
            action={<Button asChild onClick={() => dispatch(closeCartDrawer())}><Link to="/shop">Shop now</Link></Button>} />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[var(--color-border)] px-4">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <img src={i.image} alt={i.name} className="h-16 w-16 rounded-md object-cover bg-[var(--color-surface-2)]" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${i.slug}`} onClick={() => dispatch(closeCartDrawer())} className="block truncate text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]">{i.name}</Link>
                  <p className="text-xs text-[var(--color-text-muted)] nums">{formatPrice(i.price)}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <QuantityStepper size="sm" value={i.quantity} min={1} max={i.stock || 99} onChange={(q) => upd(i.id, q)} />
                    <button onClick={() => rm(i.id)} className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">Remove</button>
                  </div>
                </div>
                <p className="font-display text-sm font-bold nums text-[var(--color-text)]">{formatPrice(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--color-border)] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Subtotal</span>
              <Price price={subtotal} size="md" showDiscount={false} />
            </div>
            <Button asChild className="w-full" onClick={() => dispatch(closeCartDrawer())}><Link to="/cart">View cart</Link></Button>
            <Button asChild variant="outline" className="mt-2 w-full" onClick={() => dispatch(closeCartDrawer())}><Link to="/checkout">Checkout</Link></Button>
          </div>
        </>
      )}
    </Drawer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/footer.jsx src/features/cart/components/cart-drawer.jsx
git commit -m "feat(layout): Footer (newsletter+socials) + CartDrawer (quick cart)"
```

---

### Task 27: ProductCard + ProductGrid + ProductGallery + ProductOptions + RelatedProducts

**Files:** Create `src/components/product/product-card.jsx`, `product-grid.jsx`, `product-gallery.jsx`, `product-options.jsx`, `related-products.jsx`; Delete `src/components/product/AddToCartButton.jsx`

- [ ] **Step 1: product-card.jsx** — the showroom card (signature: gold hairline frame lights on hover). Variant `wishlist` adds move-to-cart. One card everywhere.
```jsx
import { Link } from 'react-router-dom'
import { Heart, Eye, ShoppingBag } from 'lucide-react'
import { Price, Rating, Badge } from '../ui'
import { discountPercent } from '../../lib/format'
import { useCart, useWishlist } from '../../hooks'
import toast from 'react-hot-toast'
import { cn } from '../../lib/cn'

export function ProductCard({ product, variant = 'default', className }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const wished = isInWishlist(product.id)
  const pct = discountPercent(product.originalPrice, product.price)
  const isNew = (product.tags || []).includes('new')

  function onAdd(e) {
    e.preventDefault()
    addToCart(product)
    toast.success(`${product.name} added to cart`)
  }
  function onWish(e) {
    e.preventDefault()
    toggle(product)
    toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist')
  }

  return (
    <Link to={`/product/${product.slug}`} className={cn('group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card)]', className)}>
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
        <img src={product.image} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {pct > 0 && <Badge tone="sale">-{pct}%</Badge>}
          {isNew && <Badge tone="gold">NEW</Badge>}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <button onClick={onWish} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg)]/70 text-[var(--color-text-muted)] backdrop-blur hover:text-[var(--color-primary)]">
            <Heart className="h-4 w-4" fill={wished ? 'var(--color-sale)' : 'none'} stroke={wished ? 'var(--color-sale)' : 'currentColor'} />
          </button>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg)]/70 text-[var(--color-text-muted)] backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4" />
          </span>
        </div>
        {variant === 'default' && (
          <button onClick={onAdd}
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-[var(--color-content-inv)] py-2.5 text-sm font-medium text-[var(--color-paper)] translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">{product.name}</h3>
        <Rating value={product.rating} size={14} />
        <Price price={product.price} originalPrice={product.originalPrice} size="md" className="mt-1" />
        {variant === 'wishlist' && (
          <button onClick={onAdd} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-border-strong)] py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
            <ShoppingBag className="h-3.5 w-3.5" /> Move to cart
          </button>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: product-grid.jsx** (responsive + skeleton state)
```jsx
import { Skeleton } from '../ui'
import { ProductCard } from './product-card'
import { cn } from '../../lib/cn'

export function ProductGrid({ products, loading, variant, columns = 4, className }) {
  const cols = { 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4', 5: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' }
  if (loading) {
    return <div className={cn('grid gap-4', cols[columns], className)}>
      {Array.from({ length: columns === 5 ? 5 : 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="mt-3 h-3 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  }
  return (
    <div className={cn('grid gap-4', cols[columns], className)}>
      {products.map((p) => <ProductCard key={p.id} product={p} variant={variant} />)}
    </div>
  )
}
```

- [ ] **Step 3: product-gallery.jsx** (main image + thumbnails, used by ProductDetail)
```jsx
import { useState } from 'react'
import { cn } from '../../lib/cn'

export function ProductGallery({ images = [], alt }) {
  const [active, setActive] = useState(0)
  const safe = images.length ? images : ['/images/products/monitor.png']
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <img src={safe[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {safe.length > 1 && (
        <div className="flex gap-2">
          {safe.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
              className={cn('h-16 w-16 overflow-hidden rounded-md border-2 bg-[var(--color-surface-2)]', i === active ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]')}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: product-options.jsx** (color swatches + size radio, stock-aware) — props: `colors, sizes, selectedColor, selectedSize, onSelectColor, onSelectSize, stock`
```jsx
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function ProductOptions({ colors = [], sizes = [], selectedColor, selectedSize, onSelectColor, onSelectSize }) {
  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const sel = selectedColor?.name === c.name
              return (
                <button key={c.name} type="button" aria-label={c.name} onClick={() => onSelectColor(c)} title={c.name}
                  className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full border-2', sel ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]')}
                  style={{ backgroundColor: c.value }}>
                  {sel && <Check className="h-4 w-4 text-white mix-blend-difference" strokeWidth={3} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Option</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const sel = selectedSize === s
              return (
                <button key={s} type="button" onClick={() => onSelectSize(s)} disabled={false}
                  className={cn('rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 disabled:pointer-events-none',
                    sel ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]')}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: related-products.jsx** (uses ProductGrid)
```jsx
import { ProductGrid } from './product-grid'
import { Section, Container, Breadcrumb } from '../ui' // Section/Container for spacing
export function RelatedProducts({ products, currentId }) {
  const related = products.filter((p) => p.id !== currentId).slice(0, 4)
  if (related.length === 0) return null
  return (
    <section className="py-12">
      <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-text)]">You might also like</h2>
      <ProductGrid products={related} columns={4} />
    </section>
  )
}
```

- [ ] **Step 6: Delete the unused AddToCartButton**

Run: `git rm src/components/product/AddToCartButton.jsx`

- [ ] **Step 7: Lint + Commit**

```bash
git add src/components/product/
git rm src/components/product/AddToCartButton.jsx
npm run lint
git commit -m "feat(product): showroom ProductCard + grid/gallery/options/related; drop AddToCartButton"
```

---
## Milestone 5 — Screens (rebuilt thin compositions, fully functional)

> Pattern per screen: `Container` + `Section` composition; pull data via hooks; dispatch to Redux; URL state via `useSearchParams` where filters matter. Rebuild the existing screen file in place (keep the export default so router imports don't change).

### Task 28: NotFoundScreen

**Files:** Modify `src/screens/NotFoundScreen.jsx`

- [ ] **Step 1: Rebuild** — full-bleed midnight 404 with the gold wordmark accent; CTA back to shop.
```jsx
import { Link } from 'react-router-dom'
import { Button, Container } from '../components/ui'

export default function NotFoundScreen() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-black tracking-tighter text-[var(--color-primary)] nums">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-text)]">This page took a different exit</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">The link may be broken or the page may have moved. Let's get you back to the showroom.</p>
      <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
    </Container>
  )
}
```

- [ ] **Step 2: Lint + Commit**

```bash
git add src/screens/NotFoundScreen.jsx
npm run lint
git commit -m "feat(screen): 404 NotFound in Midnight Showroom"
```

---

### Task 29: HomeScreen + home sections

**Files:** Modify `src/screens/HomeScreen.jsx`; rebuild all `src/components/home/*.jsx` (HeroSection, FlashSales, BrowseCategories, BestSelling, ExploreProducts, MusicPromo, NewArrivals, ServiceFeatures)

- [ ] **Step 1: Compose HomeScreen** with sections in a deliberate rhythm (signature hero first). Each section uses `Container`/`Section`.
```jsx
import { Container } from '../components/ui'
import { HeroSection } from '../components/home/hero-section'
import { FlashSales } from '../components/home/flash-sales'
import { BrowseCategories } from '../components/home/browse-categories'
import { BestSelling } from '../components/home/best-selling'
import { ExploreProducts } from '../components/home/explore-products'
import { NewArrivals } from '../components/home/new-arrivals'
import { ServiceFeatures } from '../components/home/service-features'

export default function HomeScreen() {
  return (
    <>
      <HeroSection />
      <Container className="divide-y divide-[var(--color-border)]">
        <FlashSales />
        <BrowseCategories />
        <BestSelling />
        <ExploreProducts />
        <NewArrivals />
        <ServiceFeatures />
      </Container>
    </>
  )
}
```

- [ ] **Step 2: hero-section.jsx** — the signature. The **product is the thesis**: a featured drop with countdown, not a headline+gradient. Use a featured product (first `featured` summary) on a midnight stage with a gold hairline.
```jsx
import { Link } from 'react-router-dom'
import { Button, Container, Price } from '../ui'
import { useProducts } from '../../hooks'
import { useCountdown } from '../../hooks/useCountdown'

export function HeroSection() {
  const { featured } = useProducts()
  const drop = featured[0]
  const target = useStableTarget(2 * 24 * 60 * 60 * 1000) // 2 days
  const t = useCountdown(target)
  if (!drop) return null
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <Container className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
            <span className="h-px w-6 bg-[var(--color-primary)]" /> Featured Drop
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">{drop.name}</h1>
          <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">Showcased this week only. Premium build, limited stock — engineered to stand out.</p>
          <div className="mt-6 flex items-center gap-4">
            <Price price={drop.price} originalPrice={drop.originalPrice} size="xl" />
            <Button asChild size="lg"><Link to={`/product/${drop.slug}`}>Shop the drop</Link></Button>
          </div>
          <div className="mt-8 flex gap-4">
            {[['Days', t.days], ['Hrs', t.hours], ['Min', t.minutes], ['Sec', t.seconds]].map(([label, val]) => (
              <div key={label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-center">
                <p className="font-display text-2xl font-bold nums text-[var(--color-text)]">{String(val).padStart(2, '0')}</p>
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square max-w-md rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)]">
            <div className="absolute inset-2 rounded-md border border-[var(--color-primary)]/20" />
            <img src={drop.image} alt={drop.name} className="relative h-full w-full rounded-md object-cover" />
          </div>
        </div>
      </Container>
    </section>
  )
}
```
(import `useStableTarget` from the existing `useCountdown` hook.)

- [ ] **Step 3: flash-sales.jsx** — live countdown + grid of `todaysDeals` (ProductGrid). Use `useCountdown`/`useStableTarget` (3-day target). Strip the broken carousel; show a responsive grid with a "View all" CTA.
- [ ] **Step 4: browse-categories.jsx** — map `categories` to cards linking to `/shop?category=`. lucide icon per category (`Icon[c.icon]`).
- [ ] **Step 5: best-selling.jsx** — `bestsellers.slice(0,4)` via ProductGrid + "View all" Button.
- [ ] **Step 6: explore-products.jsx** — "Show more" local pagination (PAGE_SIZE 8) over `all`; remove the decorative non-functional arrows.
- [ ] **Step 7: new-arrivals.jsx** — featured/new promo cards (PS5-style large + collections), hover-zoom, "Shop now".
- [ ] **Step 8: service-features.jsx** — Free Delivery / 24-7 Service / Money Back strip with lucide icons.
- [ ] **Step 9: Lint + Commit** (one commit per the rebuild; if too large, commit section files together)
```bash
git add src/screens/HomeScreen.jsx src/components/home/
npm run lint
git commit -m "feat(home): rebuild HomeScreen + 8 sections in Midnight Showroom"
```

---

### Task 30: ShopScreen (filters/sort/pagination/search, URL-synced)

**Files:** Modify `src/screens/ShopScreen.jsx`

- [ ] **Step 1: Rebuild** — read `?search, ?category, ?sort, ?page, ?minPrice, ?maxPrice, ?minRating, ?inStock` from `useSearchParams`; run `applyShopQuery(getProductSummaries(), query)`; render filters sidebar (category list, price range inputs, rating select, in-stock Switch), sort Select, ProductGrid, Pagination. Every control writes back to the URL.
```jsx
import { useSearchParams } from 'react-router-dom'
import { Container, Section, Breadcrumb, Select, Switch, Pagination, EmptyState, ProductGrid } from '../components/ui'
import { getProductSummaries } from '../data/products'
import { categories } from '../data/categories'
import { applyShopQuery } from '../features/shop'
import { PER_PAGE } from '../lib/constants'
import { Search } from 'lucide-react'

const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
]

export default function ShopScreen() {
  const [params, setParams] = useSearchParams()
  const q = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || '',
    page: Number(params.get('page')) || 1,
    perPage: PER_PAGE,
    minPrice: Number(params.get('minPrice')) || 0,
    maxPrice: Number(params.get('maxPrice')) || Infinity,
    minRating: Number(params.get('minRating')) || 0,
    inStockOnly: params.get('inStock') === '1',
  }
  const { items, pagination } = applyShopQuery(getProductSummaries(), q)
  function set(key, val) {
    const next = new URLSearchParams(params)
    if (val === '' || val == null) next.delete(key)
    else next.set(key, val)
    if (key !== 'page') next.delete('page') // reset page on filter change
    setParams(next)
  }
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} className="mb-4" />
      <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Shop the showroom</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{pagination.total} product{pagination.total !== 1 ? 's' : ''}{q.search ? ` matching “${q.search}”` : ''}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Category</h2>
            <ul className="space-y-1">
              <li><button onClick={() => set('category', '')} className={`text-sm ${!q.category ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>All</button></li>
              {categories.map((c) => (
                <li key={c.slug}><button onClick={() => set('category', c.name)} className={`text-sm ${q.category === c.name ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>{c.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Price</h2>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" defaultValue={q.minPrice || ''} onBlur={(e) => set('minPrice', e.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-sm text-[var(--color-text)]" />
              <input type="number" placeholder="Max" defaultValue={q.maxPrice === Infinity ? '' : q.maxPrice} onBlur={(e) => set('maxPrice', e.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-sm text-[var(--color-text)]" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Rating</h2>
            <Select value={String(q.minRating)} onChange={(v) => set('minRating', v)} options={[{value:'0',label:'Any'},{value:'4',label:'4.0 +'},{value:'4.5',label:'4.5 +'}]} />
          </div>
          <Switch checked={q.inStockOnly} onChange={(c) => set('inStock', c ? '1' : '')} label="In stock only" />
        </aside>
        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">Page {pagination.page} of {pagination.pageCount}</p>
            <div className="w-48"><Select value={q.sort} onChange={(v) => set('sort', v)} options={SORTS} /></div>
          </div>
          {items.length === 0 ? (
            <EmptyState icon={Search} title="No products match" description="Try widening your filters or clearing the search." />
          ) : (
            <>
              <ProductGrid products={items} columns={3} />
              <Pagination className="mt-8" page={pagination.page} pageCount={pagination.pageCount} onChange={(p) => set('page', String(p))} />
            </>
          )}
        </div>
      </div>
    </Container>
  )
}
```

- [ ] **Step 2: Lint + Commit**

```bash
git add src/screens/ShopScreen.jsx
npm run lint
git commit -m "feat(screen): ShopScreen with URL-synced filters/sort/pagination/search"
```

---

### Task 31: ProductDetailScreen

**Files:** Modify `src/screens/ProductDetailScreen.jsx`

- [ ] **Step 1: Rebuild** — `useProduct(slug)`; if none → `<NotFoundScreen/>`. Layout: ProductGallery (left) + info (right): title, Rating + review count, Price (xl), stock badge, ProductOptions (color/size with local state), QuantityStepper, Buy Now/Add to cart (both dispatch + toast; Buy Now also navigates to /checkout), delivery info box. Below: tabs (Description / Reviews via `getReviews`). RelatedProducts.
```jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Breadcrumb, Button, Price, Rating, Badge, QuantityStepper, Tabs, ProductGallery, EmptyState } from '../components/ui'
import { ProductOptions, RelatedProducts } from '../components/product'
import { useProduct, useProducts, useCart, useWishlist } from '../hooks'
import { getReviews } from '../data/reviews'
import { NotFoundScreen } from './NotFoundScreen'
import toast from 'react-hot-toast'
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react'

export default function ProductDetailScreen() {
  const { slug } = useParams()
  const product = useProduct(slug)
  const { all } = useProducts()
  const { addToCart } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const navigate = useNavigate()
  const [color, setColor] = useState(product?.colors?.[0])
  const [size, setSize] = useState(product?.sizes?.[0])
  const [qty, setQty] = useState(1)

  if (!product) return <NotFoundScreen />
  const wished = isInWishlist(product.id)

  function add() { addToCart(product, qty); toast.success(`${product.name} added to cart`) }
  function buyNow() { add(); navigate('/checkout') }
  function wish() { toggle(product); toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist') }

  const reviews = getReviews(product.slug)
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: product.name }]} className="mb-6" />
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Rating value={product.rating} />
              <span className="text-sm text-[var(--color-text-muted)]">({product.reviews} reviews)</span>
            </div>
          </div>
          <Price price={product.price} originalPrice={product.originalPrice} size="xl" />
          <div className="flex items-center gap-2">
            {product.stock > 0 ? <Badge tone="success">In stock</Badge> : <Badge tone="sale">Out of stock</Badge>}
            <span className="text-sm text-[var(--color-text-subtle)] nums">{product.stock} available</span>
          </div>
          <ProductOptions colors={product.colors} sizes={product.sizes} selectedColor={color} selectedSize={size} onSelectColor={setColor} onSelectSize={setSize} />
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper value={qty} min={1} max={product.stock || 99} onChange={setQty} />
            <Button onClick={add} disabled={product.stock === 0}>Add to cart</Button>
            <Button variant="sale" onClick={buyNow} disabled={product.stock === 0}>Buy now</Button>
            <Button variant="ghost" size="icon" aria-label="Wishlist" onClick={wish}><Heart fill={wished ? 'var(--color-sale)' : 'none'} stroke={wished ? 'var(--color-sale)' : 'currentColor'} /></Button>
          </div>
          <ul className="mt-2 grid gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)] sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[var(--color-primary)]" /> Free delivery</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" /> 2-year warranty</li>
            <li className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[var(--color-primary)]" /> 30-day returns</li>
          </ul>
        </div>
      </div>
      <div className="mt-12">
        <Tabs tabs={[
          { label: 'Description', content: <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">{product.description}</p> },
          { label: `Reviews (${reviews.length})`, content: reviews.length ? (
            <ul className="space-y-4 max-w-2xl">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between"><span className="font-medium text-[var(--color-text)]">{r.author}</span><Rating value={r.rating} size={14} /></div>
                  <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{r.date}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{r.body}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-[var(--color-text-muted)]">No reviews yet.</p> },
        ]} />
      </div>
      <RelatedProducts products={all} currentId={product.id} />
    </Container>
  )
}
```
Add `import { Heart } from 'lucide-react'` at top.

- [ ] **Step 2: Lint + Commit**

```bash
git add src/screens/ProductDetailScreen.jsx
npm run lint
git commit -m "feat(screen): ProductDetailScreen (gallery/options/reviews/related)"
```

---

### Task 32: CartScreen

**Files:** Modify `src/screens/CartScreen.jsx`

- [ ] **Step 1: Rebuild** — cart table (image/name/price/QuantityStepper/subtotal/remove), empty state with shop CTA, **coupon field validated via `validateCoupon`**, totals (subtotal, discount, shipping — free over `FREE_SHIP_THRESHOLD`), "Proceed to checkout". All from `useCart`.
```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Button, QuantityStepper, Price, EmptyState, Input, Breadcrumb } from '../components/ui'
import { useCart } from '../hooks'
import { validateCoupon } from '../data/coupons'
import { formatPrice, formatPriceNum } from '../lib/format'
import { SHIPPING_FEE, FREE_SHIP_THRESHOLD } from '../lib/constants'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CartScreen() {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart } = useCart()
  const [code, setCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const discount = coupon?.discount || 0
  const freeShip = coupon?.freeShipping || subtotal >= FREE_SHIP_THRESHOLD
  const shipping = items.length === 0 || freeShip ? 0 : SHIPPING_FEE
  const total = Math.max(0, subtotal - discount) + shipping

  function applyCoupon(e) {
    e.preventDefault()
    const r = validateCoupon(code, subtotal)
    if (r.valid) { setCoupon(r); toast.success(r.message) }
    else { setCoupon(null); toast.error(r.message) }
  }

  if (items.length === 0) {
    return <Container className="py-16"><EmptyState icon={ShoppingBag} title="Your cart is empty" description="Browse the showroom and add something you love." action={<Button asChild><Link to="/shop">Shop now</Link></Button>} /></Container>
  }
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} className="mb-4" />
      <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Cart ({totalItems})</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 p-4">
              <Link to={`/product/${i.slug}`}><img src={i.image} alt={i.name} className="h-20 w-20 rounded-md object-cover bg-[var(--color-surface-2)]" /></Link>
              <div className="flex flex-1 flex-col">
                <Link to={`/product/${i.slug}`} className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]">{i.name}</Link>
                <span className="text-xs text-[var(--color-text-subtle)] nums">{formatPrice(i.price)}</span>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <QuantityStepper size="sm" value={i.quantity} min={1} max={i.stock || 99} onChange={(q) => updateQuantity(i.id, q)} />
                  <button onClick={() => removeFromCart(i.id)} className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">Remove</button>
                </div>
              </div>
              <p className="font-display font-bold nums text-[var(--color-text)]">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Order summary</h2>
          <form onSubmit={applyCoupon} className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="h-10" />
            <Button type="submit" variant="outline" className="shrink-0">Apply</Button>
          </form>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Subtotal</dt><dd className="nums">{formatPrice(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-[var(--color-success)]"><dt>Discount</dt><dd className="nums">-{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Shipping</dt><dd className="nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-display text-base font-bold"><dt>Total</dt><dd className="nums">{formatPrice(total)}</dd></div>
          </dl>
          <Button asChild className="w-full"><Link to="/checkout">Proceed to checkout</Link></Button>
        </aside>
      </div>
    </Container>
  )
}
```
(If `formatPriceNum` isn't used, drop the import — keep `formatPrice` only.)

- [ ] **Step 2: Lint + Commit**

```bash
git add src/screens/CartScreen.jsx
npm run lint
git commit -m "feat(screen): CartScreen with coupon validation + live totals"
```

---

### Task 33: CheckoutScreen (validated form + confirmation)

**Files:** Modify `src/screens/CheckoutScreen.jsx`

- [ ] **Step 1: Rebuild** — warm `.surface-paper` panel for readability; contact + shipping + payment (RadioGroup: Card/COD); order summary from cart; "Place order" validates required fields + email format, then shows a confirmation state (order id generated, clears cart). Empty-cart guard → redirect/empty state.
```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Button, Input, RadioGroup, Price, Breadcrumb, EmptyState } from '../components/ui'
import { useCart } from '../hooks'
import { SHIPPING_FEE, FREE_SHIP_THRESHOLD } from '../lib/constants'
import { formatPrice } from '../lib/format'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'

const empty = { name: '', email: '', address: '', city: '', zip: '', country: '' }

export default function CheckoutScreen() {
  const { items, subtotal, totalItems, clear } = useCart()
  const [form, setForm] = useState(empty)
  const [payment, setPayment] = useState('card')
  const [errors, setErrors] = useState({})
  const [placed, setPlaced] = useState(null) // { id, total }

  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  if (items.length === 0 && !placed) {
    return <Container className="py-16"><EmptyState icon={ShoppingBag} title="Nothing to check out" description="Your cart is empty." action={<Button asChild><Link to="/shop">Shop now</Link></Button>} /></Container>
  }
  if (placed) {
    return <Container className="py-16 text-center">
      <p className="font-display text-5xl font-black text-[var(--color-primary)]">✓</p>
      <h1 className="mt-4 font-display text-3xl font-black text-[var(--color-text)]">Order confirmed</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Order <span className="nums text-[var(--color-text)]">{placed.id}</span> — {formatPrice(placed.total)}. A confirmation is on its way to {placed.email}.</p>
      <Button asChild className="mt-6"><Link to="/shop">Continue shopping</Link></Button>
    </Container>
  }
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }
  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.zip.trim()) e.zip = 'Required'
    if (!form.country.trim()) e.country = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function placeOrder(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    const id = 'EX-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    setPlaced({ id, total, email: form.email })
    clear()
    toast.success('Order placed!')
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} className="mb-4" />
      <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="surface-paper space-y-4 rounded-lg p-6">
          <h2 className="font-display text-lg font-bold text-[var(--color-content-inv)]">Shipping details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} className="sm:col-span-2" />
            <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
            <Input label="ZIP / Postal" value={form.zip} onChange={(e) => set('zip', e.target.value)} error={errors.zip} />
            <Input label="Country" value={form.country} onChange={(e) => set('country', e.target.value)} error={errors.country} className="sm:col-span-2" />
          </div>
          <div className="pt-2"><RadioGroup label="Payment" value={payment} onChange={setPayment} options={[{ value: 'card', label: 'Credit / Debit card' }, { value: 'cod', label: 'Cash on delivery' }]} /></div>
        </div>
        <aside className="h-fit space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Your order</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between"><span className="text-[var(--color-text-muted)]">{i.name} × {i.quantity}</span><span className="nums">{formatPrice(i.price * i.quantity)}</span></li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Subtotal</dt><dd className="nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Shipping</dt><dd className="nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between font-display text-base font-bold"><dt>Total</dt><dd className="nums">{formatPrice(total)}</dd></div>
          </dl>
          <Button type="submit" variant="sale" className="w-full">Place order</Button>
        </aside>
      </form>
    </Container>
  )
}
```

- [ ] **Step 2: Lint + Commit**

```bash
git add src/screens/CheckoutScreen.jsx
npm run lint
git commit -m "feat(screen): CheckoutScreen (validated form + order confirmation)"
```

---

### Task 34: WishlistScreen (uses shared ProductCard variant)

**Files:** Modify `src/screens/WishlistScreen.jsx`

- [ ] **Step 1: Rebuild** — drop the local `WishlistCard`; use `<ProductCard variant="wishlist" />`. Header with Clear all + a "Just for you" recommended grid (`all` filtered to non-wishlisted, slice 4). Empty state.
```jsx
import { Link } from 'react-router-dom'
import { Container, Button, EmptyState, Breadcrumb } from '../components/ui'
import { ProductGrid } from '../components/product/product-grid'
import { ProductCard } from '../components/product/product-card'
import { useWishlist, useProducts } from '../hooks'
import { Heart } from 'lucide-react'

export default function WishlistScreen() {
  const { items, count, clear } = useWishlist()
  const { all } = useProducts()
  const recommended = all.filter((p) => !items.some((i) => i.id === p.id)).slice(0, 4)
  if (items.length === 0) {
    return <Container className="py-16"><EmptyState icon={Heart} title="Your wishlist is empty" description="Tap the heart on any product to save it here." action={<Button asChild><Link to="/shop">Find something you love</Link></Button>} /></Container>
  }
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} className="mb-4" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Wishlist ({count})</h1>
        <Button variant="outline" onClick={clear}>Clear all</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} variant="wishlist" />)}
      </div>
      <section className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-text)]">Just for you</h2>
        <ProductGrid products={recommended} columns={4} />
      </section>
    </Container>
  )
}
```

- [ ] **Step 2: Lint + Commit**

```bash
git add src/screens/WishlistScreen.jsx
npm run lint
git commit -m "feat(screen): WishlistScreen using shared ProductCard (no more WishlistCard)"
```

---

### Task 35: LoginScreen + SignUpScreen (real validation)

**Files:** Modify `src/screens/LoginScreen.jsx`, `SignUpScreen.jsx`

- [ ] **Step 1: LoginScreen** — split layout: midnight promo panel left, form right (Input with error states). Validate email + password length; on success dispatch `loginSuccess({ email })` (mock) + navigate home + toast. Links to /sign-up.
- [ ] **Step 2: SignUpScreen** — same shell; validate name/email/password(min 6)/confirm match; on success dispatch `loginSuccess` + toast + navigate.
- [ ] **Step 3: Lint + Commit**
```bash
git add src/screens/LoginScreen.jsx src/screens/SignUpScreen.jsx
npm run lint
git commit -m "feat(screen): Login/SignUp with real client-side validation"
```

---

### Task 36: AboutScreen + ContactScreen

**Files:** Modify `src/screens/AboutScreen.jsx`, `ContactScreen.jsx`; rebuild `src/components/about/*`

- [ ] **Step 1: AboutScreen** composes OurStory + SiteStats + TeamMembers + ServiceFeatures, all rebuilt in midnight theme (gold accents, warm/cool panels).
- [ ] **Step 2: ContactScreen** — left contact details (call/write, lucide icons), right message form (Input/Textarea) with real validation + success toast (no backend yet).
- [ ] **Step 3: Lint + Commit**
```bash
git add src/screens/AboutScreen.jsx src/screens/ContactScreen.jsx src/components/about/
npm run lint
git commit -m "feat(screen): About + Contact screens rebuilt"
```

---

### Task 37: ContentPage + FaqScreen

**Files:** Modify `src/screens/ContentPage.jsx`, `FaqScreen.jsx`

- [ ] **Step 1: ContentPage** — warm `.surface-paper` panel for readable legal text; render title/intro/sections from `policySections`/`termsSections` (still from `siteContent.js`). Breadcrumb.
- [ ] **Step 2: FaqScreen** — use the new `Accordion` primitive with `faqs` data. Breadcrumb + intro.
- [ ] **Step 3: Lint + Commit**
```bash
git add src/screens/ContentPage.jsx src/screens/FaqScreen.jsx
npm run lint
git commit -m "feat(screen): ContentPage + FaqScreen (Accordion) rebuilt"
```

---

### Task 38: Hooks cleanup — verify useCountdown API still used

**Files:** Verify `src/hooks/useCountdown.js` exports `useCountdown`, `useStableTarget`, `pad`, `DURATIONS` (it does).

- [ ] **Step 1: Confirm no broken references** — Run: `grep -rn "useStableTarget\|useCountdown" src/` → all resolve to `useCountdown.js`.

- [ ] **Step 2: Commit (if any touchups)** — `git commit -am "chore(hooks): useCountdown verified"` (skip if no changes).

---

### Task 39: Update router (drop AdminScreen; verify all routes)

**Files:** Modify `src/app/router.jsx`

- [ ] **Step 1: Remove AdminScreen route + import** from `app/router.jsx` (AdminScreen file deleted in Task 41, but remove the import now to avoid a broken build mid-cleanup).

- [ ] **Step 2: Verify all 13 routes present**: `/`, `/shop`, `/product/:slug`, `/cart`, `/checkout`, `/wishlist`, `/login`, `/sign-up`, `/about`, `/contact`, `/faq`, `/privacy-policy`, `/terms-of-use`, `*`.

- [ ] **Step 3: Commit**
```bash
git add src/app/router.jsx
git commit -m "chore(router): drop demo AdminScreen route; verify 13 routes"
```

---

### Task 40: Run dev server + manual smoke test of all screens

- [ ] **Step 1: Start dev server** — Run: `npm run dev`
- [ ] **Step 2: Manually verify each route** at localhost:
  - Home: hero countdown ticks, sections render, add-to-cart works, wishlist toggles.
  - Shop: change each filter/sort/page → URL updates, results update, pagination works, search from navbar filters.
  - Product detail: gallery thumbnails switch, color/size select, qty, add + buy now, reviews/related render.
  - Cart: qty updates totals, coupon `SAVE10` works, remove item, free shipping over threshold.
  - Checkout: required validation blocks submit, valid submit → confirmation, cart cleared, empty-cart guard.
  - Wishlist: add/remove, move-to-cart, clear all, recommended grid.
  - Login/Signup: validation errors + success.
  - About/Contact/FAQ/Privacy/Terms/404: render correctly, contact form validates.
  - Refresh page: cart & wishlist persist (localStorage).
  - Resize to 360px: mobile nav drawer, search below bar, grids collapse to 2 cols.

- [ ] **Step 2: Commit any fixes discovered** (each fix its own commit).

---
## Milestone 6 — Cleanup + verification

### Task 41: Delete demo AdminScreen + dead assets

**Files:** Delete `src/screens/AdminScreen.jsx`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/context/` (empty dir)

- [ ] **Step 1: Delete files**

Run:
```bash
git rm src/screens/AdminScreen.jsx
git rm src/assets/react.svg src/assets/vite.svg
# remove empty context dir if present
rmdir src/context 2>/dev/null || true
git rm -r src/context 2>/dev/null || true
```

- [ ] **Step 2: Verify nothing imports them**

Run: `grep -rn "AdminScreen\|react.svg\|vite.svg\|src/context" src/` → Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(cleanup): remove demo AdminScreen + leftover template assets + empty context/"
```

---

### Task 42: Remove Poppins font package + verify no imports remain

**Files:** Modify `package.json`; verify `src/main.jsx`, `src/index.css`, `src/components/**`

- [ ] **Step 1: Uninstall Poppins**

Run: `npm uninstall @fontsource/poppins`

- [ ] **Step 2: Verify no references**

Run: `grep -rn "poppins\|Poppins" src/` → Expected: no matches (Task 7 already removed the import from main.jsx; index.css Task 4 dropped `--font-poppins`).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): drop Poppins (Satoshi + Inter only)"
```

---

### Task 43: Final cross-check — no antd, no dead code, no unused exports

- [ ] **Step 1: No antd anywhere**

Run: `grep -rn "from 'antd'\|from \"antd\"\|@ant-design" src/` → Expected: no matches.

- [ ] **Step 2: No stale store/slices imports**

Run: `grep -rn "store/slices" src/` → Expected: no matches.

- [ ] **Step 3: No leftover dead getters**

Run: `grep -rn "getProductsByTag" src/` → Expected: no matches.

- [ ] **Step 4: Every ui primitive is imported somewhere**

Run: `for f in button input textarea label select checkbox radio-group switch badge avatar separator skeleton spinner rating tabs accordion dialog drawer tooltip breadcrumb pagination container section empty-state quantity-stepper price; do c=$(grep -rl "from.*['\"].*$f['\"]" src/ | wc -l); echo "$f: $c"; done`
Expected: each ≥ 1 (the barrel index.js counts). Investigate any 0.

- [ ] **Step 5: No empty files / 0-byte files**

Run: `find src -type f -empty` → Expected: no output.

- [ ] **Step 6: No TODO/FIXME/console.log left behind**

Run: `grep -rn "TODO\|FIXME\|console.log" src/` → Expected: none (or only intentional, documented ones).

- [ ] **Step 7: Commit any cleanup** discovered (each its own commit).

---

### Task 44: Build + lint + test green; rewrite README

**Files:** `npm run build`, `npm run lint`, `npm test`; Rewrite `README.md`

- [ ] **Step 1: Build**

Run: `npm run build` → Expected: builds successfully, no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint` → Expected: no errors.

- [ ] **Step 3: Tests**

Run: `npm test` → Expected: all logic tests pass (cn, format, shop selectors, coupons, cart slice, wishlist slice, products sanity).

- [ ] **Step 4: Rewrite README.md** (currently the unmodified Vite template) with a real project readme: name, what it is, the "Midnight Showroom" design note, stack, scripts (`dev`, `build`, `lint`, `test`, `test:watch`, `preview`), folder structure, the Phase B/C roadmap note (backend + integration are separate phases).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for the Midnight Showroom storefront"
```

- [ ] **Step 6: Final verification commit/tag**

```bash
git log --oneline | head -20   # confirm the milestone commits
```

---

## Done — Acceptance Criteria check

Confirm against spec §14:
- [ ] Zero `antd`/`@ant-design/icons` imports; both uninstalled.
- [ ] Every UI primitive exists, is used, built from scratch with CVA.
- [ ] All 13 routes render + responsive (360px → 1280px+).
- [ ] Shop filters/sort/pagination/search work, URL-synced.
- [ ] Cart & wishlist persist to localStorage (survive refresh).
- [ ] Coupon validation works; checkout produces a confirmation.
- [ ] All forms validate client-side.
- [ ] No dead code; no unused exports.
- [ ] Keyboard navigable, visible focus, WCAG AA contrast.
- [ ] `npm run build` + `npm run lint` + `npm test` pass.

**Phase A complete.** Phase B (Backend) and Phase C (Integration) are separate spec → plan cycles.

<!-- END OF PLAN -->
