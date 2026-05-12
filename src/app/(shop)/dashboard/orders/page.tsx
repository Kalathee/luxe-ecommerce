import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500",
  PAID: "bg-emerald-500/10 text-emerald-500",
  PROCESSING: "bg-blue-500/10 text-blue-500",
  SHIPPED: "bg-purple-500/10 text-purple-500",
  DELIVERED: "bg-emerald-500/20 text-emerald-600",
  CANCELLED: "bg-rose-500/10 text-rose-500",
}

export default async function CustomerOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-xl">
          <ShoppingBag className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-3xl shadow-sm">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders yet.</p>
          <Link href="/shop">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 border-b bg-secondary/20 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Order Date</div>
                    <div className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Amount</div>
                    <div className="text-sm font-bold text-primary">${(order.totalAmountCents / 100).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Order ID</div>
                    <div className="text-sm font-mono">{order.orderNumber}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-secondary/10 border-t flex justify-end">
                <Link href={`/dashboard/orders/${order.id}`}>
                  <button className="text-xs font-bold flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    View Details <ChevronRight className="h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
