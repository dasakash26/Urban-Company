"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth-client"

type AuthFormProps = {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState("CUSTOMER")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    if (mode === "login") {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      setSubmitting(false)

      if (result.error) {
        setError(result.error.message ?? "Unable to sign in")
        return
      }

      window.location.href = "/dashboard"
      return
    }

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      role,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error.message ?? "Unable to register")
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <Card className="mx-auto w-full max-w-md border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          {mode === "login" ? "Sign in" : "Create account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Access your Urban Clean portal."
            : "Join as a customer or provider."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          {mode === "register" ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
          {mode === "register" ? (
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="PROVIDER">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "New to Urban Clean?"
              : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/register" : "/login"}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
