begin;

alter table public.restaurants
  add column phone text check (phone is null or phone ~ '^[0-9+() -]{8,24}$'),
  add column address text check (address is null or char_length(address) <= 240),
  add column instagram text check (instagram is null or char_length(instagram) <= 40);

create table public.menu_access_events (
  id bigint generated always as identity primary key,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  source text not null check (source = 'qr'),
  created_at timestamptz not null default now()
);
create index menu_access_events_restaurant_created_idx
  on public.menu_access_events (restaurant_id, created_at desc);
alter table public.menu_access_events enable row level security;

create policy "Published menu can record QR access"
  on public.menu_access_events for insert to anon, authenticated
  with check (source = 'qr' and exists (
    select 1 from public.restaurants r where r.id = restaurant_id and r.is_published
  ));
create policy "Restaurant staff read QR access totals"
  on public.menu_access_events for select to authenticated
  using ((select private.has_restaurant_role(
    restaurant_id, array['owner','manager','editor']::public.restaurant_role[]
  )));
grant insert (restaurant_id, source) on public.menu_access_events to anon, authenticated;
grant select on public.menu_access_events to authenticated;

create policy "Restaurant staff update order status"
  on public.orders for update to authenticated
  using ((select private.has_restaurant_role(
    restaurant_id, array['owner','manager','editor']::public.restaurant_role[]
  )))
  with check ((select private.has_restaurant_role(
    restaurant_id, array['owner','manager','editor']::public.restaurant_role[]
  )));
grant update (status) on public.orders to authenticated;

create or replace function public.create_restaurant_order(
  p_restaurant_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_restaurant_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_product record;
  v_product_id uuid;
  v_quantity integer;
  v_total bigint := 0;
  v_count integer := 0;
begin
  if p_customer_name is null or p_customer_phone is null or p_items is null
     or pg_catalog.char_length(pg_catalog.btrim(p_customer_name)) not between 2 and 120
     or pg_catalog.char_length(pg_catalog.btrim(p_customer_phone)) not between 8 and 40
     or (p_notes is not null and pg_catalog.char_length(p_notes) > 1000)
     or pg_catalog.jsonb_typeof(p_items) <> 'array'
     or pg_catalog.jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'invalid_order' using errcode = '22023';
  end if;

  select r.id into v_restaurant_id
  from public.restaurants r
  where r.slug = p_restaurant_slug and r.is_published;
  if v_restaurant_id is null then
    raise exception 'restaurant_unavailable' using errcode = '22023';
  end if;

  create temporary table if not exists pg_temp.order_lines (
    product_id uuid primary key,
    product_name text,
    quantity integer,
    unit_price_cents integer
  ) on commit drop;
  truncate table pg_temp.order_lines;

  for v_item in select value from pg_catalog.jsonb_array_elements(p_items) loop
    begin
      v_product_id := (v_item ->> 'productId')::uuid;
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'invalid_order_item' using errcode = '22023';
    end;
    if v_quantity not between 1 and 20 then
      raise exception 'invalid_order_item' using errcode = '22023';
    end if;
    select p.id, p.name, p.price_cents into v_product
    from public.products p
    join public.categories c on c.id = p.category_id and c.restaurant_id = p.restaurant_id
    where p.id = v_product_id and p.restaurant_id = v_restaurant_id
      and p.is_available and c.is_active;
    if not found then
      raise exception 'product_unavailable' using errcode = '22023';
    end if;
    insert into pg_temp.order_lines as existing values (v_product.id, v_product.name, v_quantity, v_product.price_cents)
      on conflict (product_id) do update set quantity = existing.quantity + excluded.quantity;
    if (select quantity from pg_temp.order_lines where product_id = v_product_id) > 99 then
      raise exception 'invalid_order_item' using errcode = '22023';
    end if;
    v_count := v_count + 1;
    if v_count > 30 then raise exception 'too_many_items' using errcode = '22023'; end if;
  end loop;

  select pg_catalog.sum(quantity::bigint * unit_price_cents) into v_total from pg_temp.order_lines;
  if v_total > 2147483647 then raise exception 'order_total_too_large' using errcode = '22023'; end if;

  insert into public.orders (restaurant_id, customer_name, customer_phone, notes, total_cents)
  values (v_restaurant_id, pg_catalog.btrim(p_customer_name), pg_catalog.btrim(p_customer_phone), nullif(pg_catalog.btrim(p_notes), ''), v_total::integer)
  returning id into v_order_id;
  insert into public.order_items (restaurant_id, order_id, product_id, product_name_snapshot, quantity, unit_price_cents)
  select v_restaurant_id, v_order_id, product_id, product_name, quantity, unit_price_cents from pg_temp.order_lines;

  return pg_catalog.jsonb_build_object(
    'orderId', v_order_id,
    'totalCents', v_total,
    'items', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'name', product_name, 'quantity', quantity, 'unitPriceCents', unit_price_cents
    )) from pg_temp.order_lines)
  );
end;
$function$;
revoke all on function public.create_restaurant_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_restaurant_order(text, text, text, text, jsonb) to anon, authenticated;

commit;
