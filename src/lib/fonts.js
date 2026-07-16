/**
 * Font helpers — a tiny shim that mirrors next/font's `.className` API.
 * Components ported from the original used `poppins.className` / `inter.className`
 * to apply font families. Here we expose the same shape backed by Tailwind v4
 * font utilities wired to @fontsource (see src/index.css + main.jsx imports).
 *
 * Usage stays identical to the source project:
 *   import { inter, poppins } from '../lib/fonts'
 *   <h1 className={`${poppins.className} ...`}>...</h1>
 */
export const inter = { className: 'font-inter' }
export const poppins = { className: 'font-poppins' }
