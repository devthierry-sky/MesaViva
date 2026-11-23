import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Check,
  Compass,
  Smartphone,
  Store,
  QrCode,
  ScanLine,
} from "lucide-react";
import { Marquee } from "@/src/components/landing/Marquee";
import { RevealOnScroll } from "@/src/components/landing/RevealOnScroll";
import { ContainerScroll } from "@/src/components/landing/ContainerScroll";
import { LogoIntro } from "@/src/components/landing/LogoIntro";
import { ParallaxBackground } from "@/src/components/landing/ParallaxBackground";
import { SpotlightCard, SpotlightGrid } from "@/src/components/landing/SpotlightCard";
import { SiteFooter } from "@/src/components/site/SiteFooter";
import { SiteHeader } from "@/src/components/site/SiteHeader";

const benefits = [
  {
    icon: Compass,
    number: "01",
    title: "Mais contexto na escolha",
    text: "O cliente consulta ingredientes, descrição e preço, e pode observar o modelo 3D com calma antes de pedir.",
  },
  {
    icon: Camera,
    number: "02",
    title: "Uma prévia na própria mesa",
    text: "Em celulares compatíveis, a realidade aumentada posiciona o modelo no ambiente. Nos outros aparelhos, o 3D continua no navegador.",
  },
  {
    icon: Smartphone,
    number: "03",
    title: "Acesso direto pelo celular",
    text: "O cardápio abre pelo link ou QR Code, sem pedir uma conta ao cliente nem exigir a instalação de um aplicativo.",
  },
];

const steps = [
  { number: "01", title: "Prepare a página", text: "Reúna o nome do restaurante, os contatos e as informações dos pratos em um só lugar.", icon: Store },
  { number: "02", title: "Compartilhe o acesso", text: "Envie o link do cardápio ou deixe o QR Code disponível nas mesas.", icon: QrCode },
  { number: "03", title: "Deixe o cliente explorar", text: "Ele consulta os detalhes e abre os modelos 3D antes de escolher o que pedir.", icon: ScanLine },
];

