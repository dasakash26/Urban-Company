import { AuthForm } from "@/components/auth/auth-form"
import { SiteShell } from "@/components/layout/site-shell"
import { Badge } from "@/components/ui/badge"

export default function RegisterPage() {
  return (
    <SiteShell>
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative space-y-5">
          <div className="pointer-events-none absolute -top-10 -left-10 size-32 rounded-full bg-chart-2/10 blur-2xl" />
          <Badge variant="secondary">Get started</Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your Urban Clean account in under a minute
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Join as a customer to book services or as a provider to publish your
            offerings and manage bookings.
          </p>
        </div>
        <AuthForm mode="register" />
      </section>
    </SiteShell>
  )
}
