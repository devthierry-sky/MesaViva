begin;

alter table public.menu_access_events
  add column event_type text not null default 'qr_open',
  add column session_id uuid;

update public.menu_access_events
set event_type = case when product_id is null then 'qr_open' else 'product_view' end;

alter table public.menu_access_events
  add constraint menu_access_events_event_type_check
    check (event_type in ('qr_open', 'product_view', '3d_interaction')),
  add constraint menu_access_events_event_product_check
    check (
      (event_type = 'qr_open' and product_id is null)
      or (event_type in ('product_view', '3d_interaction') and product_id is not null)
    );

create unique index menu_access_events_qr_session_unique_idx
  on public.menu_access_events (restaurant_id, session_id)
  where event_type = 'qr_open' and session_id is not null;
create unique index menu_access_events_product_session_unique_idx
  on public.menu_access_events (restaurant_id, session_id, product_id)
  where event_type = 'product_view' and session_id is not null;
create unique index menu_access_events_3d_session_unique_idx
  on public.menu_access_events (restaurant_id, session_id)
  where event_type = '3d_interaction' and session_id is not null;

drop policy if exists "Published menu can record QR access" on public.menu_access_events;
create policy "Published menu can record QR access"
  on public.menu_access_events for insert to anon, authenticated
  with check (
    source = 'qr'
    and session_id is not null
    and exists (
      select 1 from public.restaurants restaurant
      where restaurant.id = restaurant_id and restaurant.is_published
    )
    and (
      (event_type = 'qr_open' and product_id is null)
      or exists (
        select 1
        from public.products product
        join public.categories category
          on category.restaurant_id = product.restaurant_id
         and category.id = product.category_id
        where product.id = menu_access_events.product_id
          and product.restaurant_id = menu_access_events.restaurant_id
          and product.is_available
          and category.is_active
          and (
            event_type = 'product_view'
            or (
              event_type = '3d_interaction'
              and exists (
                select 1 from public.product_assets asset
                where asset.restaurant_id = product.restaurant_id
                  and asset.product_id = product.id
                  and asset.asset_type = 'glb'
              )
            )
          )
      )
    )
  );

grant insert (restaurant_id, source, product_id, event_type, session_id)
  on public.menu_access_events to anon, authenticated;

create or replace view public.qr_product_access_totals
with (security_invoker = true)
as
  select
    event.restaurant_id,
    event.product_id,
    restaurant.name as restaurant_name,
    product.name as product_name,
    category.name as category_name,
    product.price_cents,
    count(*)::bigint as access_count,
    max(event.created_at) as last_accessed_at
  from public.menu_access_events event
  join public.restaurants restaurant on restaurant.id = event.restaurant_id
  join public.products product
    on product.restaurant_id = event.restaurant_id and product.id = event.product_id
  join public.categories category
    on category.restaurant_id = product.restaurant_id and category.id = product.category_id
  where event.event_type = 'product_view'
  group by event.restaurant_id, event.product_id, restaurant.name, product.name, category.name, product.price_cents;

create or replace view public.qr_engagement_totals
with (security_invoker = true)
as
  select
    event.restaurant_id,
    count(distinct event.session_id) filter (where event.event_type = 'qr_open')::bigint as qr_sessions,
    count(distinct event.session_id) filter (where event.event_type = '3d_interaction')::bigint as interaction_sessions,
    case
      when count(distinct event.session_id) filter (where event.event_type = 'qr_open') = 0 then 0
      else round(
        100.0 * count(distinct event.session_id) filter (where event.event_type = '3d_interaction')
        / count(distinct event.session_id) filter (where event.event_type = 'qr_open'),
        1
      )
    end as interaction_rate
  from public.menu_access_events event
  where event.session_id is not null
  group by event.restaurant_id;

revoke all on public.qr_engagement_totals from public, anon, authenticated;
grant select on public.qr_engagement_totals to authenticated;

commit;
