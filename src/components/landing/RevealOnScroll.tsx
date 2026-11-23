"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function RevealOnScroll({ children, delay = 0, className = "" }: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    element.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.dataset.reveal = "visible";
      observer.disconnect();
    }, { threshold: 0.15, rootMargin: "0px 0px -32px 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={className} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}
