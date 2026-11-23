begin;

-- Public menu pages receive short-lived signed URLs only for published,
-- available products. Draft assets remain private to restaurant members.
create policy "Public can sign assets for published menu products"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1
      from public.product_assets as asset
      join public.products as product
        on product.id = asset.product_id
       and product.restaurant_id = asset.restaurant_id
      join public.categories as category
        on category.id = product.category_id
       and category.restaurant_id = product.restaurant_id
      join public.restaurants as restaurant
        on restaurant.id = product.restaurant_id
      where asset.storage_path = storage.objects.name
        and asset.asset_type in ('image', 'glb')
        and product.is_available
        and category.is_active
        and restaurant.is_published
    )
  );

commit;
