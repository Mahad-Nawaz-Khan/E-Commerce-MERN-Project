# Client-side 404 Handling Design

## Goal

Keep the existing declarative `BrowserRouter` setup and show the existing `NotFoundScreen` for undefined URLs without redirecting or changing the URL in the browser.

## Scope

- Retain `BrowserRouter`, `Routes`, and `Route`.
- Keep all route content, including the 404 page, nested inside `MainLayout` so the navbar and footer remain visible.
- Use the parent route's catch-all (`path="*"`) to render `NotFoundScreen` directly for every unmatched URL.
- Change invalid product-slug handling to render `NotFoundScreen` instead of navigating to `/404`.
- Remove the explicit `/404` route because no route should navigate to it and the wildcard route covers 404 rendering.

## Behavior

- Valid paths continue to render their existing screens.
- An undefined path, such as `/missing-page`, renders `NotFoundScreen` while the URL remains `/missing-page`.
- An unknown product slug, such as `/product/missing-product`, renders `NotFoundScreen` while the URL remains `/product/missing-product`.
- `MainLayout` continues to wrap all of these states.

## Error Handling

This is client-side route matching, not server error handling. Production hosting must still serve the SPA entry point for deep links so React Router can evaluate the requested path and render the catch-all route.

## Verification

- Run the project's available lint/build checks.
- Confirm an unmatched route renders the 404 screen without URL replacement.
- Confirm an invalid product slug renders the 404 screen without URL replacement.
- Confirm a valid product slug still renders its product detail screen.
