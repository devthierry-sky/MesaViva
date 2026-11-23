"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, QrCode, RotateCcw, Store } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { createRestaurantTable, setRestaurantTableActive } from "@/src/app/dashboard/restaurant/tables-actions";

export type RestaurantTable = { id: string; label: string; is_active: boolean };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]!);
}

export function RestaurantTableQRManager({ restaurantId, slug, restaurantName, initialTables, canManage }: {
  restaurantId: string; slug: string; restaurantName: string; initialTables: RestaurantTable[]; canManage: boolean;
}) {
  const [tables, setTables] = useState(initialTables);
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const origin = useSyncExternalStore(() => () => {}, () => window.location.origin, () => "");
  const router = useRouter();
  const activeCount = tables.filter((table) => table.is_active).length;

  async function createTable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true); setMessage("");
    const result = await createRestaurantTable(restaurantId, label);
    if (result.error) setMessage(result.error);
    else { if (result.table) setTables((current) => [...current, result.table as RestaurantTable]); setLabel(""); setMessage("Mesa cadastrada e QR pronto para compartilhar."); router.refresh(); }
    setCreating(false);
  }

  async function toggleTable(table: RestaurantTable) {
    setPendingId(table.id); setMessage("");
    const result = await setRestaurantTableActive(restaurantId, table.id, !table.is_active);
    if (result.error) setMessage(result.error);
    else {
      setTables((current) => current.map((entry) => entry.id === table.id ? { ...entry, is_active: !table.is_active } : entry));
      router.refresh();
    }
    setPendingId(null);
  }

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-serif text-2xl">QR Code por mesa</h2><p className="mt-1 text-sm text-[#667168]">Cada código abre o cardápio já identificado para aquela mesa.</p></div>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF3E9] px-3 py-2 text-xs font-semibold text-[#315A3C]"><Store size={14}/>{activeCount} {activeCount === 1 ? "mesa sincronizada" : "mesas sincronizadas"}</span>
    </div>

    {canManage && <form onSubmit={createTable} className="mt-5 flex flex-col gap-2 rounded-md bg-[#F4F6F2] p-4 sm:flex-row">
      <label className="sr-only" htmlFor="table-label">Número ou nome da mesa</label>
      <input id="table-label" value={label} onChange={(event) => setLabel(event.target.value)} maxLength={40} required placeholder="Ex.: Mesa 01" className="min-h-11 min-w-0 flex-1 rounded-md border border-[#234B39]/15 bg-white px-3.5 text-sm outline-none focus:border-[#6F9F72]" />
      <button disabled={creating} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#315F42] px-4 text-sm font-semibold text-white transition hover:bg-[#234B39] disabled:opacity-60"><QrCode size={16}/>{creating ? "Criando…" : "Criar QR da mesa"}</button>
    </form>}
    {message && <p role="status" className="mt-3 text-sm text-[#315A3C]">{message}</p>}

    {tables.length ? <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{tables.map((table) => <TableQRCard key={table.id} table={table} url={origin ? `${origin}/menu/${slug}?origem=qr&mesa=${table.id}` : ""} restaurantName={restaurantName} pending={pendingId === table.id} onToggle={canManage ? () => toggleTable(table) : undefined}/>)}</ul> : <p className="mt-5 rounded-md border border-dashed border-[#234B39]/15 p-5 text-sm text-[#667168]">{canManage ? "Cadastre uma mesa para gerar o primeiro QR individual." : "Nenhuma mesa com QR individual cadastrada."}</p>}
  </div>;
}

function TableQRCard({ table, url, restaurantName, pending, onToggle }: {
  table: RestaurantTable; url: string; restaurantName: string; pending: boolean; onToggle?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const active = table.is_active;
  function download() {
    const canvas = document.getElementById(`qr-${table.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const anchor = document.createElement("a"); anchor.download = `${table.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qrcode.png`; anchor.href = canvas.toDataURL("image/png"); anchor.click();
  }
  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  }
  function print() {
    const canvas = document.getElementById(`qr-${table.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const printWindow = window.open("", "_blank", "width=720,height=720");
    if (!printWindow) return;
    const safeName = escapeHtml(restaurantName); const safeLabel = escapeHtml(table.label); const safeUrl = escapeHtml(url); const image = canvas.toDataURL("image/png");
    printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${safeLabel} · ${safeName}</title><style>body{font:16px Arial,sans-serif;color:#193b2b;display:grid;place-items:center;min-height:95vh;margin:0}.sheet{text-align:center;border:2px solid #315f42;border-radius:20px;padding:38px;width:420px}.brand{font-weight:700;color:#315f42;letter-spacing:.08em}img{width:280px;height:280px;margin:30px auto;display:block}.url{font-size:13px;color:#687168;overflow-wrap:anywhere}</style></head><body><main class="sheet"><p class="brand">MESAVIVA 3D</p><h1>${safeName}</h1><h2>${safeLabel}</h2><p>Aponte a câmera para abrir o cardápio desta mesa</p><img src="${image}" alt="QR Code ${safeLabel}"><p class="url">${safeUrl}</p></main></body></html>`);
    printWindow.document.close(); window.setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
  }

  return <li className={`rounded-md border p-4 ${active ? "border-[#234B39]/10 bg-white" : "border-dashed border-[#234B39]/15 bg-[#F8F9F6]"}`}>
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{table.label}</h3><p className="mt-1 text-xs text-[#758078]">{active ? "QR ativo" : "QR desativado"}</p></div><span className={`mt-1 size-2 rounded-full ${active ? "bg-[#6F9F72]" : "bg-[#A8AEA8]"}`}/></div>
    {active ? <><div className="mt-4 flex items-center gap-4"><div className="rounded-md border border-[#234B39]/10 bg-white p-2"><QRCodeCanvas id={`qr-${table.id}`} value={url || "/"} size={112} level="M" includeMargin/></div><div className="grid flex-1 gap-2"><button type="button" onClick={download} className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#EAF3E9] px-3 text-xs font-semibold text-[#315A3C]"><Download size={14}/>Baixar PNG</button><button type="button" onClick={print} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#234B39]/15 px-3 text-xs font-semibold text-[#315A3C]">Imprimir / PDF</button><button type="button" onClick={copyLink} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#234B39]/15 px-3 text-xs font-semibold text-[#315A3C]">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Link copiado" : "Copiar link"}</button></div></div></> : <p className="mt-4 text-sm text-[#667168]">Este código não aceita novos pedidos.</p>}
    {onToggle && <button type="button" disabled={pending} onClick={onToggle} className="mt-4 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-[#315F42] disabled:opacity-60">{active ? <RotateCcw size={14}/> : <Check size={14}/>} {pending ? "Atualizando…" : active ? "Desativar mesa" : "Reativar mesa"}</button>}
  </li>;
}
