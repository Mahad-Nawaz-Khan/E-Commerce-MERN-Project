# Product Detail Variants Design

## Goal

Redesign the product detail screen to follow the supplied product-page reference while rendering each product's own catalog data, exposing color choices only where they are meaningful, and preserving color selections as separate cart variants.

## Scope

- Rebuild `ProductDetailScreen` as a responsive gallery-and-detail layout modeled on `PICS/Product Details page.svg`.
- Preserve routing and the existing in-place `NotFoundScreen` behavior for an unknown product slug.
- Use existing catalog values for product-specific title, image, price, original price, rating, review count, description, stock, available sizes, and tags.
- Add a `colors` field only to products for which color is a genuine purchasable choice; do not add it to every record.
- Normalize existing color-like values currently stored in `sizes` into `colors` for applicable products, retaining `sizes` only for dimensions, capacities, apparel/shoe sizes, and other non-color options.
- Add selected color and quantity to the detail-page purchase state.
- Make the cart distinguish entries by product ID plus selected color so different color variants remain independent cart lines.

## Product Page Layout

- On desktop, show a vertical thumbnail rail, a large neutral product-image stage using `object-contain`, and a details column.
- On mobile, stack gallery and details while keeping thumbnails available and controls touch-friendly.
- Render the existing breadcrumb above the product content.
- The details column contains title, star rating and review count, current price and optional crossed-out original price, stock status, description, optional color section, optional size section, quantity stepper, add-to-cart control, wishlist control, and bordered delivery/return information panels.
- The main image reflects the currently selected gallery item. With the current catalog's single image per product, thumbnails reuse the product art; the component structure will allow additional images later without changing selection logic.

## Color Data and Interaction

- A color item has the shape `{ name: string, value: string }`, where `name` is an accessible visible/semantic label and `value` is a CSS color value for its swatch.
- Only products that credibly have multiple finishes expose `colors`, including catalog items whose current `sizes` incorrectly hold color names.
- Render color controls only when `product.colors?.length > 0`.
- Color swatches are keyboard-accessible buttons with descriptive `aria-label`s, an always-visible neutral border for light finishes, and a clear selected ring/border.
- The first listed color initializes the selected variant. The selected color is shown in the option label.

## Cart Variant Behavior

- Add-to-cart passes a derived product line containing the selected color and selected quantity.
- The cart reducer matches an existing line only when both `id` and selected color match. Matching variants accumulate quantity; different colors of the same product remain separate lines.
- Products with no colors continue using their existing cart behavior and must not require a color selection.

## Error Handling and Accessibility

- A missing product renders `NotFoundScreen` without redirecting or changing the requested URL.
- Image alt text uses the product name.
- Interactive thumbnails, swatches, quantity controls, wishlist control, and add-to-cart action have accessible labels and visible focus states.
- Disabled quantity-decrease controls prevent quantities below one.

## Verification

- Confirm a product with colors shows selectable swatches and adds distinct selected colors as separate cart lines.
- Confirm a product with no `colors` field hides the color section and adds normally.
- Confirm product-specific details render for multiple product URLs.
- Confirm responsive build compilation and lint results, reporting any pre-existing lint failures separately.
