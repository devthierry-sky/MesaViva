"use client";

import { useEffect, useState } from "react";
import { MesaVivaGlassReveal } from "@/src/components/landing/LiquidGlassLogoReveal";

export function LogoIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setVisible(false), reducedMotion ? 120 : 4200);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-[#111513] motion-safe:animate-[logo-intro-out_.55s_ease_3.65s_forwards]" aria-label="Abertura MesaViva 3D">
    <MesaVivaGlassReveal className="size-56 max-h-[70vw] max-w-[70vw]" />
    <button type="button" onClick={() => setVisible(false)} className="absolute bottom-8 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Pular abertura</button>
  </div>;
}
