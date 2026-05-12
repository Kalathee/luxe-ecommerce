import { prisma } from "@/lib/prisma"
import { CategoryTable } from "@/components/admin/CategoryTable"

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  })
  return categories
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Organize your products into logical collections.</p>
      </div>

      <CategoryTable initialData={categories} />
    </div>
  )
}
