import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar,
  Package,
  CheckCircle2,
  Clock
} from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500",
  PAID: "bg-emerald-500/10 text-emerald-500",
  PROCESSING: "bg-blue-500/10 text-blue-500",
  SHIPPED: "bg-purple-500/10 text-purple-500",
  DELIVERED: "bg-emerald-500/20 text-emerald-600",
  CANCELLED: "bg-rose-500/10 text-rose-500",
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
      payment: true
    }
  })

  if (!order) notFound()

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusColors[order.status] || ""}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {order.items.length} Items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-secondary/10">
              <h3 className="font-semibold">Items</h3>
            </div>
            <div className="p-6 divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="h-20 w-16 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.images[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{item.product.category}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-bold">${(item.priceCents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Progress */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Delivery Progress
            </h3>
            <div className="space-y-6">
              {[
                { label: "Order Placed", date: order.createdAt, done: true },
                { label: "Payment Confirmed", date: order.payment?.createdAt, done: order.status !== "PENDING" },
                { label: "Processing", date: null, done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) },
                { label: "Shipped", date: null, done: ["SHIPPED", "DELIVERED"].includes(order.status) },
                { label: "Delivered", date: null, done: order.status === "DELIVERED" },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${step.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    {i < 4 && <div className={`w-0.5 h-10 ${step.done ? "bg-primary/30" : "bg-secondary"}`} />}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</div>
                    {step.date && <div className="text-[10px] text-muted-foreground">{new Date(step.date).toLocaleString()}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(order.subtotalAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>${(order.shippingAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${(order.taxAmount / 100).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${(order.totalAmountCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Shipping Address
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.line1}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress?.line2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
