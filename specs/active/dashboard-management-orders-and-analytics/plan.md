# Implementation Plan - dashboard-management-orders-and-analytics

## Summary
Improve the owner dashboard shell, complete restaurant/menu management, then add QR analytics and a public order flow backed by Supabase.

## Approach
Use the existing Supabase schema and role model where possible. Add only the profile fields and analytics policies needed. Use a narrowly scoped database function for public order creation that validates the published restaurant, product availability and prices before inserting order and item snapshots. Build owner mutations with authenticated server actions. Record orders before showing a WhatsApp click-to-chat link; do not send messages automatically. Track QR opens as access events without identifying people.

## Execution Constraints
- Preserve the existing user roles and enforce authorization inside every server action.
- Keep QR analytics aggregate and avoid storing IP addresses or customer identifiers.
- Derive order prices from current available products in the database, not from client-submitted prices.
- Validate the restaurant is published and requested products are available before recording an order.
- Review the local SQL and target project together before hosted migrations; the QR product analytics migration was reviewed and applied to the connected project.

## Tasks
- [x] Finish dashboard layout: footer placement, logo contrast, remove redundant label, responsive hover/focus/touch sidebar.
- [x] Add restaurant contact fields and edit/save behavior.
- [x] Add category and dish editing/deletion and dish availability controls.
- [x] Add QR access tracking and a downloadable/shareable restaurant QR code.
- [x] Add customer cart/checkout, save orders with database-derived prices, and provide a WhatsApp handoff after saving.
- [x] Add owner order list/status controls and four live overview metrics.
- [x] Add/review Supabase migrations, investigate current database state, and validate the application and user flows.
- [x] Remove the four marked redundant landing-page blurbs while preserving useful section navigation and the demo CTA.
- [x] Align auth-page colors and feature icons with the forest-green brand palette.
- [x] Widen and left-align dashboard content, then replace the large marketing footer with a compact dashboard footer.
- [x] Deduplicate dashboard auth/membership reads per render and remove visible loading copy.
- [x] Keep plan spotlight motion continuous across cards.
- [x] Split restaurant details, menu management, and orders into separate routes.
- [x] Add MesaViva-themed QR sharing and a setup checklist using real state; remove the quick-actions block and the Categories/Settings sidebar links on request; use the open top bar for real menu status, QR/orders navigation, and account access.
- [x] Improve the landing page process section and add a staggered reveal animation on scroll with reduced-motion support.
- [x] Record QR-origin product views and add a staff-only aggregate view for the dashboard Top 3.
- [x] Add quick actions, QR PNG/PDF print output, recent order actions, and a live Supabase Realtime refresh.
- [x] Expand sidebar links for categories, 3D dishes, QR, and settings without a subscription link.

## Validation Strategy
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed after the final changes. Next.js emitted a workspace-root warning because a parent-level lockfile exists; it did not block compilation.
- The QR product analytics migration (`20261123011234_qr_product_access_tracking`) was applied to the reviewed connected Supabase project. The new `product_id` column, restricted aggregate view, and `orders` Realtime publication were verified remotely.
- The Top 3 starts empty until customers open products from a published menu through a QR code. Counts represent unique product-card visibility events per browser session, without visitor identity data.
- Supabase migration list and table inventory confirmed the previous schema/backfill migrations; RLS is enabled on every application table.
- The pre-existing account was backfilled to one profile, one restaurant and one owner membership so dashboard access works.
- No automated tests were added or run. A full interactive browser walkthrough remains for the user's next local preview.
- Supabase security/performance advisors were reviewed after the migration.
- The user reported an oversized centered dashboard layout/footer and long visible loading text; code inspection found a marketing footer inside the dashboard shell and repeated sequential auth/membership reads in the layout and pages.

## Risks / Follow-ups
- Public order submission uses a narrowly scoped `SECURITY DEFINER` database function that validates published restaurant/product availability and derives prices from the database. Supabase flags public execution because this is the intended anonymous order entry point; keep the function's input checks and grants narrow.
- Supabase still reports the pre-existing public `rls_auto_enable()` SECURITY DEFINER grant and disabled leaked-password protection. The function body was reviewed as a narrowly scoped RLS auto-enable event-trigger helper; these unrelated project settings remain follow-ups.
- The dashboard shows recent real orders and their current statuses, not the mock sales and AR projections from the Stitch reference. The current schema has no table synchronization or per-dish AR-projection metrics, so those are not displayed as if they were real.
- Supabase performance advisors note unindexed foreign keys in `order_items` and `subscriptions`; existing read policies produce multiple-policy warnings. These do not block current behavior and can be tuned separately if data volume warrants it.
- Removing repeated queries improves dashboard startup but cannot eliminate the first authenticated Supabase request; keep the shell visually quiet while that request resolves.
