import { Suspense, type ReactNode } from "react";
import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { isSupabaseConfigured } from "@/src/lib/supabase/env";
import { getDashboardContext } from "@/src/lib/dashboard/context";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) return children;

  return <Suspense fallback={null}><AuthenticatedDashboardShell>{children}</AuthenticatedDashboardShell></Suspense>;
}

async function AuthenticatedDashboardShell({ children }: { children: ReactNode }) {
  const { claims, memberships, supabase } = await getDashboardContext();
  const firstMembership = memberships[0] as unknown as {
    role: string;
    restaurants: { id: string; name: string; slug: string; is_published: boolean; logo_path: string | null } | null;
  } | undefined;
  const row = firstMembership?.restaurants;
  let logoUrl: string | null = null;
  let tableCount: number | null = null;
  if (row) {
    if (row.logo_path) {
      const { data } = await supabase.storage.from("restaurant-assets").createSignedUrl(row.logo_path, 3600);
      logoUrl = data?.signedUrl ?? null;
    }
    const { count, error } = await supabase.from("restaurant_tables").select("id", { count: "exact", head: true }).eq("restaurant_id", row.id).eq("is_active", true);
    if (!error) tableCount = count ?? 0;
  }

  const restaurantIds = memberships.flatMap((membership) => {
    const related = membership.restaurants as unknown as { id: string } | null;
    return related ? [related.id] : [];
  });
  return <DashboardShell email={typeof claims?.email === "string" ? claims.email : "Sua conta"} role={firstMembership?.role ?? null} tableCount={tableCount} restaurantIds={restaurantIds} restaurant={row ? { id: row.id, name: row.name, slug: row.slug, isPublished: row.is_published, logoUrl } : null}>{children}</DashboardShell>;
}
