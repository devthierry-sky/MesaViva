import { signUpAction } from "@/src/app/auth/actions";
import { AuthForm } from "@/src/components/auth/AuthForm";
import { AuthShell } from "@/src/components/auth/AuthShell";

export const metadata = { title: "Cadastre seu restaurante | MesaViva 3D" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Para donos de restaurantes"
      title="Comece a apresentar melhor a sua casa"
      description="Crie o acesso do responsável e informe o nome do restaurante. Seus clientes poderão abrir o cardápio público sem fazer login."
      register
    >
      <AuthForm mode="register" action={signUpAction} />
    </AuthShell>
  );
}
