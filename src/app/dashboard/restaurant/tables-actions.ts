"use server";

import { revalidatePath } from "next/cache";
import { getDashboardContext } from "@/src/lib/dashboard/context";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function canManageTables(restaurantId: string) {
  if (!UUID.test(restaurantId)) return false;
  const { memberships } = await getDashboardContext();
  return memberships.some((membership) => {
    const restaurant = membership.restaurants as unknown as { id: string } | null;
    return restaurant?.id === restaurantId && ["owner", "manager", "editor"].includes(membership.role);
  });
}

export async function createRestaurantTable(restaurantId: string, inputLabel: string) {
  const label = inputLabel.trim();
  if (!UUID.test(restaurantId) || label.length < 1 || label.length > 40) return { error: "Informe um nome de mesa com até 40 caracteres." };
  if (!(await canManageTables(restaurantId))) return { error: "Você não tem permissão para gerenciar as mesas deste restaurante." };

  const { supabase } = await getDashboardContext();
  const { data, error } = await supabase.from("restaurant_tables").insert({ restaurant_id: restaurantId, label }).select("id,label,is_active").single();
  if (error?.code === "23505") return { error: "Já existe uma mesa com esse nome." };
  if (error) return { error: "Não foi possível criar a mesa. Tente novamente." };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/restaurant/${restaurantId}/qr`);
  return { success: true, table: data };
}

export async function setRestaurantTableActive(restaurantId: string, tableId: string, isActive: boolean) {
  if (!UUID.test(restaurantId) || !UUID.test(tableId) || typeof isActive !== "boolean") return { error: "Dados da mesa inválidos." };
  if (!(await canManageTables(restaurantId))) return { error: "Você não tem permissão para gerenciar as mesas deste restaurante." };

  const { supabase } = await getDashboardContext();
  const { data, error } = await supabase.from("restaurant_tables").update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", tableId).eq("restaurant_id", restaurantId).select("id").maybeSingle();
  if (error || !data) return { error: "Não foi possível atualizar a mesa." };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/restaurant/${restaurantId}/qr`);
  revalidatePath(`/dashboard/restaurant/${restaurantId}/orders`);
  return { success: true };
}
