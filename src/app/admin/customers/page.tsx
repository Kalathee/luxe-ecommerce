import { prisma } from "@/lib/prisma"
import { Mail, Calendar, ShoppingCart, Shield } from "lucide-react"

async function getCustomers() {
  const customers = await prisma.user.findMany({
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
  return customers
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">View and manage your registered users.</p>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground border-b uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Orders</th>
                <th className="px-6 py-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {customer.name?.[0] || customer.email?.[0] || "U"}
                      </div>
                      <span className="font-medium">{customer.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      customer.role === "ADMIN" || customer.role === "SUPER_ADMIN" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      <Shield className="h-3 w-3" />
                      {customer.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                      {customer._count.orders}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
