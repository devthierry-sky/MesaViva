import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, UtensilsCrossed } from "lucide-react";
import { ProductCard } from "@/components/menu/ProductCard";
import { Brand } from "@/src/components/brand/Brand";
import { demoMenu } from "@/src/lib/demo-menu";
import { createClient } from "@/src/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/env";
import { SiteFooter } from "@/src/components/site/SiteFooter";
import { OrderMenuExperience } from "@/src/components/menu/OrderMenuExperience";
import { QRAccessReporter } from "@/src/components/menu/QRAccessReporter";
import type { PublicRestaurantMenu } from "@/src/types/menu";

type MenuPageProps = { params: Promise<{ restaurantSlug: string }>; searchParams: Promise<{ origem?: string; mesa?: string }> };
type DatabaseMenu = PublicRestaurantMenu & { restaurantId?: string; isPublished: boolean; restaurantPhone?: string; address?: string; instagram?: string };

export function generateStaticParams() {
  return [{ restaurantSlug: demoMenu.slug }];
}

async function getPublishedMenu(slug: string): Promise<DatabaseMenu | null> {
  if (slug === demoMenu.slug) return { ...demoMenu, isPublished: true };
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id,name,description,slug,is_published,phone,address,instagram,categories(id,name,description,sort_order,is_active,products(id,category_id,name,description,price_cents,is_available,sort_order,product_assets(asset_type,storage_path,sort_order)))")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as {
    id: string; name: string; description: string | null; slug: string; is_published: boolean; phone: string | null; address: string | null; instagram: string | null;
    categories: Array<{
      id: string; name: string; description: string | null; sort_order: number; is_active: boolean;
      products: Array<{ id: string; category_id: string; name: string; description: string | null; price_cents: number; is_available: boolean; sort_order: number; product_assets: Array<{ asset_type: string; storage_path: string; sort_order: number }> }>;
    }>;
  };
  const categories = (row.categories ?? []).filter((category) => category.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const databaseProducts = categories.flatMap((category) => category.products
    .filter((product) => product.is_available)
    .sort((a, b) => a.sort_order - b.sort_order));
  const products = await Promise.all(databaseProducts.map(async (product) => {
    const assets = (product.product_assets ?? []).sort((a, b) => a.sort_order - b.sort_order);
    const imageAsset = assets.find((asset) => asset.asset_type === "image");
    const modelAsset = assets.find((asset) => asset.asset_type === "glb");
    const [imageResult, modelResult] = await Promise.all([
      imageAsset ? supabase.storage.from("restaurant-assets").createSignedUrl(imageAsset.storage_path, 3600) : Promise.resolve({ data: null }),
      modelAsset ? supabase.storage.from("restaurant-assets").createSignedUrl(modelAsset.storage_path, 3600) : Promise.resolve({ data: null }),
    ]);
    return {
      id: product.id,
      categoryId: product.category_id,
      name: product.name,
      description: product.description ?? "",
      priceCents: product.price_cents,
      available: product.is_available,
      imageUrl: imageResult.data?.signedUrl,
      modelGlbUrl: modelResult.data?.signedUrl,
      modelAlt: `Foto de ${product.name} para visualizar na mesa`,
    };
  }));

  return {
    restaurantId: row.id,
    slug: row.slug,
    name: row.name,
    restaurantPhone: row.phone ?? undefined,
    address: row.address ?? undefined,
    instagram: row.instagram ?? undefined,
    tagline: row.description || "Confira os pratos e as opções da casa.",
    isPublished: row.is_published,
    categories: categories.map(({ id, name, description }) => ({ id, name, description: description || undefined })),
    products,
  };
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const menu = await getPublishedMenu(restaurantSlug);
  if (!menu) return {};
  return { title: `${menu.name} | MesaViva 3D`, description: menu.tagline };
}

export default function PublicMenuPage({ params, searchParams }: MenuPageProps) {
  return <Suspense fallback={<main className="min-h-screen bg-[#F4F6F2]" aria-label="Carregando cardápio" />}><PublicMenuContent params={params} searchParams={searchParams} /></Suspense>;
}

