import { prisma } from "@/lib/prisma"
import { CustomerTable } from "@/components/admin/CustomerTable"

async function getCustomers() {
  const customers = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true } },
      orders: {
        select: { totalAmountCents: true },
        where: { status: "PAID" }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return customers.map(u => ({
    id: u.id,
    name: u.name || "Guest",
    email: u.email,
    role: u.role,
    orderCount: u._count.orders,
    totalSpent: u.orders.reduce((sum, o) => sum + o.totalAmountCents, 0) / 100,
    createdAt: u.createdAt.toISOString()
  }))
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">View and manage your registered user base.</p>
      </div>

      <CustomerTable initialData={customers} />
    </div>
  )
}
