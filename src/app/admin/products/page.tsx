import { prisma } from "@/lib/prisma"
import { ProductTable } from "@/components/admin/ProductTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  })
  
  // Transform data for the client component if needed
  return products.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog, inventory, and variants.</p>
        </div>
      </div>

      <ProductTable initialData={products as any} />
    </div>
  )
}
