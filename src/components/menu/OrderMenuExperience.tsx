"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import { submitRestaurantOrder } from "@/src/app/menu/actions";
import type { MenuProduct } from "@/src/types/menu";

type CartLine = { product: Pick<MenuProduct, "id" | "name" | "priceCents">; quantity: number };
const CartContext = createContext<{ add: (product: MenuProduct, quantity: number) => void; locked: boolean } | null>(null);
export function useOrderCart() { const cart = useContext(CartContext); if (!cart) throw new Error("OrderMenuExperience is missing"); return cart; }

function SubmitButton() { const { pending } = useFormStatus(); return <button disabled={pending} className="min-h-11 rounded-md bg-[#234B39] px-4 text-sm font-bold text-white transition hover:bg-[#193B2B] disabled:opacity-60">{pending ? "Registrando…" : "Registrar pedido"}</button>; }

export function OrderMenuExperience({ children, slug, tableId }: { children: ReactNode; slug: string; tableId?: string }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [result, setResult] = useState<{ error?: string; whatsappUrl?: string; orderId?: string; tableLabel?: string | null } | null>(null);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0), [lines]);
  function add(product: MenuProduct, quantity: number) {
    if (result?.whatsappUrl) return;
    setResult(null); setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) return current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(20, line.quantity + quantity) } : line);
      return [...current, { product: { id: product.id, name: product.name, priceCents: product.priceCents }, quantity }];
    });
  }
  const remove = (id: string) => setLines((current) => current.filter((line) => line.product.id !== id));

  return <CartContext.Provider value={{ add, locked: Boolean(result?.whatsappUrl) }}>
    {children}
    <section id="pedido" className="scroll-mt-8 rounded-lg border border-[#234B39]/15 bg-white p-5 shadow-[0_18px_52px_-40px_rgba(32,41,35,.3)] sm:p-7">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-[#EAF3E9] text-[#315A3C]"><ShoppingBag size={18} /></span><div><h2 className="font-serif text-2xl font-medium">Seu pedido</h2><p className="text-sm text-[#687168]">Revise os itens, depois confirme para registrar no restaurante.</p></div></div>
      {!lines.length ? <p className="mt-5 rounded-md bg-[#F4F6F2] p-4 text-sm text-[#687168]">Adicione pratos ao pedido para continuar.</p> : <>
        <ul className="mt-5 divide-y divide-[#234B39]/10 border-y border-[#234B39]/10">{lines.map(({ product, quantity }) => <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0"><strong>{quantity} × {product.name}</strong><span className="ml-2 text-[#687168]">R$ {((product.priceCents * quantity) / 100).toFixed(2).replace(".", ",")}</span></span><button type="button" onClick={() => remove(product.id)} aria-label={`Remover ${product.name}`} className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#687168] hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button></li>)}</ul>
        <p className="mt-4 text-right text-sm text-[#687168]">Total estimado <strong className="ml-2 text-lg text-[#202923]">R$ {(total / 100).toFixed(2).replace(".", ",")}</strong></p>
        {!result?.whatsappUrl && <form action={async (formData) => {
          const response = await submitRestaurantOrder({ slug, tableId, customerName: String(formData.get("customerName") ?? ""), customerPhone: String(formData.get("customerPhone") ?? ""), notes: String(formData.get("notes") ?? ""), items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity })) });
          setResult(response.error ? { error: response.error } : { whatsappUrl: response.whatsappUrl, orderId: response.orderId, tableLabel: response.tableLabel });
        }} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#38443B]">Seu nome<input className="mt-1.5 min-h-11 w-full rounded-md border border-[#234B39]/15 bg-[#FAFBF8] px-3.5" name="customerName" required minLength={2} maxLength={120} autoComplete="name" /></label>
          <label className="text-sm font-medium text-[#38443B]">Seu telefone<input className="mt-1.5 min-h-11 w-full rounded-md border border-[#234B39]/15 bg-[#FAFBF8] px-3.5" name="customerPhone" type="tel" required minLength={8} maxLength={40} autoComplete="tel" /></label>
          <label className="text-sm font-medium text-[#38443B] sm:col-span-2">Observações <span className="font-normal text-[#687168]">(opcional)</span><textarea className="mt-1.5 min-h-20 w-full rounded-md border border-[#234B39]/15 bg-[#FAFBF8] px-3.5 py-2.5" name="notes" maxLength={1000} placeholder="Ex.: sem cebola" /></label>
          <div className="sm:col-span-2"><SubmitButton /></div>
        </form>}
      </>}
      {result?.error && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{result.error}</p>}
      {result?.whatsappUrl && <div role="status" className="mt-5 rounded-md border border-[#BFD6C2] bg-[#EAF3E9] p-4"><p className="font-semibold text-[#294C35]">Pedido registrado no restaurante{result.tableLabel ? ` · ${result.tableLabel}` : ""}</p><p className="mt-1 text-sm text-[#435348]">Agora abra o WhatsApp para encaminhar o resumo do pedido e combinar a confirmação com a equipe.</p><a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center rounded-md bg-[#1F6B45] px-4 text-sm font-bold text-white hover:bg-[#185538]">Continuar para o WhatsApp ↗</a><button type="button" onClick={() => { setLines([]); setResult(null); }} className="ml-4 mt-3 text-sm font-semibold text-[#315A3C] underline">Novo pedido</button></div>}
    </section>
  </CartContext.Provider>;
}

export function AddToOrderButton({ product }: { product: MenuProduct }) {
  const { add, locked } = useOrderCart(); const [quantity, setQuantity] = useState(1);
  return <div className="mt-5 flex items-center gap-2"><label className="sr-only" htmlFor={`qty-${product.id}`}>Quantidade de {product.name}</label><input id={`qty-${product.id}`} type="number" min={1} max={20} value={quantity} disabled={locked} onChange={(event) => setQuantity(Math.max(1, Math.min(20, Number(event.target.value) || 1)))} className="h-10 w-16 rounded-md border border-[#234B39]/15 px-2 text-center text-sm disabled:opacity-60"/><button type="button" disabled={locked} onClick={() => add(product, quantity)} className="min-h-10 rounded-md bg-[#234B39] px-4 text-sm font-bold text-white transition hover:bg-[#193B2B] disabled:cursor-not-allowed disabled:opacity-60">{locked ? "Pedido registrado" : "Adicionar ao pedido"}</button></div>;
}
