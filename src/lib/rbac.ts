import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { Role } from "@prisma/client"

// ──────────────────────────────────────────
// RBAC Middleware Helpers
// ──────────────────────────────────────────

/**
 * Get authenticated session or return 401 response.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { session }
}

/**
 * Require a specific role or higher.
 * Role hierarchy: USER < ADMIN < SUPER_ADMIN
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
}

export async function requireRole(minimumRole: Role) {
  const result = await requireAuth()
  if ("error" in result) return result

  const userRoleLevel = ROLE_HIERARCHY[result.session.user.role] ?? 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0

  if (userRoleLevel < requiredLevel) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: insufficient permissions" },
        { status: 403 }
      ),
    }
  }

  return { session: result.session }
}

/**
 * Require ADMIN or SUPER_ADMIN role.
 */
export async function requireAdmin() {
  return requireRole("ADMIN" as Role)
}

/**
 * Require SUPER_ADMIN role.
 */
export async function requireSuperAdmin() {
  return requireRole("SUPER_ADMIN" as Role)
}

/**
 * Check if user owns the resource or is admin.
 */
export async function requireOwnerOrAdmin(resourceUserId: string) {
  const result = await requireAuth()
  if ("error" in result) return result

  const isOwner = result.session.user.id === resourceUserId
  const isAdmin = ROLE_HIERARCHY[result.session.user.role] >= ROLE_HIERARCHY.ADMIN

  if (!isOwner && !isAdmin) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: you do not own this resource" },
        { status: 403 }
      ),
    }
  }

  return { session: result.session }
}
