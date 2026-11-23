# Implementation Plan - restaurant-table-qr

## Summary
Add registered table-specific menu links, QR output and order attribution while preserving the restaurant-wide QR code.

## Approach
Add a restaurant-owned table registry and shared table sessions with RLS for restaurant staff and a public path limited to active tables of published restaurants. Use each table UUID in the restaurant menu URL alongside the existing QR source marker. Validate table and session state in the database order function, snapshot the table label on orders, and include it in the owner UI and WhatsApp message. Use an ephemeral anonymous browser-session UUID for QR opens, product views, and deliberate 3D interactions; report only aggregate ratios and counts.

## Execution Constraints
- Keep existing restaurant membership checks in every table-management server action.
- Do not accept an arbitrary table label or restaurant ID as authority during public order creation; validate the table UUID against the menu slug in the database.
- Preserve the current general QR and existing public-menu flow when no table is supplied.
- Do not claim hardware/POS synchronization; count active MesaViva table QR registrations.
- Review local migration SQL and the connected Supabase project together before applying the migration remotely.

## Tasks
- [x] Add the table registry, RLS policies, order table references and label snapshots; apply the table QR migration to the connected Supabase project.
- [ ] Add shared comanda sessions, QR session event IDs and aggregate views; extend the validated public order function.
- [ ] Add owner actions to create and deactivate table QR registrations with role checks and route revalidation.
- [ ] Add a table QR manager with unique menu links and PNG/print output, and show the real active count on the dashboard top bar.
- [ ] Resolve table context on the public menu, aggregate table orders into a public-safe comanda summary, and retain it through customer checkout.
- [ ] Display the saved table label on recent and full order views and in the WhatsApp handoff message.
- [ ] Add staff controls to confirm an offline comanda payment, then allow the customer to save a rating for that paid session.
- [x] Record a 3D interaction only after model drag/zoom or AR launch; add a dashboard interaction rate and meaningful coverage/completion progress bars.
- [x] Review and apply the migration to the connected Supabase project, then query the resulting schema and aggregates.
- [x] Add a restaurant logo upload to “Meu restaurante”, with restaurant-scoped storage access and signed dashboard URLs; configure the Server Action body limit above the 2 MB file limit to prevent multipart uploads from breaking the request.
- [x] Add a live new-order alert to the global dashboard bell, including unread count and optional browser notification after the user grants permission.
- [x] Restore the dashboard period selector and direct public-menu action; filter period-based QR and order totals through a Next.js client-side route transition, avoiding a full document reload.
- [x] Add a 3D interaction rate and percentage bars based on actual model coverage, completed orders, active categories, and QR sessions.

## Validation Strategy
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- Query the connected database to confirm the new table registry, RLS, order table snapshot fields, and function signature.
- Walk through creating a table QR, opening its public menu, placing multiple orders, and verifying the table label and shared total in the customer comanda, staff panel, and WhatsApp handoff.
- Confirm that only a staff-confirmed paid comanda can receive a rating, and that deliberate 3D interactions update aggregate metrics once per tab session.
- Confirm the general restaurant QR still opens the menu without a table label.

## Risks / Follow-ups
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass. ESLint retains two image optimization warnings for signed restaurant logo URLs. Restart the dev server after the Server Action body-size configuration change.
- Existing orders must remain readable after a table label changes or a table QR is deactivated; snapshot the label when the order is placed.
- Public table lookup must not allow a QR for one restaurant to be paired with another restaurant's slug.
- The displayed count means active table QR registrations, not total physical tables or external POS-connected tables.
- A table session has no online payment gateway; the staff confirmation is the source of truth for a cash, terminal, or external Pix payment.
- Table comanda summaries must exclude customer names and phone numbers from the public query path.
- The 3D interaction metric has a start point at the new session-token rollout; historical anonymous events cannot be retroactively grouped into a rate.
