"use server";

import { createClient } from "@/src/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/env";

export async function submitRestaurantOrder(input: {
  slug: string; customerName: string; customerPhone: string; notes: string;
  tableId?: string;
  items: Array<{ productId: string; quantity: number }>;
}) {
  if (!isSupabaseConfigured()) return { error: "Os pedidos ainda não estão configurados." };
  const name = input.customerName.trim(); const customerPhone = input.customerPhone.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || name.length < 2 || name.length > 120 || customerPhone.length < 8 || customerPhone.length > 40 || input.notes.length > 1000 || !input.items.length || input.items.length > 30 || (input.tableId !== undefined && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.tableId))) {
    return { error: "Confira seus dados e os itens do pedido." };
  }
  if (input.items.some((item) => !/^[0-9a-f-]{36}$/i.test(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)) {
    return { error: "Um dos itens do pedido está inválido. Atualize a página e tente de novo." };
  }
  const supabase = await createClient();
  const { data: restaurant, error: restaurantError } = await supabase.from("restaurants").select("id,name,phone").eq("slug", input.slug).eq("is_published", true).maybeSingle();
  if (restaurantError || !restaurant) return { error: "Este cardápio não está recebendo pedidos agora." };
  const waPhone = (restaurant.phone ?? "").replace(/\D/g, "");
  if (waPhone.length < 10 || waPhone.length > 15) return { error: "O restaurante ainda não cadastrou um WhatsApp válido para receber pedidos." };

  const { data, error } = await supabase.rpc("create_restaurant_order", {
    p_restaurant_slug: input.slug, p_customer_name: name, p_customer_phone: customerPhone,
    p_notes: input.notes.trim() || null, p_items: input.items, p_table_id: input.tableId ?? null,
  });
  if (error || !data || typeof data !== "object") return { error: "Não foi possível registrar o pedido. Tente novamente." };
  const result = data as { orderId?: string; totalCents?: number; tableLabel?: string | null; items?: Array<{ name: string; quantity: number; unitPriceCents: number }> };
  if (!result.orderId || typeof result.totalCents !== "number" || !Number.isInteger(result.totalCents) || !result.items?.length) return { error: "O pedido não foi confirmado. Atualize o cardápio e tente novamente." };
  const lines = result.items.map((item) => `${item.quantity}x ${item.name} — R$ ${(item.unitPriceCents / 100).toFixed(2).replace(".", ",")}`);
  const message = [`Olá, ${restaurant.name}! Acabei de fazer um pedido pelo cardápio.`, result.tableLabel ? `Mesa: ${result.tableLabel}` : "", `Pedido #${result.orderId.slice(0, 8)}`, ...lines, `Total: R$ ${(result.totalCents / 100).toFixed(2).replace(".", ",")}`, `Cliente: ${name}`, `Contato: ${customerPhone}`, input.notes.trim() ? `Observação: ${input.notes.trim()}` : ""].filter(Boolean).join("\n");
  return { success: true, orderId: result.orderId, tableLabel: result.tableLabel ?? null, whatsappUrl: `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}` };
}

export async function recordQrAccess(slug: string, sessionId: string) {
  if (!isSupabaseConfigured() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[0-9a-f-]{36}$/i.test(sessionId)) return;
  const supabase = await createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!restaurant) return;
  await supabase.from("menu_access_events").insert({ restaurant_id: restaurant.id, source: "qr", event_type: "qr_open", session_id: sessionId });
}

export async function recordQrProductAccess(slug: string, productId: string, sessionId: string) {
  if (!isSupabaseConfigured() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(sessionId)) return;
  const supabase = await createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!restaurant) return;
  await supabase.from("menu_access_events").insert({ restaurant_id: restaurant.id, product_id: productId, source: "qr", event_type: "product_view", session_id: sessionId });
}

export async function recordQr3dInteraction(slug: string, productId: string, sessionId: string) {
  if (!isSupabaseConfigured() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(sessionId)) return;
  const supabase = await createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!restaurant) return;
  await supabase.from("menu_access_events").insert({ restaurant_id: restaurant.id, product_id: productId, source: "qr", event_type: "3d_interaction", session_id: sessionId });
}
