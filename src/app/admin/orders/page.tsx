import { prisma } from "@/lib/prisma"
import { OrderTable } from "@/components/admin/OrderTable"

async function getOrders() {
  const orders = await prisma.order.findMany({
    include: { 
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } }
    },
    orderBy: { createdAt: "desc" }
  })
  
  return orders.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }))
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Monitor and manage customer orders and shipments.</p>
      </div>

      <OrderTable initialData={orders} />
    </div>
  )
}
