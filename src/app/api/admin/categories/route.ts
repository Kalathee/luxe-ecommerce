import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"

export async function GET() {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin()
  if ("error" in adminCheck) return adminCheck.error

  try {
    const body = await req.json()
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error("Failed to create category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
