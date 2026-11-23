begin;

do $backfill$
declare
  v_user record;
  v_restaurant_name text;
  v_base_slug text;
  v_slug text;
  v_suffix integer;
  v_restaurant_id uuid;
begin
  for v_user in
    select u.id, u.raw_user_meta_data
    from auth.users u
    where not exists (
      select 1 from public.restaurant_members m where m.user_id = u.id
    )
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('restaurant-backfill:' || v_user.id::text, 0)
    );
    if exists (select 1 from public.restaurant_members m where m.user_id = v_user.id) then
      continue;
    end if;

    insert into public.profiles (id, display_name)
    values (v_user.id, nullif(pg_catalog.btrim(v_user.raw_user_meta_data ->> 'name'), ''))
    on conflict (id) do nothing;

    v_restaurant_name := left(coalesce(
      nullif(pg_catalog.btrim(v_user.raw_user_meta_data ->> 'restaurant_name'), ''),
      'Meu restaurante'
    ), 120);
    v_base_slug := pg_catalog.regexp_replace(
      pg_catalog.translate(
        pg_catalog.lower(pg_catalog.btrim(v_restaurant_name)),
        'áàãâäéèêëíìîïóòõôöúùûüçñ',
        'aaaaaeeeeiiiiooooouuuucn'
      ),
      '[^a-z0-9]+', '-', 'g'
    );
    v_base_slug := pg_catalog.regexp_replace(v_base_slug, '(^-+|-+$)', '', 'g');
    v_base_slug := coalesce(nullif(v_base_slug, ''), 'restaurante');
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_base_slug, 0));
    v_slug := v_base_slug;
    v_suffix := 1;
    while exists (select 1 from public.restaurants r where r.slug = v_slug) loop
      v_suffix := v_suffix + 1;
      v_slug := v_base_slug || '-' || v_suffix::text;
    end loop;

    insert into public.restaurants (name, slug)
    values (v_restaurant_name, v_slug)
    returning id into v_restaurant_id;
    insert into public.restaurant_members (restaurant_id, user_id, role)
    values (v_restaurant_id, v_user.id, 'owner');
  end loop;
end;
$backfill$;

commit;
