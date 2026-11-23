begin;

create policy "Restaurant staff read their restaurant logos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'restaurant-assets'
    and split_part(name, '/', 2) = 'logo'
    and split_part(name, '/', 3) <> ''
    and pg_catalog.array_length(pg_catalog.string_to_array(name, '/'), 1) = 3
    and (select private.has_restaurant_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager', 'editor', 'viewer']::public.restaurant_role[]
    ))
  );

create policy "Public can read logos for published restaurants"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1 from public.restaurants restaurant
      where restaurant.logo_path = storage.objects.name
        and restaurant.is_published
    )
  );

create policy "Restaurant managers upload restaurant logos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'restaurant-assets'
    and split_part(name, '/', 2) = 'logo'
    and split_part(name, '/', 3) <> ''
    and pg_catalog.array_length(pg_catalog.string_to_array(name, '/'), 1) = 3
    and (select private.has_restaurant_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']::public.restaurant_role[]
    ))
  );

create policy "Restaurant managers delete restaurant logos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'restaurant-assets'
    and split_part(name, '/', 2) = 'logo'
    and split_part(name, '/', 3) <> ''
    and pg_catalog.array_length(pg_catalog.string_to_array(name, '/'), 1) = 3
    and (select private.has_restaurant_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']::public.restaurant_role[]
    ))
  );

commit;