const plans = [
  {
    audience: "Bistrôs e cafés",
    name: "Start 3D",
    price: "149",
    summary: "Para apresentar o cardápio da casa em uma página própria.",
    features: ["Página responsiva do restaurante", "Categorias e informações dos pratos", "Modelos 3D nos itens cadastrados", "Acesso pelo link do cardápio"],
    button: "Quero começar",
  },
  {
    audience: "Restaurantes e hamburguerias",
    name: "Pro Imersivo",
    price: "299",
    summary: "Para quem quer oferecer mais recursos visuais aos clientes.",
    features: ["Tudo do plano Start 3D", "Realidade aumentada em aparelhos compatíveis", "Mais espaço para apresentar o menu", "Apoio na configuração da página"],
    button: "Tenho interesse",
    featured: true,
  },
  {
    audience: "Redes e franquias",
    name: "Enterprise",
    price: "Sob consulta",
    summary: "Uma conversa para entender a operação e o formato da rede.",
    features: ["Planejamento para várias unidades", "Identidade visual alinhada à rede", "Acompanhamento de implantação", "Escopo definido com a equipe"],
    button: "Conversar sobre o projeto",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F6F4EE] text-[#202923]">
      <SiteHeader />
      <LogoIntro />

      <section id="inicio" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#111513] pb-16 pt-32 text-white sm:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <ParallaxBackground imageUrl="/images/burger-parallax.avif" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111513]/95 via-[#111513]/72 to-[#111513]/36" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111513]/90 via-transparent to-[#111513]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_42%,transparent_15%,rgba(0,0,0,.35)_100%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/90 backdrop-blur sm:text-xs"><span className="size-2 rounded-full bg-[#6F9F72]" /> Cardápio para restaurantes</p>
            <h1 className="mt-7 font-serif text-[2.65rem] font-medium leading-[1.03] tracking-[-.045em] sm:text-6xl lg:text-[4.4rem]">Seu cliente não precisa imaginar o prato<span className="text-[#6F9F72]">. Ele pode vê-lo em 3D.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">Apresente os pratos do seu restaurante em uma página própria. O cliente consulta o cardápio no celular, explora os modelos disponíveis e, quando o aparelho permite, vê o prato na mesa com realidade aumentada.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#planos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#6F9F72] px-5 text-sm font-bold text-[#182B20] shadow-[0_10px_36px_rgba(111,159,114,.24)] transition hover:bg-[#8ABA8B]">Conhecer os planos <ArrowRight size={16} /></Link>
              <Link href="/menu/demo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">Ver demonstração <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="hidden min-h-[350px] items-end justify-end lg:flex">
            <div className="max-w-[330px] border-l border-white/35 pl-5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#A6C6A1]">Uma página de cada restaurante</p>
              <p className="mt-3 font-serif text-2xl leading-tight text-white">O cardápio continua com a identidade e o jeito da sua casa.</p>
            </div>
          </div>
        </div>

        <a href="#beneficios" className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/55 transition hover:text-white/90"><ArrowDown size={15} /> Role para explorar</a>
      </section>

      <Marquee />

      <section id="beneficios" className="bg-[#F6F4EE] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <RevealOnScroll><div className="grid gap-5 border-b border-[#234B39]/15 pb-8 md:grid-cols-[.85fr_1.15fr] md:items-end md:gap-12">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#315F42]">Por que inovar</p><h2 className="mt-4 max-w-lg font-serif text-3xl font-medium leading-tight tracking-[-.04em] sm:text-4xl">Um cardápio que mostra mais do que uma foto</h2></div>
          </div></RevealOnScroll>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, number, title, text }, index) => <RevealOnScroll key={number} delay={index * 100} className="h-full"><article className="group h-full border-t-2 border-[#315F42] bg-white p-6 transition-colors hover:bg-[#FCFBF7] sm:p-7"><div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-md bg-[#EAF1E8] text-[#315F42] transition group-hover:bg-[#315F42] group-hover:text-white"><Icon size={19} /></span><span className="font-mono text-xs text-[#A2A69F]">{number}</span></div><h3 className="mt-7 text-lg font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[#687168]">{text}</p></article></RevealOnScroll>)}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative isolate overflow-hidden bg-[#202F27] py-20 text-white sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-1/3 -z-10 size-[28rem] rounded-full border border-white/[.06]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <RevealOnScroll>
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/20 pb-8">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#A6C6A1]">Como funciona</p><h2 className="mt-4 max-w-xl font-serif text-4xl font-medium leading-tight tracking-[-.04em] sm:text-5xl">Do primeiro acesso à escolha do prato</h2></div>
              <span className="mb-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold tracking-wide text-white/70">3 passos para começar</span>
            </div>
          </RevealOnScroll>
          <ol className="mt-7 grid gap-3 md:grid-cols-3">
            {steps.map(({ number, title, text, icon: Icon }, index) => <li key={number}>
              <RevealOnScroll delay={index * 140} className="h-full">
                <article className="group relative h-full min-h-[255px] overflow-hidden rounded-lg border border-white/10 bg-white/[.045] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#A6C6A1]/40 hover:bg-white/[.075] sm:p-7">
                  <div aria-hidden="true" className="absolute -right-8 -top-8 size-36 rounded-full border border-white/[.06] transition-transform duration-500 group-hover:scale-110" />
                  <div className="relative flex items-center justify-between"><span className="font-mono text-sm tracking-widest text-[#A6C6A1]">{number}</span><span className="flex size-11 items-center justify-center rounded-md bg-[#6F9F72]/15 text-[#A6C6A1]"><Icon size={19} strokeWidth={1.7}/></span></div>
                  <h3 className="relative mt-10 text-xl font-semibold tracking-tight">{title}</h3><p className="relative mt-3 max-w-sm text-sm leading-6 text-white/65">{text}</p>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#A6C6A1] transition-all duration-500 group-hover:w-full" />
                </article>
              </RevealOnScroll>
            </li>)}
          </ol>
        </div>
      </section>

      <section id="comparativo-demo" className="bg-[#EFEEE8] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ContainerScroll titleComponent={<><p className="text-xs font-bold uppercase tracking-[.18em] text-[#315F42]">Veja na prática</p><h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-[-.04em] text-[#202923] sm:text-5xl">O cardápio da sua casa apresentado de um jeito novo</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#687168] sm:text-base">Role para explorar como o cliente encontra os pratos e conhece cada detalhe antes de pedir.</p></>}>
            <div className="grid h-full grid-cols-1 overflow-y-auto md:grid-cols-[.9fr_1.1fr]">
              <div className="flex min-h-[280px] items-center justify-center bg-[#E8E3D6] p-4 sm:p-8"><Image src="/images/demo-burger.jpg" alt="Hambúrguer artesanal do cardápio de demonstração" width={900} height={900} className="max-h-full w-full rounded-xl object-cover shadow-lg" priority /></div>
              <div className="flex flex-col justify-center p-6 sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#315F42]">Hambúrgueres · Da casa</p><h3 className="mt-4 font-serif text-3xl font-medium text-[#202923] sm:text-4xl">Hambúrguer artesanal</h3><p className="mt-4 max-w-lg text-sm leading-6 text-[#687168]">Pão com gergelim, carne bovina, queijo cheddar, tomate e alface. O cliente pode conferir a descrição e explorar o modelo 3D no próprio celular.</p><div className="mt-7 flex items-center justify-between border-t border-[#234B39]/10 pt-5"><span className="text-sm text-[#687168]">Preço de demonstração</span><strong className="text-lg text-[#234B39]">R$ 34,90</strong></div><Link href="/menu/demo" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#315F42] px-5 text-sm font-bold text-white transition hover:bg-[#234B39]">Abrir demonstração <ArrowRight size={16}/></Link></div>
            </div>
          </ContainerScroll>
        </div>
      </section>

      <section aria-label="Recursos da MesaViva" className="bg-[#F0EFEB] py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-3 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {[
            { icon: QrCode, value: "QR individual", detail: "um para cada mesa" },
            { icon: ScanLine, value: "Pratos em 3D", detail: "direto no navegador" },
            { icon: Smartphone, value: "Sem aplicativo", detail: "o cliente abre pelo link" },
            { icon: Camera, value: "Realidade aumentada", detail: "em aparelhos compatíveis" },
          ].map(({ icon: Icon, value, detail }, index) => <RevealOnScroll key={value} delay={index * 90}>
            <article className="flex min-h-[116px] items-center gap-4 rounded-xl border border-[#234B39]/[.08] bg-white px-5 py-5 shadow-[0_12px_36px_-32px_rgba(32,41,35,.32)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-28px_rgba(32,41,35,.32)]">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E9] text-[#315F42]"><Icon size={20}/></span>
              <div><h2 className="font-semibold tracking-tight text-[#234B39]">{value}</h2><p className="mt-1 text-sm text-[#687168]">{detail}</p></div>
            </article>
          </RevealOnScroll>)}
        </div>
      </section>

      <section id="planos" className="bg-[#111513] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <RevealOnScroll><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#A6C6A1]">Investimento</p><h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-.04em] sm:text-4xl">Planos para diferentes momentos do restaurante</h2><p className="mt-4 text-base leading-7 text-white/65">Escolha um ponto de partida e conheça o formato que combina com a sua operação.</p></div></RevealOnScroll>
          <SpotlightGrid className="mt-10">
            {plans.map((plan) => (
              <RevealOnScroll key={plan.name} delay={plans.indexOf(plan) * 110} className="h-full"><SpotlightCard className={plan.featured ? "border-[#6F9F72]/70 bg-[#202522] shadow-[0_20px_70px_-34px_rgba(111,159,114,.45)]" : ""}>
                <div className="flex h-full flex-col p-6 sm:p-7">
                  {plan.featured && <span className="mb-5 inline-flex w-fit rounded-full bg-[#6F9F72] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#182B20]">Mais escolhido</span>}
                  <p className="text-xs font-semibold uppercase tracking-[.13em] text-white/55">{plan.audience}</p>
                  <h3 className="mt-2 font-serif text-2xl font-medium">{plan.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-white/60">{plan.summary}</p>
                  <div className="mt-6 flex min-h-[54px] items-baseline gap-1.5"><span className={`font-semibold tracking-tight ${plan.price === "Sob consulta" ? "text-2xl" : "text-4xl"}`}>{plan.price === "Sob consulta" ? plan.price : `R$ ${plan.price}`}</span>{plan.price !== "Sob consulta" && <span className="text-sm text-white/55">/ mês</span>}</div>
                  <ul className="mt-6 grid flex-1 content-start gap-3 border-t border-white/10 pt-5 text-sm text-white/75">{plan.features.map((feature) => <li key={feature} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-[#A6C6A1]" />{feature}</li>)}</ul>
                  <Link href="/register" className={`mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition ${plan.featured ? "bg-[#6F9F72] text-[#182B20] hover:bg-[#8ABA8B]" : "border border-white/20 text-white hover:bg-white/10"}`}>{plan.button}<ArrowRight size={15} /></Link>
                </div>
              </SpotlightCard></RevealOnScroll>
            ))}
          </SpotlightGrid>
          <p className="mt-5 text-center text-xs leading-5 text-white/40">O cadastro inicial não realiza cobrança. A contratação e a ativação do plano são alinhadas com a equipe.</p>
        </div>
      </section>

      <section id="contato" className="bg-[#F6F4EE] px-5 py-14 sm:px-8 sm:py-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#E8E3D6] px-6 py-9 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
          <div className="absolute -right-16 -top-20 size-72 rounded-full border border-[#315F42]/10" />
          <RevealOnScroll className="relative max-w-2xl"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#315F42]">Próximo passo</p><h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-.04em] sm:text-4xl">Seu restaurante merece uma boa apresentação</h2><p className="mt-4 text-sm leading-6 text-[#626C64] sm:text-base">Veja o cardápio de exemplo e conheça o acesso feito para proprietários de restaurantes.</p></div></RevealOnScroll>
          <RevealOnScroll delay={120} className="relative mt-7 flex shrink-0 flex-wrap gap-3 lg:mt-0"><Link href="/menu/demo" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#234B39]/20 bg-white/50 px-5 text-sm font-semibold text-[#234B39] transition hover:bg-white">Ver demonstração</Link><Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#315F42] px-5 text-sm font-bold text-white transition hover:bg-[#234B39]">Criar acesso <ArrowRight size={16} /></Link></RevealOnScroll>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
