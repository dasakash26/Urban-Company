"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { ThemeToggleButton } from "@/components/layout/theme-toggle-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/services", label: "Services" },
    { href: "/bookings", label: "Bookings" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-heading text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
            >
              Urban Clean
            </Link>
            <Badge variant="secondary">Marketplace</Badge>
          </div>
          <nav className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "shrink-0",
                  pathname === item.href &&
                    "text-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <ThemeToggleButton />
            <AuthActions />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}

function AuthActions() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  if (data) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await authClient.signOut()
          router.push("/")
          router.refresh()
        }}
      >
        Logout
      </Button>
    )
  }

  return (
    <>
      <Button asChild size="sm" variant="outline">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/register">Register</Link>
      </Button>
    </>
  )
}
