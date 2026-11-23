"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/env";

export type AuthFormState = { error?: string; message?: string };

function readText(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "O acesso ainda não foi conectado ao Supabase." };
  }

  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return { error: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Não foi possível entrar. Confira os dados e tente novamente." };

  redirect("/dashboard");
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "O cadastro ainda não foi conectado ao Supabase." };
  }

  const name = readText(formData, "name");
  const restaurantName = readText(formData, "restaurantName");
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const confirmation = readText(formData, "confirmation");
  if (name.length < 2) return { error: "Informe seu nome (pelo menos 2 caracteres)." };
  if (restaurantName.length < 2 || restaurantName.length > 120) {
    return { error: "Informe o nome do restaurante (de 2 a 120 caracteres)." };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Informe um e-mail válido." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirmation) return { error: "As senhas não coincidem." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, restaurant_name: restaurantName } },
  });
  if (error) return { error: "Não foi possível concluir o cadastro. Tente novamente." };
  if (!data.session) {
    return { message: "Cadastro recebido. Confira sua caixa de e-mail para confirmar a conta." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
