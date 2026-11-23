"use client";

import { useEffect } from "react";
import { recordQrAccess } from "@/src/app/menu/actions";
import { getQrSessionId } from "@/src/lib/qr-session";

export function QRAccessReporter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `menu-qr-access:${slug}`;
    const lastAccess = Number(sessionStorage.getItem(key) ?? "0");
    if (Date.now() - lastAccess < 2000) return;
    const sessionId = getQrSessionId();
    if (!sessionId) return;
    sessionStorage.setItem(key, String(Date.now()));
    void recordQrAccess(slug, sessionId);
  }, [slug]);
  return null;
}
