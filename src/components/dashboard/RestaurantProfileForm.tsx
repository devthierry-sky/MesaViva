"use client";

import { useActionState } from "react";
import { updateRestaurantAction } from "@/src/app/dashboard/restaurant/actions";
import { RestaurantLogoPicker } from "@/src/components/dashboard/RestaurantLogoPicker";

const inputClass = "mt-2 block min-h-12 w-full rounded-md border border-[#234B39]/15 bg-[#FBFAF6] px-4 text-sm text-[#202923] outline-none transition focus:border-[#315F42] focus:bg-white focus:ring-4 focus:ring-[#315F42]/10";

export function RestaurantProfileForm({ restaurant }: {
  restaurant: { id: string; name: string; description: string | null; phone?: string | null; address?: string | null; instagram?: string | null; is_published: boolean; logoUrl?: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateRestaurantAction, {});

  return (
    <form id="configuracoes" action={formAction} encType="multipart/form-data" className="grid gap-5">
      <input type="hidden" name="restaurantId" value={restaurant.id} />
      <RestaurantLogoPicker restaurantId={restaurant.id} restaurantName={restaurant.name} logoUrl={restaurant.logoUrl ?? null} />
      <label className="block text-sm font-semibold text-[#38443B]">
        Nome do restaurante
        <input className={inputClass} name="name" defaultValue={restaurant.name} required minLength={2} maxLength={120} />
      </label>
      <label className="block text-sm font-semibold text-[#38443B]">
        Apresentação do restaurante
        <textarea className={`${inputClass} min-h-32 resize-y py-3`} name="description" defaultValue={restaurant.description ?? ""} maxLength={1000} placeholder="Conte um pouco sobre a casa e o que seus clientes encontram no cardápio." />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[#38443B]">WhatsApp para pedidos<input className={inputClass} name="phone" type="tel" defaultValue={restaurant.phone ?? ""} placeholder="5511999999999" autoComplete="tel" /><span className="mt-1 block text-xs font-normal text-[#687168]">Inclua o código do país e o DDD, por exemplo 5511999999999. Esse número ativa os pedidos do cardápio.</span></label>
        <label className="block text-sm font-semibold text-[#38443B]">Instagram<input className={inputClass} name="instagram" defaultValue={restaurant.instagram ?? ""} placeholder="seurestaurante" autoComplete="off" /></label>
      </div>
      <label className="block text-sm font-semibold text-[#38443B]">Endereço<input className={inputClass} name="address" defaultValue={restaurant.address ?? ""} maxLength={240} placeholder="Rua, número, bairro e cidade" autoComplete="street-address" /></label>
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[#234B39]/10 bg-[#FBFAF6] p-4">
        <input className="mt-1 size-4 accent-[#315F42]" type="checkbox" name="isPublished" defaultChecked={restaurant.is_published} />
        <span><span className="block text-sm font-semibold text-[#38443B]">Publicar página do cardápio</span><span className="mt-1 block text-xs leading-5 text-[#687168]">Quando publicada, qualquer pessoa com o link poderá consultar os pratos cadastrados.</span></span>
      </label>
      {state.error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      {state.success && <p role="status" className="rounded-md border border-[#BFD6C2] bg-[#EAF3E9] px-4 py-3 text-sm text-[#294C35]">Alterações salvas.</p>}
      <button disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#315F42] px-5 text-sm font-bold text-white transition hover:bg-[#234B39] disabled:opacity-60">{pending ? "Salvando…" : "Salvar apresentação"}</button>
    </form>
  );
}
