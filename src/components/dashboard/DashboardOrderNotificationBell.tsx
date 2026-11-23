"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";

type NewOrder = { id: string; restaurant_id: string; table_label_snapshot: string | null };

export function DashboardOrderNotificationBell({ restaurantIds, href }: { restaurantIds: string[]; href: string }) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [notice, setNotice] = useState<NewOrder | null>(null);
  const idsKey = restaurantIds.join(",");

  useEffect(() => {
    const ids = idsKey.split(",").filter(Boolean);
    if (!ids.length) return;
    const supabase = createClient();
    const channels = ids.map((restaurantId) => supabase
      .channel(`order-notifications-${restaurantId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${restaurantId}`,
      }, (payload) => {
        const order = payload.new as NewOrder;
        setUnread((count) => count + 1);
        setNotice(order);
        router.refresh();
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          const notification = new Notification("Novo pedido no MesaViva", {
            body: `${order.table_label_snapshot ? `${order.table_label_snapshot} · ` : ""}Pedido #${order.id.slice(0, 8)}`,
            tag: `order-${order.id}`,
          });
          notification.onclick = () => {
            window.focus();
            window.location.assign(href);
          };
        }
        window.setTimeout(() => setNotice((current) => current?.id === order.id ? null : current), 7000);
      })
      .subscribe());

    return () => { channels.forEach((channel) => { void supabase.removeChannel(channel); }); };
  }, [href, idsKey, router]);

  function openOrders() {
    setUnread(0);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  return <>
    <Link href={href} onClick={openOrders} aria-label={unread ? `Ver pedidos, ${unread} novos` : "Ver pedidos"} title={unread ? `${unread} pedido(s) novo(s)` : "Ver pedidos"} className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#667168] transition hover:bg-[#F1F3EF] hover:text-[#234B39]">
      <Bell size={17} />
      {unread > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#A94725] px-1 text-[9px] font-bold leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}
    </Link>
    {notice && <div role="status" aria-live="polite" className="fixed right-5 top-[78px] z-50 w-[min(360px,calc(100vw-2.5rem))] rounded-lg border border-[#234B39]/15 bg-white p-4 shadow-xl">
      <p className="text-sm font-bold text-[#234B39]">Chegou um pedido novo</p>
      <p className="mt-1 text-xs text-[#667168]">{notice.table_label_snapshot ? `${notice.table_label_snapshot} · ` : ""}Pedido #{notice.id.slice(0, 8)}</p>
      <Link href={href} onClick={openOrders} className="mt-3 inline-flex text-xs font-bold text-[#315F42]">Abrir pedidos →</Link>
    </div>}
  </>;
}
