import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { fail } from "@/lib/http"
import type { AppRole } from "@/lib/roles"

export type AppSession = NonNullable<Awaited<ReturnType<typeof getSession>>>

export async function getSession() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  })

  return sessionData
}

export async function requireSession() {
  const sessionData = await getSession()

  if (!sessionData) {
    return {
      ok: false as const,
      response: fail("Unauthorized", 401),
    }
  }

  return {
    ok: true as const,
    session: sessionData,
  }
}

export async function requireRole(roles: AppRole[]) {
  const requiredSession = await requireSession()

  if (!requiredSession.ok) {
    return requiredSession
  }

  const userRole = requiredSession.session.user.role as AppRole

  if (!roles.includes(userRole)) {
    return {
      ok: false as const,
      response: fail("Forbidden", 403),
    }
  }

  return requiredSession
}
