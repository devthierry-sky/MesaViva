# dashboard-management-orders-and-analytics - Intent and Specifications

## Summary
Make the restaurant owner dashboard usable for managing the restaurant, menu and incoming orders, with a compact analytics overview.

## Problem
The dashboard footer floats above the bottom on short pages, the brand lacks contrast in the green sidebar, and an unnecessary owner-space label takes up header space. Restaurant and menu navigation lead to pages that support only limited edits. The overview currently cannot load because the connected Supabase database has no migrations or tables. Owners also need meaningful QR access and order counts.

## Scope
- Keep the dashboard footer at the bottom of the viewport when content is short, improve sidebar logo contrast and remove the redundant label.
- Make the sidebar compact and expandable on desktop hover/focus, with a touch-friendly open/close control on mobile.
- Let restaurant owners manage their WhatsApp/phone, address and Instagram alongside name, description and publication state.
- Add edit and delete actions for menu categories and dishes, plus dish availability controls.
- Add QR-code access tracking and a public ordering flow. Orders are saved in the restaurant panel; after confirmation, the customer's device opens WhatsApp with a prepared order message for the restaurant.
- Show four overview cards: QR accesses, orders received, active dishes and menu categories.
- Add order status management in the owner panel.
- Add the necessary local Supabase migrations and preserve authenticated role checks and public-menu behavior.
- Remove the four redundant explanatory copy snippets shown in the landing-page references while preserving section headings, the demo link, plan details, and footer navigation.
- Align the owner login/register surfaces and their feature icons with the green brand palette.
- Use the dashboard's available width with left-aligned content and a compact app footer.
- Remove visible dashboard loading messages and deduplicate session/membership queries within a request so page data appears sooner.
- Keep the plan spotlight continuous across the full card group, so pointer movement between cards does not restart the effect.
- Separate restaurant profile, menu management, and incoming orders into distinct owner-panel routes.
- Add useful owner actions and a setup checklist below the restaurant summary, using only real data and existing MesaViva features.
- Use the supplied Stitch dashboard as a layout reference while keeping MesaViva branding, green palette, and truthful metrics; do not import its orange theme or sample analytics.
- Enrich the landing page “Como funciona” section with a scroll-triggered reveal and a fuller three-step layout, without adding heavy animation dependencies.
- Track which available dishes are viewed after a visitor enters through a restaurant QR code, and show the top three in the owner dashboard.
- Add quick actions, a reusable restaurant QR with PNG and print-to-PDF options, and a live-updating recent-orders panel using the MesaViva palette.
- Expand owner navigation to categories, 3D dishes, QR Code, and settings; do not add a subscription section.

## Out of Scope
- Online payment processing.
- Claiming QR scans represent unique people.
- Automatic WhatsApp API delivery without a customer's explicit send action.
- Analytics that require collecting customer identity or location.

## Constraints
- Use the existing restaurant roles and verify authorization inside every server action.
- Keep QR access records aggregate and do not store IP addresses or device identifiers.
- Calculate order prices from current available products on the server/database, never from client-submitted prices.
- Accept orders only for published restaurants with available products.
- Save an order before showing the customer the WhatsApp handoff link.
- Treat the current connected Supabase project as empty; do not claim live statistics until its migrations are applied.

## Success Criteria
- Dashboard footer stays at the bottom with short content, and the sidebar adapts to desktop hover/focus and mobile tap navigation.
- The restaurant profile saves and displays phone/WhatsApp, address and Instagram.
- Restaurant staff can edit/delete menu categories and dishes, and toggle dish availability.
- The generated QR code opens the restaurant menu with a QR source marker; each marked menu access increments the QR counter without collecting identity data.
- A customer can build and submit an order; it is saved with database-calculated prices and appears in the owner panel.
- The post-save WhatsApp link contains the order summary and restaurant phone; the customer explicitly sends the message from WhatsApp.
- Overview cards show QR accesses, orders, available dishes and categories from Supabase, not sample numbers.
- Existing login, public menu and AR viewing remain usable.
- The landing page keeps its main explanation and calls to action while the four repeated secondary blurbs are gone.
- Login/register buttons, focus states, and feature icon colors use the same green palette as the rest of the product.
- Plan spotlight position is tracked by the group so it travels continuously across cards.
- The sidebar opens three distinct routes for restaurant details, menu management, and orders.
- Dashboard includes relevant shortcuts, QR sharing, and owner setup progress in MesaViva colors; all displayed counts come from Supabase.
- The QR Top 3 counts a dish when it becomes visible in the menu after QR entry, with one event per dish per browser session and no personal identifiers.
- Recent orders refresh from Supabase Realtime, and the dashboard exposes role-checked next-step actions.
- QR download supports PNG and browser print/save-as-PDF; no table count, AR conversion, or subscription data is invented.
- The “Como funciona” section reveals its heading and steps as they enter view, staggers the three steps, and stays visible for users who prefer reduced motion or have no IntersectionObserver support.
- Dashboard content uses the workspace width, and its footer occupies only a compact bottom strip.
- No “Carregando painel”/“Carregando os dados do restaurante” message appears; shared auth and membership reads are executed once per server render.

## Decisions
- New change folder: `dashboard-management-orders-and-analytics`.
- QR card label describes access scans, not unique people.
- Two additional overview cards: active dishes and menu categories.
- WhatsApp handoff uses a user-clicked click-to-chat link after the order is stored; no WhatsApp Business API integration.
- Orders default to pending and can be updated by restaurant staff.
- No online payments in this phase.
- The four landing-page removals apply to the marked secondary blurbs, not the section headings or the useful “Explorar demonstração” link.
- The marketing footer remains intact; only the authenticated dashboard uses a compact footer.
- React `cache` is used only for request-level deduplication of authenticated dashboard reads, never as a cross-user data cache.

## Open Questions
