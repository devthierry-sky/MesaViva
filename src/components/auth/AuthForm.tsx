"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/src/app/auth/actions";

type AuthAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

export function AuthForm({ mode, action }: { mode: "login" | "register"; action: AuthAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  const isRegister = mode === "register";
  const inputClassName = "mt-2 block min-h-12 w-full rounded-md border border-[#26382D]/15 bg-[#FBFAF6] px-4 text-sm font-normal text-[#202923] outline-none transition placeholder:text-[#9A9F97] focus:border-[#315F42] focus:bg-white focus:ring-4 focus:ring-[#315F42]/10";

  return (
    <form action={formAction} className="mt-7 space-y-4">
      {isRegister && (
        <label className="block text-sm font-semibold text-[#38443B]">
          Nome do restaurante
          <input name="restaurantName" autoComplete="organization" required minLength={2} maxLength={120} placeholder="Ex.: Restaurante da Praça" className={inputClassName} />
        </label>
      )}
      {isRegister && (
        <label className="block text-sm font-semibold text-[#38443B]">
          Seu nome
          <input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Seu nome completo" className={inputClassName} />
        </label>
      )}
      <label className="block text-sm font-semibold text-[#38443B]">
        E-mail
        <input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@restaurante.com.br" className={inputClassName} />
      </label>
      <label className="block text-sm font-semibold text-[#38443B]">
        Senha
        <input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} maxLength={128} placeholder="Pelo menos 8 caracteres" className={inputClassName} />
        {isRegister && <span className="mt-1.5 block text-xs font-normal text-[#858C83]">Use pelo menos 8 caracteres.</span>}
      </label>
      {isRegister && (
        <label className="block text-sm font-semibold text-[#38443B]">
          Confirme a senha
          <input name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128} placeholder="Digite a senha novamente" className={inputClassName} />
        </label>
      )}
      {state.error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{state.error}</p>}
      {state.message && <p role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-800">{state.message}</p>}
      <button type="submit" disabled={pending} className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#315F42] px-5 text-sm font-semibold text-white transition hover:bg-[#234B39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315F42] disabled:cursor-wait disabled:opacity-60">
        {pending ? "Aguarde…" : isRegister ? "Criar acesso do restaurante" : "Entrar no painel"}
      </button>
      <p className="pt-1 text-center text-sm text-[#687168]">
        {isRegister ? "Já tem um acesso? " : "Primeira vez por aqui? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-[#315F42] underline-offset-4 hover:underline">
          {isRegister ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </form>
  );
}
