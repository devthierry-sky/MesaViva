import { signInAction } from "@/src/app/auth/actions";
import { AuthForm } from "@/src/components/auth/AuthForm";
import { AuthShell } from "@/src/components/auth/AuthShell";

export const metadata = { title: "Entrar | MesaViva 3D" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Acesso do proprietário"
      title="Entre para cuidar da página do seu restaurante"
      description="Use o e-mail e a senha da sua conta de restaurante. Os clientes continuam acessando o cardápio público sem login."
    >
      <AuthForm mode="login" action={signInAction} />
    </AuthShell>
  );
}
