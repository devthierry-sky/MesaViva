"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { buildPhotoAssets } from "@/src/lib/ar/buildPhotoAssets";

type FormState = { error?: string; success?: boolean };

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireRestaurantRole(restaurantId: string, roles: string[]) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (authError || typeof userId !== "string") redirect("/login");

  const { data: membership, error } = await supabase
    .from("restaurant_members")
    .select("role")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !membership || !roles.includes(membership.role)) redirect("/dashboard");
  return supabase;
}

export async function updateRestaurantAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const restaurantId = readText(formData, "restaurantId");
  const name = readText(formData, "name");
  const description = readText(formData, "description");
  const phone = readText(formData, "phone");
  const phoneDigits = phone.replace(/\D/g, "");
  const address = readText(formData, "address");
  const instagram = readText(formData, "instagram").replace(/^@/, "");
  const logoEntry = formData.get("logo");
  const logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;
  if (!restaurantId) return { error: "Restaurante não identificado." };
  if (name.length < 2 || name.length > 120) return { error: "O nome deve ter entre 2 e 120 caracteres." };
  if (description.length > 1000 || address.length > 240 || instagram.length > 40) return { error: "Confira os limites dos campos e tente novamente." };
  if (phone && (phoneDigits.length < 10 || phoneDigits.length > 15)) return { error: "Informe o WhatsApp com código do país e DDD. Exemplo: 5511999999999." };
  if (instagram && !/^[a-zA-Z0-9._]{1,40}$/.test(instagram)) return { error: "Informe apenas o usuário do Instagram, sem o link." };
  if (logoFile && logoFile.size > 2 * 1024 * 1024) return { error: "A foto deve ter no máximo 2 MB." };
  if (logoFile && !["image/jpeg", "image/png", "image/webp"].includes(logoFile.type)) return { error: "Use uma foto JPG, PNG ou WebP." };

  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager"]);
  const { data: currentRestaurant, error: currentError } = await supabase.from("restaurants").select("logo_path").eq("id", restaurantId).maybeSingle();
  if (currentError || !currentRestaurant) return { error: "Não foi possível carregar os dados atuais do restaurante." };
  let newLogoPath: string | null = null;
  if (logoFile) {
    const extension = logoFile.type === "image/jpeg" ? "jpg" : logoFile.type === "image/png" ? "png" : "webp";
    newLogoPath = `${restaurantId}/logo/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("restaurant-assets").upload(newLogoPath, new Uint8Array(await logoFile.arrayBuffer()), {
      contentType: logoFile.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) return { error: "Não foi possível enviar a foto. Confira as políticas de armazenamento do Supabase." };
  }
  const { error } = await supabase
    .from("restaurants")
    .update({ name, description: description || null, phone: phoneDigits || null, address: address || null, instagram: instagram || null, is_published: formData.get("isPublished") === "on", ...(newLogoPath ? { logo_path: newLogoPath } : {}) })
    .eq("id", restaurantId);
  if (error) {
    if (newLogoPath) await supabase.storage.from("restaurant-assets").remove([newLogoPath]);
    return { error: "Não foi possível salvar os dados. Confira se as migrações do Supabase estão aplicadas." };
  }
  if (newLogoPath && currentRestaurant.logo_path) await supabase.storage.from("restaurant-assets").remove([currentRestaurant.logo_path]);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/restaurant/${restaurantId}`);
  revalidatePath("/menu/[restaurantSlug]", "page");
  return { success: true };
}

export async function updateCategoryAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId");
  const categoryId = readText(formData, "categoryId");
  const name = readText(formData, "name");
  const description = readText(formData, "description");
  if (!restaurantId || !categoryId || !name || name.length > 80 || description.length > 500) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=invalid-category`);
  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const slug = `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "categoria"}-${crypto.randomUUID().slice(0, 8)}`;
  const { error } = await supabase.from("categories").update({ name, description: description || null, slug }).eq("id", categoryId).eq("restaurant_id", restaurantId);
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-error`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`); revalidatePath("/menu/[restaurantSlug]", "page");
  redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-updated`);
}

export async function deleteCategoryAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId"); const categoryId = readText(formData, "categoryId");
  if (!restaurantId || !categoryId) return;
  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId).eq("category_id", categoryId);
  if (count) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-not-empty`);
  const { error } = await supabase.from("categories").delete().eq("restaurant_id", restaurantId).eq("id", categoryId);
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-error`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`); revalidatePath("/menu/[restaurantSlug]", "page");
  redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-deleted`);
}

export async function updateProductAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId"); const productId = readText(formData, "productId");
  const categoryId = readText(formData, "categoryId"); const name = readText(formData, "name");
  const description = readText(formData, "description"); const price = Number(readText(formData, "price"));
  if (!restaurantId || !productId || !categoryId || !name || name.length > 120 || description.length > 2000 || !Number.isFinite(price) || price < 0 || price > 100000) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=invalid-product`);
  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const { error } = await supabase.from("products").update({ category_id: categoryId, name, description: description || null, price_cents: Math.round(price * 100) }).eq("restaurant_id", restaurantId).eq("id", productId);
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-error`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`); revalidatePath("/menu/[restaurantSlug]", "page");
  redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-updated`);
}

