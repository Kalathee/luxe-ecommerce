import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { 
  Package, 
  CreditCard, 
  User, 
  MapPin, 
  Calendar,
  ChevronLeft,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater"
import Image from "next/image"

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: { product: true }
      },
      shippingAddress: true,
      payment: true,
    }
  })
  return order
}

export default async function AdminOrderDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const subtotal = order.subtotalAmountCents / 100
  const shipping = order.shippingAmountCents / 100
  const tax = order.taxAmountCents / 100
  const total = order.totalAmountCents / 100

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/orders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground">Manage and track this order fulfillment.</p>
          </div>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Order Items
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-secondary/50 overflow-hidden relative">
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity} × ${(item.price).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="font-bold">${(item.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4 text-primary" />
              Order Summary
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold border-b pb-4">
              <User className="h-4 w-4 text-primary" />
              Customer
            </div>
            <div className="space-y-1">
              <div className="font-medium">{order.user.name || "Guest User"}</div>
              <div className="text-sm text-muted-foreground">{order.user.email}</div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold border-b pb-4">
              <MapPin className="h-4 w-4 text-primary" />
              Shipping Address
            </div>
            {order.shippingAddress ? (
              <div className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No shipping address provided.</div>
            )}
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold border-b pb-4">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Information
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-bold ${order.payment?.status === "succeeded" ? "text-emerald-500" : "text-amber-500"}`}>
                  {order.payment?.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-[10px] truncate max-w-[100px]">{order.payment?.paymentIntentId || "N/A"}</span>
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold border-b pb-4">
              <Calendar className="h-4 w-4 text-primary" />
              Timeline
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                <div>
                  <div className="text-xs font-bold uppercase">Order Placed</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
