begin;

create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  label text not null check (char_length(pg_catalog.btrim(label)) between 1 and 40),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index restaurant_tables_unique_label_idx
  on public.restaurant_tables (restaurant_id, pg_catalog.lower(label));
create index restaurant_tables_active_restaurant_idx
  on public.restaurant_tables (restaurant_id) where is_active;

alter table public.restaurant_tables enable row level security;

create policy "Public can read active tables for published restaurants"
  on public.restaurant_tables for select to anon
  using (
    is_active and exists (
      select 1 from public.restaurants restaurant
      where restaurant.id = restaurant_tables.restaurant_id
        and restaurant.is_published
    )
  );
create policy "Members read restaurant tables"
  on public.restaurant_tables for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
    ))
    or (
      is_active and exists (
        select 1 from public.restaurants restaurant
        where restaurant.id = restaurant_tables.restaurant_id
          and restaurant.is_published
      )
    )
  );
create policy "Editors create restaurant tables"
  on public.restaurant_tables for insert to authenticated
  with check (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );
create policy "Editors update restaurant tables"
  on public.restaurant_tables for update to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  )
  with check (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );

grant select on public.restaurant_tables to anon, authenticated;
grant insert (restaurant_id, label), update (label, is_active, updated_at)
  on public.restaurant_tables to authenticated;

alter table public.orders
  add column table_id uuid references public.restaurant_tables (id) on delete set null,
  add column table_label_snapshot text check (table_label_snapshot is null or char_length(table_label_snapshot) between 1 and 40);

drop function public.create_restaurant_order(text, text, text, text, jsonb);

create function public.create_restaurant_order(
  p_restaurant_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_notes text,
  p_items jsonb,
  p_table_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_restaurant_id uuid;
  v_order_id uuid;
  v_table_label text;
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

  select restaurant.id into v_restaurant_id
  from public.restaurants restaurant
  where restaurant.slug = p_restaurant_slug and restaurant.is_published;
  if v_restaurant_id is null then
    raise exception 'restaurant_unavailable' using errcode = '22023';
  end if;

  if p_table_id is not null then
    select table_row.label into v_table_label
    from public.restaurant_tables table_row
    where table_row.id = p_table_id
      and table_row.restaurant_id = v_restaurant_id
      and table_row.is_active;
    if v_table_label is null then
      raise exception 'table_unavailable' using errcode = '22023';
    end if;
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
    select product.id, product.name, product.price_cents into v_product
    from public.products product
    join public.categories category on category.id = product.category_id and category.restaurant_id = product.restaurant_id
    where product.id = v_product_id and product.restaurant_id = v_restaurant_id
      and product.is_available and category.is_active;
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

  insert into public.orders (restaurant_id, table_id, table_label_snapshot, customer_name, customer_phone, notes, total_cents)
  values (v_restaurant_id, p_table_id, v_table_label, pg_catalog.btrim(p_customer_name), pg_catalog.btrim(p_customer_phone), nullif(pg_catalog.btrim(p_notes), ''), v_total::integer)
  returning id into v_order_id;
  insert into public.order_items (restaurant_id, order_id, product_id, product_name_snapshot, quantity, unit_price_cents)
  select v_restaurant_id, v_order_id, product_id, product_name, quantity, unit_price_cents from pg_temp.order_lines;

  return pg_catalog.jsonb_build_object(
    'orderId', v_order_id,
    'totalCents', v_total,
    'tableLabel', v_table_label,
    'items', (select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'name', product_name, 'quantity', quantity, 'unitPriceCents', unit_price_cents
    )) from pg_temp.order_lines)
  );
end;
$function$;

revoke all on function public.create_restaurant_order(text, text, text, text, jsonb, uuid) from public;
grant execute on function public.create_restaurant_order(text, text, text, text, jsonb, uuid) to anon, authenticated;

commit;
