begin;

alter table public.menu_access_events
  add column product_id uuid null,
  add constraint menu_access_events_product_fk
    foreign key (restaurant_id, product_id)
    references public.products (restaurant_id, id)
    on delete set null (product_id);

create index menu_access_events_product_qr_idx
  on public.menu_access_events (restaurant_id, product_id, created_at desc)
  where product_id is not null;

drop policy if exists "Published menu can record QR access"
  on public.menu_access_events;

create policy "Published menu can record QR access"
  on public.menu_access_events for insert to anon, authenticated
  with check (
    source = 'qr'
    and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_published
    )
    and (
      product_id is null
      or exists (
        select 1
        from public.products p
        join public.categories c
          on c.restaurant_id = p.restaurant_id and c.id = p.category_id
        where p.id = product_id
          and p.restaurant_id = menu_access_events.restaurant_id
          and p.is_available
          and c.is_active
      )
    )
  );

grant insert (restaurant_id, source, product_id)
  on public.menu_access_events to anon, authenticated;

create or replace view public.qr_product_access_totals
with (security_invoker = true)
as
  select
    e.restaurant_id,
    e.product_id,
    r.name as restaurant_name,
    p.name as product_name,
    c.name as category_name,
    p.price_cents,
    count(*)::bigint as access_count,
    max(e.created_at) as last_accessed_at
  from public.menu_access_events e
  join public.restaurants r on r.id = e.restaurant_id
  join public.products p
    on p.restaurant_id = e.restaurant_id and p.id = e.product_id
  join public.categories c
    on c.restaurant_id = p.restaurant_id and c.id = p.category_id
  where e.source = 'qr' and e.product_id is not null
  group by e.restaurant_id, e.product_id, r.name, p.name, c.name, p.price_cents;

revoke all on public.qr_product_access_totals from public, anon, authenticated;
grant select on public.qr_product_access_totals to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;

commit;
