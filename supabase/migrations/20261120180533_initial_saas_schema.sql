begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, supabase_auth_admin;

create type public.restaurant_role as enum (
  'owner',
  'manager',
  'editor',
  'viewer'
);

create type public.product_asset_type as enum (
  'image',
  'glb',
  'usdz'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'canceled'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 1000),
  logo_path text,
  theme_color text not null default '#ea580c' check (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_members (
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.restaurant_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (restaurant_id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 500),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, id),
  unique (restaurant_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null,
  name text not null check (char_length(name) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, id),
  foreign key (restaurant_id, category_id)
    references public.categories (restaurant_id, id)
    on delete restrict
);

create table public.product_assets (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  product_id uuid not null,
  asset_type public.product_asset_type not null,
  storage_path text not null unique,
  content_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 52428800),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (restaurant_id, product_id)
    references public.products (restaurant_id, id)
    on delete cascade
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  billing_interval text not null check (billing_interval in ('month', 'year', 'none')),
  product_limit integer check (product_limit is null or product_limit >= 0),
  storage_limit_bytes bigint check (storage_limit_bytes is null or storage_limit_bytes >= 0),
  features jsonb not null default '{}'::jsonb check (jsonb_typeof(features) = 'object'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete restrict,
  provider text not null check (char_length(provider) between 1 and 40),
  provider_subscription_id text,
  status public.subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, id),
  unique (provider, provider_subscription_id),
  check (
    current_period_end is null
    or current_period_start is null
    or current_period_end > current_period_start
  )
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  status public.order_status not null default 'pending',
  customer_name text check (customer_name is null or char_length(customer_name) <= 120),
  customer_phone text check (customer_phone is null or char_length(customer_phone) <= 40),
  notes text check (notes is null or char_length(notes) <= 1000),
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, id)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  order_id uuid not null,
  product_id uuid not null,
  product_name_snapshot text not null check (char_length(product_name_snapshot) between 1 and 120),
  quantity integer not null check (quantity between 1 and 99),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer generated always as (quantity * unit_price_cents) stored,
  created_at timestamptz not null default now(),
  foreign key (restaurant_id, order_id)
    references public.orders (restaurant_id, id)
    on delete cascade,
  foreign key (restaurant_id, product_id)
    references public.products (restaurant_id, id)
    on delete restrict
);

create index restaurant_members_user_idx
  on public.restaurant_members (user_id, restaurant_id);
create index categories_public_order_idx
  on public.categories (restaurant_id, sort_order)
  where is_active;
create index products_menu_order_idx
  on public.products (restaurant_id, category_id, sort_order)
  where is_available;
create index product_assets_product_idx
  on public.product_assets (restaurant_id, product_id, asset_type, sort_order);
create index subscriptions_restaurant_status_idx
  on public.subscriptions (restaurant_id, status);
create index orders_restaurant_created_idx
  on public.orders (restaurant_id, created_at desc);
create index order_items_order_idx
  on public.order_items (restaurant_id, order_id);

create function private.has_restaurant_role(
  p_restaurant_id uuid,
  p_allowed_roles public.restaurant_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.restaurant_members as member
    where member.restaurant_id = p_restaurant_id
      and member.user_id = (select auth.uid())
      and member.role = any (p_allowed_roles)
  );
$function$;

revoke all on function private.has_restaurant_role(uuid, public.restaurant_role[])
  from public, anon, authenticated;
grant execute on function private.has_restaurant_role(uuid, public.restaurant_role[])
  to authenticated;

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

revoke all on function private.handle_new_auth_user()
  from public, anon, authenticated;
grant execute on function private.handle_new_auth_user() to supabase_auth_admin;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$function$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger restaurants_set_updated_at
  before update on public.restaurants
  for each row execute function private.set_updated_at();
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function private.set_updated_at();
create trigger products_set_updated_at
  before update on public.products
  for each row execute function private.set_updated_at();
create trigger product_assets_set_updated_at
  before update on public.product_assets
  for each row execute function private.set_updated_at();
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function private.set_updated_at();
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function private.set_updated_at();
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_assets enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "Users create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Public can read published restaurants"
  on public.restaurants for select to anon, authenticated
  using (is_published);
create policy "Members can read their restaurants"
  on public.restaurants for select to authenticated
  using (
    (select private.has_restaurant_role(
      id,
      array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
    ))
  );
create policy "Owners and managers update restaurant details"
  on public.restaurants for update to authenticated
  using (
    (select private.has_restaurant_role(
      id,
      array['owner', 'manager']::public.restaurant_role[]
    ))
  )
  with check (
    (select private.has_restaurant_role(
      id,
      array['owner', 'manager']::public.restaurant_role[]
    ))
  );

