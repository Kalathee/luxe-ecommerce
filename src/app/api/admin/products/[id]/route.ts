import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { productSchema } from "@/lib/validations/admin"
import { logAudit } from "@/lib/audit"

/**
 * GET /api/admin/products/[id]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { id } = await params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PUT /api/admin/products/[id]
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { id } = await params

  try {
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    const oldProduct = await prisma.product.findUnique({ where: { id } })
    if (!oldProduct) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData,
        variants: validatedData.variants as any,
      },
    })

    await logAudit({
      action: "UPDATE_PRODUCT",
      entityType: "PRODUCT",
      entityId: product.id,
      details: { old: oldProduct, new: product },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.format() }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Soft delete product
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { id } = await params

  try {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    })

    await logAudit({
      action: "DELETE_PRODUCT",
      entityType: "PRODUCT",
      entityId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Toggle archive status
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
    const { isArchived } = body

    const product = await prisma.product.update({
      where: { id },
      data: { isArchived },
    })

    await logAudit({
      action: isArchived ? "ARCHIVE_PRODUCT" : "RESTORE_PRODUCT",
      entityType: "PRODUCT",
      entityId: id,
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
