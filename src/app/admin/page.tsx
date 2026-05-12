import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { 
  Users, 
  DollarSign, 
  Package, 
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react"
import { DashboardCharts } from "@/components/admin/DashboardCharts"

async function getStats() {
  const [
    totalRevenue,
    orderCount,
    userCount,
    productCount,
    recentOrders
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmountCents: true },
      where: { status: "PAID" }
    }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ])

  return {
    revenue: (totalRevenue._sum.totalAmountCents || 0) / 100,
    orders: orderCount,
    users: userCount,
    products: productCount,
    recentOrders
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const statCards = [
    { title: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", isPositive: true },
    { title: "Total Orders", value: stats.orders.toString(), icon: Clock, trend: "+5.2%", isPositive: true },
    { title: "Active Customers", value: stats.users.toString(), icon: Users, trend: "+18.1%", isPositive: true },
    { title: "Total Products", value: stats.products.toString(), icon: Package, trend: "-2.4%", isPositive: false },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className={`flex items-center text-xs font-medium ${stat.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.trend}
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Sales Performance</h3>
          <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading charts...</div>}>
            <DashboardCharts />
          </Suspense>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Recent Orders</h3>
          <div className="space-y-6">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {order.user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">{order.user?.name || "Guest"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">${(order.totalAmountCents / 100).toFixed(2)}</div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    order.status === "PAID" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors">
            View All Orders
          </button>
        </div>
      </div>
    </div>
  )
}
