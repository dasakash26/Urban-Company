"use client"

import Link from "next/link"

import { ThemeToggleButton } from "@/components/layout/theme-toggle-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-heading text-xl font-semibold tracking-tight"
            >
              Urban Clean
            </Link>
            <Badge variant="secondary">Marketplace</Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/services">Services</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/bookings">Bookings</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile">Profile</Link>
            </Button>
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
          window.location.href = "/"
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