async function PublicMenuContent({ params, searchParams }: MenuPageProps) {
  const [{ restaurantSlug }, query] = await Promise.all([params, searchParams]);
  const menu = await getPublishedMenu(restaurantSlug);
  if (!menu) notFound();
  const isDemo = restaurantSlug === demoMenu.slug;
  let tableLabel: string | undefined;
  let invalidTable = false;
  if (query.mesa && !isDemo) {
    if (!menu.restaurantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.mesa)) invalidTable = true;
    else {
      const supabase = await createClient();
      const { data: table } = await supabase.from("restaurant_tables").select("id,label").eq("id", query.mesa).eq("restaurant_id", menu.restaurantId).eq("is_active", true).maybeSingle();
      if (table) tableLabel = table.label;
      else invalidTable = true;
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F6F2] text-[#202923]">
      <header className="border-b border-[#234B39]/10 bg-[#F4F6F2]"><div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"><Brand compact /><span className="inline-flex items-center gap-2 rounded-full border border-[#3D7856]/20 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#315A3C]"><UtensilsCrossed size={13} /><span className="sm:hidden">Cardápio</span><span className="hidden sm:inline">{isDemo ? "Cardápio de demonstração" : "Cardápio digital"}</span></span></div></header>

      <section className="bg-[#234B39] text-white"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white"><ArrowLeft size={15} /> MesaViva 3D</Link><div className="mt-9 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.19em] text-[#B8D3B8]">{isDemo ? "Restaurante de demonstração" : "Cardápio do restaurante"}</p><h1 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-[-.04em] sm:text-6xl">{menu.name}</h1><p className="mt-4 max-w-xl text-base leading-7 text-white/75 sm:text-lg">{menu.tagline}{isDemo ? " Veja as fotos dos pratos e, em aparelhos compatíveis, coloque-as na mesa." : " Consulte os pratos, ingredientes e preços da casa."}</p>{tableLabel && <p className="mt-5 inline-flex items-center rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white">Pedido para {tableLabel}</p>}</div></div></section>

      {invalidTable && <div role="alert" className="mx-auto mt-6 max-w-7xl px-5 sm:px-8"><p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Este QR de mesa está desativado ou não pertence a este restaurante. Peça à equipe um código atualizado.</p></div>}
      {query.origem === "qr" && !isDemo && <QRAccessReporter slug={restaurantSlug} />}
      {(menu.address || menu.instagram) && <div className="border-b border-[#234B39]/10 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-5 py-3 text-sm text-[#687168] sm:px-8">{menu.address && <span>{menu.address}</span>}{menu.instagram && <a href={`https://instagram.com/${menu.instagram}`} target="_blank" rel="noreferrer" className="font-medium text-[#315A3C]">Instagram @{menu.instagram} ↗</a>}</div></div>}

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside><p className="text-xs font-bold uppercase tracking-[.17em] text-[#758078]">Neste cardápio</p><nav aria-label="Categorias do cardápio" className="mt-4 grid gap-2 lg:sticky lg:top-28">{menu.categories.map((category) => <a key={category.id} href={`#category-${category.id}`} className="flex items-center justify-between rounded-md border border-[#234B39]/10 bg-white px-4 py-3 text-sm font-semibold text-[#38443B] transition hover:border-[#3D7856]/40 hover:text-[#315A3C]">{category.name}<ArrowUpRight size={14} className="text-[#3D7856]" /></a>)}</nav></aside>
        {(!isDemo && menu.restaurantPhone && !invalidTable) ? <OrderMenuExperience slug={restaurantSlug} tableId={tableLabel ? query.mesa : undefined}><div className="min-w-0 space-y-12">
          {menu.categories.length ? menu.categories.map((category) => {
            const products = menu.products.filter((product) => product.categoryId === category.id);
            return <section key={category.id} id={`category-${category.id}`} aria-labelledby={`heading-${category.id}`} className="scroll-mt-28"><div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#234B39]/15 pb-4"><div><h2 id={`heading-${category.id}`} className="font-serif text-3xl font-medium tracking-[-.03em]">{category.name}</h2></div>{category.description && <p className="max-w-sm text-sm leading-6 text-[#687168]">{category.description}</p>}</div>{products.length ? <div className="grid gap-5">{products.map((product) => <ProductCard key={product.id} product={{ ...product, illustrativePrice: isDemo }} allowOrder qrTrackingSlug={query.origem === "qr" && !isDemo ? restaurantSlug : undefined} />)}</div> : <p className="rounded-md border border-dashed border-[#234B39]/20 bg-white p-6 text-sm text-[#687168]">Ainda não há pratos disponíveis nesta categoria.</p>}</section>;
          }) : <div className="rounded-lg border border-dashed border-[#234B39]/20 bg-white px-6 py-12 text-center"><h2 className="font-serif text-2xl font-medium">O cardápio está sendo preparado</h2><p className="mt-2 text-sm text-[#687168]">Volte em breve para conhecer as opções da casa.</p></div>}
        </div></OrderMenuExperience> : <div className="min-w-0 space-y-12">
          {menu.categories.length ? menu.categories.map((category) => {
            const products = menu.products.filter((product) => product.categoryId === category.id);
            return <section key={category.id} id={`category-${category.id}`} aria-labelledby={`heading-${category.id}`} className="scroll-mt-28"><div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#234B39]/15 pb-4"><h2 id={`heading-${category.id}`} className="font-serif text-3xl font-medium tracking-[-.03em]">{category.name}</h2>{category.description && <p className="max-w-sm text-sm leading-6 text-[#687168]">{category.description}</p>}</div>{products.length ? <div className="grid gap-5">{products.map((product) => <ProductCard key={product.id} product={{ ...product, illustrativePrice: isDemo }} qrTrackingSlug={query.origem === "qr" && !isDemo ? restaurantSlug : undefined} />)}</div> : <p className="rounded-md border border-dashed border-[#234B39]/20 bg-white p-6 text-sm text-[#687168]">Ainda não há pratos disponíveis nesta categoria.</p>}</section>;
          }) : <div className="rounded-lg border border-dashed border-[#234B39]/20 bg-white px-6 py-12 text-center"><h2 className="font-serif text-2xl font-medium">O cardápio está sendo preparado</h2><p className="mt-2 text-sm text-[#687168]">Volte em breve para conhecer as opções da casa.</p></div>}
        </div>}
      </div>
      <SiteFooter />
    </main>
  );
}
