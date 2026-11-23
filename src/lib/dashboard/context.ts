import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

// Layout and page components share this request-scoped result instead of
// repeating the same cookie/session and membership queries.
export const getDashboardContext = cache(async () => {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  const claims = authData?.claims;
  const userId = claims?.sub;
  if (authError || typeof userId !== "string") redirect("/login");

  const { data, error } = await supabase.from("restaurant_members")
    .select("role, restaurants(id,name,slug,is_published,logo_path,phone,categories(id,products(id,is_available)))")
    .eq("user_id", userId);

  return {
    supabase,
    claims,
    userId,
    memberships: data ?? [],
    membershipError: Boolean(error),
  };
});
