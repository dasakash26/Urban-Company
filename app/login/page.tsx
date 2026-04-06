import { SiteShell } from "@/components/layout/site-shell"
import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <SiteShell>
      <AuthForm mode="login" />
    </SiteShell>
  )
}
