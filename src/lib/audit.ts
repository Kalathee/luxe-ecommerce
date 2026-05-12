import { prisma } from "./prisma"
import { auth } from "./auth"
import { headers } from "next/headers"

export type AuditAction = 
  | "CREATE_PRODUCT" 
  | "UPDATE_PRODUCT" 
  | "DELETE_PRODUCT" 
  | "ARCHIVE_PRODUCT"
  | "RESTORE_PRODUCT"
  | "UPDATE_ORDER_STATUS"
  | "CREATE_CATEGORY"
  | "UPDATE_CATEGORY"
  | "DELETE_CATEGORY"
  | "ADMIN_LOGIN"

export interface AuditLogOptions {
  action: AuditAction
  entityType: "PRODUCT" | "ORDER" | "CATEGORY" | "USER" | "SYSTEM"
  entityId: string
  details?: unknown
}

/**
 * Logs an admin action to the database.
 */
export async function logAudit({ action, entityType, entityId, details }: AuditLogOptions) {
  try {
    const session = await auth()
    if (!session?.user?.id) return // Only log if we have a session

    const headerList = await headers()
    const ipAddress = headerList.get("x-forwarded-for") || "unknown"
    const userAgent = headerList.get("user-agent") || "unknown"

    await prisma.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action,
        entityType,
        entityId,
        details: details || {},
        ipAddress,
        userAgent,
      }
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