create policy "Members read their restaurant memberships"
  on public.restaurant_members for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager']::public.restaurant_role[]
    ))
  );

create policy "Public can read active categories in published restaurants"
  on public.categories for select to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.restaurants as restaurant
      where restaurant.id = categories.restaurant_id
        and restaurant.is_published
    )
  );
create policy "Members read their restaurant categories"
  on public.categories for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
    ))
  );
create policy "Editors manage restaurant categories"
  on public.categories for insert to authenticated
  with check (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );
create policy "Editors update restaurant categories"
  on public.categories for update to authenticated
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
create policy "Editors delete restaurant categories"
  on public.categories for delete to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );

create policy "Public can read available products in published restaurants"
  on public.products for select to anon, authenticated
  using (
    is_available
    and exists (
      select 1 from public.restaurants as restaurant
      where restaurant.id = products.restaurant_id
        and restaurant.is_published
    )
    and exists (
      select 1 from public.categories as category
      where category.id = products.category_id
        and category.restaurant_id = products.restaurant_id
        and category.is_active
    )
  );
create policy "Members read their restaurant products"
  on public.products for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
    ))
  );
create policy "Editors create restaurant products"
  on public.products for insert to authenticated
  with check (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );
create policy "Editors update restaurant products"
  on public.products for update to authenticated
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
create policy "Editors delete restaurant products"
  on public.products for delete to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );

create policy "Public can read assets for available public products"
  on public.product_assets for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products as product
      join public.restaurants as restaurant
        on restaurant.id = product.restaurant_id
      where product.id = product_assets.product_id
        and product.restaurant_id = product_assets.restaurant_id
        and product.is_available
        and restaurant.is_published
    )
  );
create policy "Members read their restaurant assets"
  on public.product_assets for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
    ))
  );
create policy "Editors add restaurant assets"
  on public.product_assets for insert to authenticated
  with check (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );
create policy "Editors update restaurant assets"
  on public.product_assets for update to authenticated
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
create policy "Editors delete restaurant assets"
  on public.product_assets for delete to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );

create policy "Public can read active plans"
  on public.plans for select to anon, authenticated
  using (is_active);

create policy "Owners and managers read subscriptions"
  on public.subscriptions for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager']::public.restaurant_role[]
    ))
  );

create policy "Restaurant staff read orders"
  on public.orders for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );
create policy "Restaurant staff read order items"
  on public.order_items for select to authenticated
  using (
    (select private.has_restaurant_role(
      restaurant_id,
      array['owner', 'manager', 'editor']::public.restaurant_role[]
    ))
  );

grant select on public.restaurants, public.categories, public.products,
  public.product_assets, public.plans to anon;
grant select, update on public.restaurants to authenticated;
grant select on public.restaurant_members to authenticated;
grant select, insert, update, delete on public.categories, public.products,
  public.product_assets to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.plans, public.subscriptions, public.orders,
  public.order_items to authenticated;
grant all privileges on all tables in schema public to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-assets',
  'restaurant-assets',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'model/gltf-binary',
    'model/vnd.usdz+zip'
  ]
)
on conflict (id) do nothing;

create policy "Restaurant members read their stored assets"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1
      from public.products as product
      where product.restaurant_id::text = split_part(name, '/', 1)
        and product.id::text = split_part(name, '/', 2)
        and (select private.has_restaurant_role(
          product.restaurant_id,
          array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
        ))
    )
  );
create policy "Editors upload restaurant assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1
      from public.products as product
      where product.restaurant_id::text = split_part(name, '/', 1)
        and product.id::text = split_part(name, '/', 2)
        and (select private.has_restaurant_role(
          product.restaurant_id,
          array['owner', 'manager', 'editor']::public.restaurant_role[]
        ))
    )
  );
create policy "Editors update restaurant assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1
      from public.products as product
      where product.restaurant_id::text = split_part(name, '/', 1)
        and product.id::text = split_part(name, '/', 2)
        and (select private.has_restaurant_role(
          product.restaurant_id,
          array['owner', 'manager', 'editor']::public.restaurant_role[]
        ))
    )
  )
  with check (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1
      from public.products as product
      where product.restaurant_id::text = split_part(name, '/', 1)
        and product.id::text = split_part(name, '/', 2)
        and (select private.has_restaurant_role(
          product.restaurant_id,
          array['owner', 'manager', 'editor']::public.restaurant_role[]
        ))
    )
  );
create policy "Editors delete restaurant assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1
      from public.products as product
      where product.restaurant_id::text = split_part(name, '/', 1)
        and product.id::text = split_part(name, '/', 2)
        and (select private.has_restaurant_role(
          product.restaurant_id,
          array['owner', 'manager', 'editor']::public.restaurant_role[]
        ))
    )
  );

commit;
