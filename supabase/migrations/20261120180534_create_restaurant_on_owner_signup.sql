begin;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  restaurant_name text;
  base_slug text;
  restaurant_slug text;
  slug_number integer := 1;
  restaurant_id uuid;
begin
  restaurant_name := coalesce(
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'restaurant_name'), ''),
    'Meu restaurante'
  );

  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'name'), '')
  )
  on conflict (id) do nothing;

  base_slug := pg_catalog.regexp_replace(
    pg_catalog.translate(
      pg_catalog.lower(pg_catalog.btrim(restaurant_name)),
      'áàãâäéèêëíìîïóòõôöúùûüçñ',
      'aaaaaeeeeiiiiooooouuuucn'
    ),
    '[^a-z0-9]+', '-', 'g'
  );
  base_slug := pg_catalog.regexp_replace(base_slug, '(^-+|-+$)', '', 'g');
  base_slug := coalesce(nullif(base_slug, ''), 'restaurante');

  -- Serialize slug allocation for restaurants with the same normalized name.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(base_slug, 0)
  );

  restaurant_slug := base_slug;
  while exists (
    select 1 from public.restaurants as restaurant
    where restaurant.slug = restaurant_slug
  ) loop
    slug_number := slug_number + 1;
    restaurant_slug := base_slug || '-' || slug_number::text;
  end loop;

  insert into public.restaurants (name, slug)
  values (restaurant_name, restaurant_slug)
  returning id into restaurant_id;

  insert into public.restaurant_members (restaurant_id, user_id, role)
  values (restaurant_id, new.id, 'owner');

  return new;
end;
$function$;

revoke all on function private.handle_new_auth_user()
  from public, anon, authenticated;
grant execute on function private.handle_new_auth_user() to supabase_auth_admin;

commit;
