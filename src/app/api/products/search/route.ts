import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ products: [] })
    }

    // Search by name or description using 'contains' for broad matching

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 20,
      include: {
        category: true,
      },
      orderBy: {
        // We could order by rank if we used raw query, but this is sufficient for now
        createdAt: "desc",
      },
    })

    logger.info({
      event: "search_executed",
      query,
      resultsCount: products.length,
    })

    return NextResponse.json({ products })
  } catch (error) {
    logger.error({ event: "search_error", error: error instanceof Error ? error.message : "Unknown error" })
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