export async function setProductAvailabilityAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId"); const productId = readText(formData, "productId");
  if (!restaurantId || !productId) return;
  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const { error } = await supabase.from("products").update({ is_available: formData.get("available") === "true" }).eq("restaurant_id", restaurantId).eq("id", productId);
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-error`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`); revalidatePath("/menu/[restaurantSlug]", "page");
}

export async function deleteProductAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId"); const productId = readText(formData, "productId");
  if (!restaurantId || !productId) return;
  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const { count: orderCount } = await supabase.from("order_items").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId).eq("product_id", productId);
  if (orderCount) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-used-in-order`);
  const { data: assets, error: assetError } = await supabase.from("product_assets").select("storage_path").eq("restaurant_id", restaurantId).eq("product_id", productId);
  if (assetError) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-error`);
  if (assets?.length) {
    const { error } = await supabase.storage.from("restaurant-assets").remove(assets.map((asset) => asset.storage_path));
    if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=asset-error`);
  }
  const { error } = await supabase.from("products").delete().eq("restaurant_id", restaurantId).eq("id", productId);
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-error`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`); revalidatePath("/menu/[restaurantSlug]", "page");
  redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-deleted`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId"); const orderId = readText(formData, "orderId");
  const status = readText(formData, "status");
  if (!restaurantId || !orderId || !["pending", "confirmed", "preparing", "ready", "completed", "canceled"].includes(status)) return;
  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const { error } = await supabase.from("orders").update({ status }).eq("restaurant_id", restaurantId).eq("id", orderId);
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/orders?notice=order-error#pedidos`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/orders`); revalidatePath("/dashboard");
}

export async function createCategoryAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId");
  const name = readText(formData, "name");
  const description = readText(formData, "description");
  if (!restaurantId || name.length < 1 || name.length > 80 || description.length > 500) {
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=invalid-category`);
  }

  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const slugBase = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "categoria";
  const { error } = await supabase.from("categories").insert({
    restaurant_id: restaurantId,
    name,
    description: description || null,
    slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`,
  });
  if (error) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-error`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`);
  redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=category-created`);
}

export async function createProductAction(formData: FormData) {
  const restaurantId = readText(formData, "restaurantId");
  const categoryId = readText(formData, "categoryId");
  const name = readText(formData, "name");
  const description = readText(formData, "description");
  const price = Number(readText(formData, "price"));
  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=photo-required`);
  }
  if (imageFile.size > 900 * 1024) {
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=photo-too-large`);
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=photo-invalid`);
  }
  if (!restaurantId || !categoryId || name.length < 1 || name.length > 120 || description.length > 2000 || !Number.isFinite(price) || price < 0 || price > 100000) {
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=invalid-product`);
  }

  const supabase = await requireRestaurantRole(restaurantId, ["owner", "manager", "editor"]);
  const { data: category } = await supabase.from("categories").select("id").eq("id", categoryId).eq("restaurant_id", restaurantId).maybeSingle();
  if (!category) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=invalid-product`);

  const sourceImage = new Uint8Array(await imageFile.arrayBuffer());
  const { photo, model } = await buildPhotoAssets(sourceImage, 0.3);
  const { data: product, error } = await supabase.from("products").insert({
    restaurant_id: restaurantId,
    category_id: categoryId,
    name,
    description: description || null,
    price_cents: Math.round(price * 100),
  }).select("id").single();
  if (error || !product) redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-error`);

  const storage = supabase.storage.from("restaurant-assets");
  const photoPath = `${restaurantId}/${product.id}/${crypto.randomUUID()}-photo.jpg`;
  const modelPath = `${restaurantId}/${product.id}/${crypto.randomUUID()}-model.glb`;
  const uploadedPaths: string[] = [];
  const rollback = async () => {
    if (uploadedPaths.length) await storage.remove(uploadedPaths);
    await supabase.from("products").delete().eq("id", product.id).eq("restaurant_id", restaurantId);
  };
  const { error: photoError } = await storage.upload(photoPath, photo, { contentType: "image/jpeg", cacheControl: "3600", upsert: false });
  if (photoError) {
    await rollback();
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=asset-error`);
  }
  uploadedPaths.push(photoPath);
  const { error: modelError } = await storage.upload(modelPath, model, { contentType: "model/gltf-binary", cacheControl: "3600", upsert: false });
  if (modelError) {
    await rollback();
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=asset-error`);
  }
  uploadedPaths.push(modelPath);
  const { error: assetError } = await supabase.from("product_assets").insert([
    { restaurant_id: restaurantId, product_id: product.id, asset_type: "image", storage_path: photoPath, content_type: "image/jpeg", size_bytes: photo.length },
    { restaurant_id: restaurantId, product_id: product.id, asset_type: "glb", storage_path: modelPath, content_type: "model/gltf-binary", size_bytes: model.length },
  ]);
  if (assetError) {
    await rollback();
    redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=asset-error`);
  }
  revalidatePath(`/dashboard/restaurant/${restaurantId}/menu`);
  revalidatePath("/menu/[restaurantSlug]", "page");
  redirect(`/dashboard/restaurant/${restaurantId}/menu?notice=product-created`);
}
