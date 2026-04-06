import { SiteShell } from "@/components/layout/site-shell"
import { AuthForm } from "@/components/auth/auth-form"

export default function RegisterPage() {
  return (
    <SiteShell>
      <AuthForm mode="register" />
    </SiteShell>
  )
}
