import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/src/components/brand/Brand";

const links = [
  ["#beneficios", "Benefícios"],
  ["#como-funciona", "Como funciona"],
  ["#comparativo-demo", "Demonstração"],
  ["#planos", "Planos"],
] as const;

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#111513]/75 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
        <Brand compact inverse />
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 xl:flex" aria-label="Navegação principal">
          {links.map(([href, label]) => <Link key={href} href={href} className="transition hover:text-white">{label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex">Entrar</Link>
          <Link href="/register" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-[#6F9F72] px-3 text-xs font-bold text-[#182B20] transition hover:bg-[#8ABA8B] sm:gap-2 sm:px-4 sm:text-sm"><span className="sm:hidden">Começar</span><span className="hidden sm:inline">Para restaurantes</span><ArrowUpRight size={15} /></Link>
        </div>
      </div>
      <nav className="flex gap-6 overflow-x-auto border-t border-white/10 px-4 py-2.5 text-xs font-semibold text-white/65 xl:hidden sm:px-8" aria-label="Navegação móvel">
        {links.map(([href, label]) => <Link key={href} href={href} className="shrink-0">{label}</Link>)}
      </nav>
    </header>
  );
}
