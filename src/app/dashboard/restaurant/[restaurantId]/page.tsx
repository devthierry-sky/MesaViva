import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { getDashboardContext } from "@/src/lib/dashboard/context";
import { RestaurantProfileForm } from "@/src/components/dashboard/RestaurantProfileForm";
import { RestaurantQRCode } from "@/src/components/dashboard/RestaurantQRCode";

export default function RestaurantPage({ params }: { params: Promise<{ restaurantId: string }> }) { return <Suspense fallback={null}><Content params={params}/></Suspense>; }
async function Content({ params }: { params: Promise<{ restaurantId: string }> }) {
 const [{ restaurantId }, ctx] = await Promise.all([params, getDashboardContext()]);
 if (!ctx.memberships.some((row) => (row.restaurants as unknown as {id:string}|null)?.id === restaurantId)) notFound();
 const {data: restaurant, error} = await ctx.supabase.from("restaurants").select("id,name,description,slug,is_published,phone,address,instagram,logo_path").eq("id", restaurantId).maybeSingle();
 if (error || !restaurant) notFound();
 const { data: signedLogo } = restaurant.logo_path ? await ctx.supabase.storage.from("restaurant-assets").createSignedUrl(restaurant.logo_path, 3600) : { data: null };
 const member=ctx.memberships.find((row)=>(row.restaurants as unknown as {id:string}|null)?.id===restaurantId)!;
 return <main className="min-h-full bg-[#F4F6F2] px-5 py-8 text-[#202923] sm:px-8 lg:px-10"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#667168]"><ArrowLeft size={15}/>Painel do restaurante</Link><header className="mt-6 border-b border-[#234B39]/10 pb-7"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#3D7856]"><Store size={14}/>Meu restaurante</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">{restaurant.name}</h1><p className="mt-3 text-sm text-[#667168]">Atualize a apresentação, os contatos e a publicação da sua página.</p></header><div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]"><section className="rounded-lg border border-[#234B39]/10 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">Apresentação</h2><p className="mb-6 mt-1.5 text-sm text-[#667168]">Informações exibidas no cardápio público.</p>{["owner","manager"].includes(member.role)?<RestaurantProfileForm restaurant={{...restaurant,logoUrl:signedLogo?.signedUrl ?? null}}/>:<p className="text-sm text-[#667168]">Somente proprietário ou gerente pode alterar as informações do restaurante.</p>}</section><section className="rounded-lg border border-[#234B39]/10 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">Compartilhe seu cardápio</h2><p className="mt-2 text-sm text-[#667168]">Link público: <Link className="font-medium text-[#315F42]" href={`/menu/${restaurant.slug}`} target="_blank">/menu/{restaurant.slug} ↗</Link></p>{restaurant.is_published?<div className="mt-5"><RestaurantQRCode slug={restaurant.slug}/></div>:<p className="mt-5 rounded-md bg-[#F4F6F2] p-4 text-sm text-[#667168]">Publique o cardápio para gerar seu QR Code.</p>}</section></div><nav className="mt-6 grid gap-3 sm:grid-cols-2"><Link className="rounded-lg border border-[#234B39]/10 bg-white p-5 font-semibold text-[#315F42]" href={`/dashboard/restaurant/${restaurantId}/menu`}>Gerenciar cardápio →</Link><Link className="rounded-lg border border-[#234B39]/10 bg-white p-5 font-semibold text-[#315F42]" href={`/dashboard/restaurant/${restaurantId}/orders`}>Acompanhar pedidos →</Link></nav></main>;
}
