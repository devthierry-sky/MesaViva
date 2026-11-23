# restaurant-table-qr - Intent and Specifications

## Summary
Give each restaurant table its own QR code and show how many active table QRs are registered.

## Problem
The current restaurant QR opens the same general menu for every table. The owner has no way to register individual tables, and orders do not identify which table initiated them. The dashboard reference includes a synchronized-table count, but the database has no table records to support a truthful count.

## Scope
- Let restaurant owners register and deactivate table entries, each with a unique QR link to the restaurant's public menu.
- Show the number of active table QR codes in the dashboard's top bar and QR page.
- Preserve the table context while the customer explores the menu and submits an order.
- Show the table label in the restaurant's order panel and in the WhatsApp handoff text.
- Provide per-table QR download and print/save-as-PDF output, using MesaViva branding.
- Let restaurant owners set a restaurant photo/logo and show it in the dashboard identity.
- Notify dashboard users in real time when a new order arrives, with an unread count and browser notification when enabled.
- Restore the dashboard period selector and a direct link to open the restaurant menu.
- Keep the existing general restaurant QR available.
- Group multiple orders from the same table into a shared open comanda until the team records payment.
- Let the customer review that table's items and total, then rate the visit after the team confirms payment.
- Add anonymous, short-lived QR session analytics to report a truthful 3D interaction rate and progress bars based on real completion/model-coverage data.

## Out of Scope
- Integration with POS hardware, restaurant table-management systems, or external services.
- Automatic WhatsApp delivery or online payment processing.
- Waiter call buttons, consumables requests, and splitting one comanda across separate payments.
- Claiming that an active QR proves a physical table is currently connected to a device.

## Constraints
- Every table record belongs to a restaurant and table mutations require an authorized restaurant membership.
- Public table links may create orders only for the table and restaurant encoded in the QR link; order prices remain database-derived.
- Keep existing general QR and orders functional when no table context is present.
- Table count must come from active table-specific QR records; do not infer or fabricate it from QR scans.
- QR interaction analytics may use only a random per-tab session ID stored in session storage; do not collect names, device IDs, IPs, or persistent analytics identifiers.
- Payment completion is an owner/staff-confirmed record of an offline payment; the UI must not claim to process Pix, card, or cash itself.

## Success Criteria
- An owner can create and deactivate table QR entries, and the dashboard displays the current active count.
- Each table QR opens the correct published restaurant menu with its table label preserved.
- Orders submitted through a table QR store a stable table label and show it in the owner panel and WhatsApp handoff.
- Orders from the same table share one active comanda and the owner can record that the offline bill was paid.
- The customer can see the shared table total and submit a star rating after payment is confirmed.
- The dashboard 3D interaction rate is the share of QR sessions that interacted with at least one 3D model; progress bars show real ratios, not arbitrary goals.
- The general restaurant QR still opens the menu and permits checkout without a table label.
- A QR for a table cannot be reused with another restaurant's menu slug.
- Table QR codes can be saved as PNG or printed/saved as PDF.
- An owner or manager can upload a restaurant image in “Meu restaurante”; unauthorized members cannot replace or remove it.
- New orders arriving while the dashboard is open create an in-app alert and unread bell count; browser alerts are sent only after the user grants permission.
- The dashboard period selector filters the period-based order and QR access totals, and the menu action opens the correct restaurant page.

## Decisions
- The user chose one individual QR per table.
- The user wants the table shown in the owner order panel and WhatsApp order message.
- “Mesas sincronizadas” means active MesaViva table QR registrations, not physical/POS hardware synchronization.
- Keep the existing restaurant-wide menu QR alongside the individual table QR codes.
- A comanda starts with the first table order, remains open until restaurant staff confirms payment, and aggregates subsequent orders for that table.
- “Interação 3D” means a customer deliberately moves/zooms a model or launches AR; passive visibility alone does not count.
- Interaction rate and order/model-coverage bars use all-time data until a real date-range filter exists.
- Optional tip, wait staff notifications, and split payments are not included in the first comanda pass.
- Restaurant logos use the existing private `restaurant-assets` bucket with separate restaurant-scoped storage policies; published menus may receive signed logo URLs.
- Realtime order notices are scoped to the signed-in user’s restaurant memberships and must not include customer phone numbers in browser notifications.
- The period filter applies to QR-access and order totals; the all-time top-three ranking remains explicitly labeled as historical until its aggregate supports date filtering.

## Open Questions
