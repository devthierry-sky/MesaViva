"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export function DashboardOrdersRealtime({ restaurantIds }: { restaurantIds: string[] }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const idsKey = restaurantIds.join(",");

  useEffect(() => {
    if (!restaurantIds.length) return;
    const supabase = createClient();
    const subscribed = new Set<string>();
    const channels = restaurantIds.map((restaurantId) => supabase
      .channel(`dashboard-orders-${restaurantId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${restaurantId}`,
      }, () => router.refresh())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") subscribed.add(restaurantId);
        else subscribed.delete(restaurantId);
        setConnected(subscribed.size === restaurantIds.length);
      }));

    return () => {
      channels.forEach((channel) => { void supabase.removeChannel(channel); });
    };
    // idsKey represents the stable list of authorized restaurants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, router]);

  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${connected ? "bg-[#EAF3E9] text-[#315A3C]" : "bg-[#F1F3EF] text-[#758078]"}`}><span className={`size-1.5 rounded-full ${connected ? "animate-pulse bg-[#6F9F72]" : "bg-[#9AA39A]"}`} />{connected ? "Ao vivo" : "Conectando"}</span>;
}
