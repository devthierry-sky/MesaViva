import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/src/components/brand/Brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#234B39]/10 bg-[#EDF1EA] text-[#234B39]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_.8fr_.8fr] md:py-16">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#687168]">Cardápios digitais com modelos 3D e realidade aumentada para aproximar o cliente dos pratos da sua casa.</p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#8A7669]">Navegação</h2>
          <nav className="mt-4 grid gap-3 text-sm font-medium text-[#46534A]" aria-label="Links do site">
            <Link href="/#beneficios" className="transition hover:text-[#315F42]">Benefícios</Link>
            <Link href="/#como-funciona" className="transition hover:text-[#315F42]">Como funciona</Link>
            <Link href="/#planos" className="transition hover:text-[#315F42]">Planos</Link>
            <Link href="/menu/demo" className="transition hover:text-[#315F42]">Demonstração</Link>
          </nav>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[#8A7669]">Restaurantes</h2>
          <nav className="mt-4 grid gap-3 text-sm font-medium text-[#46534A]" aria-label="Acesso do restaurante">
            <Link href="/login" className="transition hover:text-[#315F42]">Acessar painel</Link>
            <Link href="/register" className="inline-flex items-center gap-1 transition hover:text-[#315F42]">Criar acesso <ArrowUpRight size={14} /></Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-[#234B39]/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-xs text-[#788078] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 MesaViva 3D · Todos os direitos reservados</span>
          <span>Desenvolvido por <strong className="font-semibold text-[#234B39]">NxS Systems</strong></span>
        </div>
      </div>
    </footer>
  );
}
