import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { OrderStatus } from "@prisma/client"

/**
 * GET /api/admin/orders
 */
export async function GET(req: Request) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search") || ""

  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as OrderStatus } : {}),
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      },
      include: { 
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
