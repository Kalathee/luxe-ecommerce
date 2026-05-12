import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/ProductForm"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  })
  return product
}

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto">
      <ProductForm initialData={product} />
    </div>
  )
}
