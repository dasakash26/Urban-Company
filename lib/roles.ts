export const ROLES = {
  CUSTOMER: "CUSTOMER",
  PROVIDER: "PROVIDER",
  ADMIN: "ADMIN",
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]
