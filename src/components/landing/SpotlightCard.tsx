"use client";

import { useState, type PointerEvent, type ReactNode } from "react";

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`relative isolate overflow-hidden rounded-xl border border-white/10 bg-[#1D2420] ${className}`}>{children}</article>;
}

export function SpotlightGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [point, setPoint] = useState({ x: 0, y: 0, active: false });
  function move(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPoint({ x: event.clientX - rect.left, y: event.clientY - rect.top, active: true });
  }
  return <div onPointerMove={move} onPointerLeave={() => setPoint((current) => ({ ...current, active: false }))} className={`relative ${className}`}>
    <div aria-hidden="true" className="pointer-events-none absolute z-10 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300" style={{ left: point.x, top: point.y, opacity: point.active ? 1 : 0, background: "radial-gradient(circle, rgba(111,159,114,.16), transparent 68%)" }} />
    <div className="relative grid items-stretch gap-4 lg:grid-cols-3">{children}</div>
  </div>;
}
