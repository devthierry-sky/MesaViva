"use client";

import { useRef, useSyncExternalStore } from "react";
import { QRCodeCanvas } from "qrcode.react";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]!);
}

export function RestaurantQRCode({ slug, restaurantName = "Seu restaurante" }: { slug: string; restaurantName?: string }) {
  const origin = useSyncExternalStore(() => () => {}, () => window.location.origin, () => "");
  const url = origin ? `${origin}/menu/${slug}?origem=qr` : "";
  const canvas = useRef<HTMLCanvasElement>(null);
  function download() {
    const source = canvas.current;
    if (!source) return;
    const link = document.createElement("a"); link.download = `${slug}-qrcode.png`; link.href = source.toDataURL("image/png"); link.click();
  }
  function print() {
    const source = canvas.current;
    if (!source) return;
    const printWindow = window.open("", "_blank", "width=720,height=720");
    if (!printWindow) return;
    const image = source.toDataURL("image/png");
    printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>QR Code · ${escapeHtml(restaurantName)}</title><style>body{font:16px Arial,sans-serif;color:#193b2b;display:grid;place-items:center;min-height:95vh;margin:0}.sheet{text-align:center;border:2px solid #315f42;border-radius:20px;padding:38px;width:420px}.brand{font-weight:700;color:#315f42;letter-spacing:.08em}img{width:280px;height:280px;margin:30px auto;display:block}.url{font-size:13px;color:#687168;overflow-wrap:anywhere}@media print{.sheet{border:2px solid #315f42}}</style></head><body><main class="sheet"><p class="brand">MESAVIVA 3D</p><h1>${escapeHtml(restaurantName)}</h1><p>Aponte a câmera para abrir o cardápio</p><img src="${escapeHtml(image)}" alt="QR Code do cardápio"><p class="url">${escapeHtml(url)}</p></main></body></html>`);
    printWindow.document.close();
    window.setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
  }
  return <div className="flex flex-wrap items-center gap-5 rounded-md bg-[#F4F6F2] p-4"><div className="rounded-md bg-white p-2">{url ? <QRCodeCanvas ref={canvas} value={url} size={140} level="M" includeMargin /> : <div className="size-[140px] animate-pulse rounded bg-[#E8ECE6]" />}</div><div className="max-w-sm"><h3 className="font-semibold">QR Code do cardápio</h3><p className="mt-1 text-sm leading-6 text-[#667168]">Baixe e coloque nas mesas. Cada abertura pelo código conta como um acesso, sem identificar a pessoa.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={!url} onClick={download} className="min-h-10 rounded-md bg-[#234B39] px-4 text-sm font-bold text-white disabled:opacity-50">Baixar PNG</button><button type="button" disabled={!url} onClick={print} className="min-h-10 rounded-md border border-[#234B39]/15 bg-white px-4 text-sm font-bold text-[#315F42] disabled:opacity-50">Imprimir / salvar em PDF</button></div></div></div>;
}
