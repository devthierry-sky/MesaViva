import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import { getDashboardContext } from "@/src/lib/dashboard/context";
import { RestaurantQRCode } from "@/src/components/dashboard/RestaurantQRCode";
import { RestaurantTableQRManager, type RestaurantTable } from "@/src/components/dashboard/RestaurantTableQRManager";

export default function QRPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  return <Suspense fallback={null}><Content params={params}/></Suspense>;
}

async function Content({ params }: { params: Promise<{ restaurantId: string }> }) {
  const [{ restaurantId }, context] = await Promise.all([params, getDashboardContext()]);
  const membership = context.memberships.find((member) => (member.restaurants as unknown as { id: string } | null)?.id === restaurantId);
  if (!membership) notFound();
  const { data: restaurant, error } = await context.supabase.from("restaurants").select("id,name,slug,is_published").eq("id", restaurantId).maybeSingle();
  if (error || !restaurant) notFound();
  const { data: tableRows, error: tablesError } = await context.supabase.from("restaurant_tables").select("id,label,is_active").eq("restaurant_id", restaurantId).order("created_at", { ascending: true });
  const tables = (tableRows ?? []) as RestaurantTable[];

  return <main className="min-h-full bg-[#F4F6F2] px-5 py-8 text-[#202923] sm:px-8 lg:px-10">
    <Link href={`/dashboard/restaurant/${restaurantId}`} className="inline-flex items-center gap-2 text-sm text-[#667168]"><ArrowLeft size={15}/>Meu restaurante</Link>
    <header className="mt-6 border-b border-[#234B39]/10 pb-7"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#3D7856]"><QrCode size={15}/>Divulgação</p><h1 className="mt-3 font-serif text-4xl">QR Code do cardápio</h1><p className="mt-2 text-sm text-[#667168]">Um código geral para o restaurante e um QR individual para cada mesa.</p></header>
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-lg border border-[#234B39]/10 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">QR geral</h2><p className="mt-1 text-sm text-[#667168]">Abre o cardápio sem identificar uma mesa.</p>{restaurant.is_published ? <div className="mt-5"><RestaurantQRCode slug={restaurant.slug} restaurantName={restaurant.name}/></div> : <p className="mt-5 rounded-md bg-[#F4F6F2] p-4 text-sm text-[#667168]">Publique o cardápio em <Link href={`/dashboard/restaurant/${restaurantId}#configuracoes`} className="font-semibold text-[#315F42]">Meu restaurante</Link> para ativar os QR Codes.</p>}</section>
      <section className="rounded-lg border border-[#234B39]/10 bg-white p-5 sm:p-7">{tablesError ? <p role="alert" className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">Não foi possível carregar as mesas cadastradas. Confira se a migration de QR por mesa foi aplicada no Supabase.</p> : <RestaurantTableQRManager restaurantId={restaurantId} slug={restaurant.slug} restaurantName={restaurant.name} initialTables={tables} canManage={["owner", "manager", "editor"].includes(membership.role)}/>}</section>
    </div>
  </main>;
}
