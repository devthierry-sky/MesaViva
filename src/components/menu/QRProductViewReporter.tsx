"use client";

import { useEffect, useRef } from "react";
import { recordQrProductAccess } from "@/src/app/menu/actions";
import { getQrSessionId } from "@/src/lib/qr-session";

export function QRProductViewReporter({ slug, productId }: { slug: string; productId: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;

    const key = `qr-product-view:${slug}:${productId}`;
    let reported = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || reported) return;
      reported = true;
      try {
        if (sessionStorage.getItem(key)) {
          observer.disconnect();
          return;
        }
        sessionStorage.setItem(key, "1");
      } catch {
        // If browser storage is unavailable, still record this visible product once.
      }
      const sessionId = getQrSessionId();
      if (sessionId) void recordQrProductAccess(slug, productId, sessionId);
      observer.disconnect();
    }, { threshold: 0.3 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [productId, slug]);

  return <span ref={ref} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 size-px" />;
}
