import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { productSchema } from "@/lib/validations/admin"
import { logAudit } from "@/lib/audit"

/**
 * GET /api/admin/products
 * Fetch all products with filtering and search
 */
export async function GET(req: Request) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("categoryId")
  const isArchived = searchParams.get("isArchived") === "true"

  try {
    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        isArchived: isArchived,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 */
export async function POST(req: Request) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  try {
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        variants: (validatedData.variants || []) as unknown as string[],
      },
    })

    await logAudit({
      action: "CREATE_PRODUCT",
      entityType: "PRODUCT",
      entityId: product.id,
      details: validatedData,
    })

    return NextResponse.json(product)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.format() }, { status: 400 })
    }
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
