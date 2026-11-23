"use client";

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, ClipboardList, LayoutDashboard, LogOut, Menu, Store, UtensilsCrossed, X, Box, QrCode } from "lucide-react";
import { Brand } from "@/src/components/brand/Brand";
import { signOutAction } from "@/src/app/auth/actions";
import { DashboardOrderNotificationBell } from "@/src/components/dashboard/DashboardOrderNotificationBell";

type DashboardRestaurant = { id: string; name: string; slug: string; isPublished: boolean; logoUrl: string | null };

export function DashboardShell({
  children,
  email,
  restaurant,
  role,
  tableCount,
  restaurantIds,
}: {
  children: ReactNode;
  email: string;
  restaurant: DashboardRestaurant | null;
  role: string | null;
  tableCount: number | null;
  restaurantIds: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState("Visão geral");
  const asideRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const wide = expanded || mobileOpen;
  const restaurantHref = restaurant ? `/dashboard/restaurant/${restaurant.id}` : "/dashboard#visao-geral";
  const menuHref = restaurant ? `/dashboard/restaurant/${restaurant.id}/menu` : "/dashboard#visao-geral";
  const ordersHref = restaurant ? `/dashboard/restaurant/${restaurant.id}/orders` : "/dashboard#visao-geral";
  const desktopPointer = () => window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;

  useEffect(() => {
    const syncActive = () => {
      if (pathname === "/dashboard") setActiveView("Visão geral");
      else if (pathname.endsWith("/orders")) setActiveView("Pedidos");
      else if (pathname.endsWith("/qr")) setActiveView("QR Code");
      else if (pathname.endsWith("/menu")) setActiveView("Cardápio");
      else setActiveView("Meu restaurante");
    };
    syncActive();
  }, [pathname]);

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false);
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={`min-h-screen transition-[grid-template-columns] duration-200 ease-out lg:grid ${expanded ? "lg:grid-cols-[248px_minmax(0,1fr)]" : "lg:grid-cols-[76px_minmax(0,1fr)]"}`}>
      {mobileOpen && <button type="button" aria-label="Fechar navegação" onClick={closeMobile} className="fixed inset-0 z-30 bg-black/45 lg:hidden" />}

      <aside
        ref={asideRef}
        onMouseEnter={() => { if (desktopPointer()) setExpanded(true); }}
        onMouseLeave={() => { if (desktopPointer() && !asideRef.current?.contains(document.activeElement)) setExpanded(false); }}
        onFocusCapture={() => { if (desktopPointer()) setExpanded(true); }}
        onBlurCapture={handleBlur}
        aria-label="Painel do restaurante"
        className={`fixed inset-y-0 left-0 z-40 ${mobileOpen ? "flex" : "hidden lg:flex"} h-screen w-[248px] flex-col bg-[#193B2B] py-5 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:w-full lg:py-7 ${mobileOpen ? "translate-x-0 px-5" : "-translate-x-full px-5 lg:translate-x-0 lg:px-2"} ${expanded ? "lg:px-5" : ""}`}
      >
        <div>
          <div className={`flex items-center ${wide ? "justify-between" : "justify-center"}`}>
            <Link href="/dashboard" onClick={closeMobile} aria-label="MesaViva 3D — visão geral" className="inline-flex">
              {wide ? <Brand compact inverse /> : <Brand compact inverse iconOnly />}
            </Link>
            {mobileOpen && <button type="button" onClick={closeMobile} aria-label="Fechar menu" className="flex size-9 items-center justify-center rounded-md text-white/75 hover:bg-white/10 hover:text-white"><X size={19} /></button>}
          </div>

          <div title={restaurant?.name ?? "Seu restaurante"} className={`mt-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[.06] ${wide ? "p-3.5" : "p-2 lg:justify-center"}`}>
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#6F9F72] text-white">{restaurant?.logoUrl ? <img src={restaurant.logoUrl} alt={`Logo de ${restaurant.name}`} className="size-full object-cover" /> : <Store size={18} />}</span>
            {wide && <div className="min-w-0"><p className="truncate text-sm font-semibold">{restaurant?.name ?? "Seu restaurante"}</p><p className="mt-1 truncate text-xs text-white/65">{role === "owner" ? "Proprietário" : role ? "Equipe do restaurante" : "Área do restaurante"}</p></div>}
          </div>

          <nav aria-label="Navegação do painel" className="mt-7 grid gap-2">
            {[
              { href: "/dashboard#visao-geral", label: "Visão geral", icon: LayoutDashboard },
              { href: restaurantHref, label: "Meu restaurante", icon: Store },
              { href: menuHref, label: "Cardápio", icon: UtensilsCrossed },
              ...(restaurant ? [
                { href: `${menuHref}#produtos3d`, label: "Pratos 3D", icon: Box },
              ] : []),
              { href: ordersHref, label: "Pedidos", icon: ClipboardList },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => { setActiveView(label); closeMobile(); }}
                title={wide ? undefined : label}
                aria-label={label}
                className={`flex min-h-10 items-center rounded-md text-sm font-medium transition ${wide ? "justify-start gap-3 px-3" : "justify-center px-2 lg:px-0"} ${activeView === label ? "bg-[#6F9F72] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={17} className="shrink-0" />
                {wide && <span>{label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className={`mt-auto flex items-center border-t border-white/10 pt-5 ${wide ? "justify-between gap-3" : "justify-center"}`}>
          {wide && <div className="min-w-0"><p className="truncate text-xs font-semibold">{email}</p><p className="mt-1 text-[11px] text-white/65">Conta do restaurante</p></div>}
          <form action={signOutAction}>
            <button aria-label="Sair da conta" title="Sair da conta" className="flex size-9 shrink-0 items-center justify-center rounded-md text-white/75 transition hover:bg-white/10 hover:text-white"><LogOut size={17} /></button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="flex min-h-[68px] items-center justify-between gap-3 border-b border-[#234B39]/10 bg-white/85 px-5 backdrop-blur sm:px-8">
          <button type="button" aria-label={mobileOpen ? "Fechar navegação" : "Abrir navegação"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="flex size-10 shrink-0 items-center justify-center rounded-md text-[#234B39] transition hover:bg-[#EAF1E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315F42] lg:hidden">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
            {restaurant && <span className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold sm:inline-flex ${restaurant.isPublished ? "bg-[#EAF3E9] text-[#315A3C]" : "bg-[#F1F3EF] text-[#667168]"}`}><span className={`size-2 rounded-full ${restaurant.isPublished ? "bg-[#6F9F72]" : "bg-[#A8AEA8]"}`} />{restaurant.isPublished ? "Cardápio online" : "Em rascunho"}</span>}
            {restaurant && tableCount !== null && <span className="hidden items-center gap-2 text-xs text-[#667168] md:inline-flex"><Armchair size={15} className="text-[#758078]"/>{tableCount} {tableCount === 1 ? "mesa sincronizada" : "mesas sincronizadas"}</span>}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {restaurant && <Link href={`/dashboard/restaurant/${restaurant.id}/qr`} aria-label="Abrir QR Code do cardápio" title="QR Code do cardápio" className="hidden size-9 items-center justify-center rounded-md text-[#667168] transition hover:bg-[#F1F3EF] hover:text-[#234B39] sm:inline-flex"><QrCode size={17}/></Link>}
            {restaurant && <DashboardOrderNotificationBell restaurantIds={restaurantIds} href={ordersHref} />}
            <Link href={restaurantHref} aria-label={`Conta: ${email}`} title={email} className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#315F42] text-xs font-bold uppercase text-white ring-2 ring-[#EAF3E9]">{restaurant?.logoUrl ? <img src={restaurant.logoUrl} alt={`Logo de ${restaurant.name}`} className="size-full object-cover" /> : email.trim().charAt(0) || "R"}</Link>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mt-auto border-t border-[#234B39]/10 bg-[#EDF1EA] px-5 py-3 text-xs text-[#788078] sm:px-8"><div className="flex flex-wrap items-center justify-between gap-2"><span>© 2026 MesaViva 3D</span><span>Desenvolvido por <strong className="font-semibold text-[#234B39]">NxS Systems</strong></span></div></footer>
      </div>
    </div>
  );
}
