import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Brand } from "@/src/components/brand/Brand";
import { SiteFooter } from "@/src/components/site/SiteFooter";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  register = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  register?: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#F8F6F0] text-[#202923]">
      <header className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand compact />
        <Link href="/" aria-label="Voltar ao início" className="inline-flex items-center gap-2 text-sm font-medium text-[#626C64] transition hover:text-[#315F42]"><ArrowLeft size={15} /><span className="sm:hidden">Início</span><span className="hidden sm:inline">Voltar ao início</span></Link>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-4 sm:px-8 lg:grid-cols-[1fr_.92fr] lg:gap-16 lg:pb-20 lg:pt-8">
        <aside className="relative hidden min-h-[660px] overflow-hidden rounded-xl bg-[#283B31] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-28 -top-24 size-96 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-4 size-56 rounded-full border border-[#A6C6A1]/25" />
          <div className="absolute bottom-24 left-20 size-36 rounded-full bg-[#6F9F72]/25 blur-3xl" />
          <div className="relative z-10"><span className="inline-flex rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.17em] text-[#A6C6A1]">{register ? "Espaço do proprietário" : "Acesso à sua conta"}</span><h2 className="mt-7 max-w-lg font-serif text-5xl font-medium leading-[1.08] tracking-[-.04em]">Uma apresentação melhor para a comida da sua casa</h2><p className="mt-5 max-w-md text-base leading-7 text-white/65">A área de gestão é reservada a quem administra o restaurante. Para consultar os pratos, os clientes continuam acessando o cardápio público sem criar conta.</p></div>
          <div className="relative z-10 border-t border-white/15 pt-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#A6C6A1]">Feito para restaurantes</p><ul className="mt-4 grid gap-3 text-sm text-white/75"><li className="flex items-center gap-2"><Check size={15} className="text-[#A6C6A1]" /> Página pública do cardápio</li><li className="flex items-center gap-2"><Check size={15} className="text-[#A6C6A1]" /> Visualização 3D dos pratos</li><li className="flex items-center gap-2"><Check size={15} className="text-[#A6C6A1]" /> Acesso dedicado ao proprietário</li></ul></div>
        </aside>
        <section className="flex items-center justify-center py-4 lg:py-10">
          <div className="w-full max-w-[460px] rounded-xl border border-[#26382D]/10 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(30,40,33,.4)] sm:p-10">
            <div className="mb-8 lg:hidden"><Brand /></div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#315F42]">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-[-.035em] sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[#687168]">{description}</p>
            {children}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
