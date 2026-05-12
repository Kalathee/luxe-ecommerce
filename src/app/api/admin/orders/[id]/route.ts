import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { orderStatusSchema } from "@/lib/validations/admin"
import { logAudit } from "@/lib/audit"

/**
 * GET /api/admin/orders/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { id } = await params

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        user: true, 
        items: { include: { product: true } },
        shippingAddress: true,
        payment: true
      },
    })

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order status
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { id } = await params

  try {
    const body = await req.json()
    const { status } = orderStatusSchema.parse(body)

    const oldOrder = await prisma.order.findUnique({ where: { id } })
    if (!oldOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // Valid transitions (simple check)
    if (oldOrder.status === "DELIVERED" || oldOrder.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot update status from ${oldOrder.status}` }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    await logAudit({
      action: "UPDATE_ORDER_STATUS",
      entityType: "ORDER",
      entityId: id,
      details: { old: oldOrder.status, new: status },
    })

    return NextResponse.json(order)
  } catch (error: unknown) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
