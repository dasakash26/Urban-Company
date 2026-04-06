import { fail } from "@/lib/http"

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? 10))
  )
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function requireFields(
  payload: Record<string, unknown>,
  fields: string[]
) {
  for (const field of fields) {
    const value = payload[field]

    if (value === undefined || value === null || value === "") {
      return fail(`Missing required field: ${field}`, 400)
    }
  }

  return null
}
