"use client";

import { useEffect, useRef } from "react";

type ParallaxBackgroundProps = {
  imageUrl: string;
};

export function ParallaxBackground({ imageUrl }: ParallaxBackgroundProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = layer.parentElement?.getBoundingClientRect().top ?? 0;
        const offset = Math.max(-48, Math.min(48, -top * 0.12));
        layer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="absolute -inset-y-12 inset-x-0 will-change-transform"
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundPosition: "center 55%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        transform: "translate3d(0, 0, 0) scale(1.12)",
      }}
    />
  );
}
