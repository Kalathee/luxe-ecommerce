"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Lock,
  Truck,
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Shield,
} from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

// ──────────────────────────────────────────────────────────────────
// Stripe loader (singleton outside component to avoid re-init)
// ──────────────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────
interface ShippingInfo {
  firstName: string
  lastName: string
  line1: string
  line2: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PriceSummary {
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  orderId: string
  orderNumber: string
}

// ──────────────────────────────────────────────────────────────────
// Inner payment form (must be inside <Elements>)
// ──────────────────────────────────────────────────────────────────
function PaymentForm({
  summary,
  onSuccess,
}: {
  summary: PriceSummary
  onSuccess: (orderNumber: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? "Payment details invalid")
      setPaying(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${summary.orderNumber}`,
      },
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.")
      setPaying(false)
    } else {
      // Payment succeeded without redirect (e.g. card payment)
      onSuccess(summary.orderNumber)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border bg-secondary/20 p-5">
        <PaymentElement
          options={{
            layout: "accordion",
            defaultValues: { billingDetails: { address: { country: "US" } } },
          }}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
        >
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </motion.div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 rounded-2xl text-base font-semibold"
        disabled={!stripe || !elements || paying}
      >
        {paying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay ${(summary.totalCents / 100).toFixed(2)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> 256-bit SSL</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Powered by Stripe</span>
      </div>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────
// Success screen
// ──────────────────────────────────────────────────────────────────
function SuccessScreen({ orderNumber }: { orderNumber: string }) {
  const clearCart = useCartStore((s) => s.clearCart)
  const router = useRouter()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 py-24"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle2 className="h-20 w-20 text-green-500" />
      </motion.div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter">Order Confirmed!</h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your purchase. Your order is being prepared.
        </p>
      </div>
      <div className="bg-secondary/40 border rounded-2xl px-8 py-4 text-sm">
        <span className="text-muted-foreground">Order number: </span>
        <span className="font-mono font-semibold">{orderNumber}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button size="lg" className="rounded-full h-12 px-8" onClick={() => router.push("/dashboard/orders")}>
          View Orders
        </Button>
        <Link href="/shop">
          <Button variant="outline" size="lg" className="rounded-full h-12 px-8">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Main Checkout Page
// ──────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { data: session, status: authStatus } = useSession()
  const items = useCartStore((s) => s.items)
  const router = useRouter()

  const [step, setStep] = useState<"shipping" | "payment" | "done">("shipping")
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })
  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingInfo>>({})
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [summary, setSummary] = useState<PriceSummary | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [successOrder, setSuccessOrder] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login?redirect=/checkout")
  }, [authStatus, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (authStatus === "authenticated" && items.length === 0 && step !== "done") {
      router.push("/cart")
    }
  }, [items, authStatus, step, router])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping_fee = subtotal >= 200 ? 0 : 15
  const tax = subtotal * 0.08

  // Validate shipping form
  const validateShipping = (): boolean => {
    const required: (keyof ShippingInfo)[] = [
      "firstName", "lastName", "line1", "city", "state", "zipCode",
    ]
    const errs: Partial<ShippingInfo> = {}
    required.forEach((k) => {
      if (!shipping[k]?.trim()) errs[k] = "Required"
    })
    setShippingErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleShippingContinue = useCallback(async () => {
    if (!validateShipping()) return
    setLoadingIntent(true)
    setIntentError(null)

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          shipping,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initialise payment")
      setClientSecret(data.clientSecret)
      setSummary({
        subtotalCents: data.subtotalCents,
        shippingCents: data.shippingCents,
        taxCents: data.taxCents,
        totalCents: data.totalCents,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
      })
      setStep("payment")
    } catch (err: any) {
      setIntentError(err.message)
    } finally {
      setLoadingIntent(false)
    }
  }, [items, shipping])

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (successOrder) return <SuccessScreen orderNumber={successOrder} />

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3">Checkout</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Secure checkout — your data is encrypted and protected
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[
          { key: "shipping", label: "Shipping", icon: Truck },
          { key: "payment", label: "Payment", icon: CreditCard },
        ].map(({ key, label, icon: Icon }, idx) => {
          const active = step === key
          const done =
            (key === "shipping" && step === "payment") ||
            (key === "shipping" && step === "done") ||
            (key === "payment" && step === "done")
          return (
            <div key={key} className="flex items-center gap-3">
              {idx > 0 && <div className="h-px w-8 bg-border" />}
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? "text-foreground" : done ? "text-green-500" : "text-muted-foreground"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${active ? "border-foreground bg-foreground text-background" : done ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/30"}`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {label}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Left panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Shipping ── */}
            {step === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["firstName", "lastName"] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-medium capitalize">
                        {field === "firstName" ? "First name" : "Last name"}
                      </label>
                      <Input
                        placeholder={field === "firstName" ? "John" : "Doe"}
                        value={shipping[field]}
                        onChange={(e) => setShipping((s) => ({ ...s, [field]: e.target.value }))}
                        className={`h-12 rounded-xl ${shippingErrors[field] ? "border-red-500" : ""}`}
                      />
                      {shippingErrors[field] && (
                        <p className="text-xs text-red-500">{shippingErrors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Street address</label>
                  <Input
                    placeholder="123 Main Street"
                    value={shipping.line1}
                    onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                    className={`h-12 rounded-xl ${shippingErrors.line1 ? "border-red-500" : ""}`}
                  />
                  {shippingErrors.line1 && (
                    <p className="text-xs text-red-500">{shippingErrors.line1}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Apartment, suite, etc. <span className="text-xs">(optional)</span>
                  </label>
                  <Input
                    placeholder="Apt 4B"
                    value={shipping.line2}
                    onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["city", "state", "zipCode"] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-medium capitalize">
                        {field === "zipCode" ? "ZIP code" : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <Input
                        placeholder={field === "city" ? "New York" : field === "state" ? "NY" : "10001"}
                        value={shipping[field]}
                        onChange={(e) => setShipping((s) => ({ ...s, [field]: e.target.value }))}
                        className={`h-12 rounded-xl ${shippingErrors[field] ? "border-red-500" : ""}`}
                      />
                      {shippingErrors[field] && (
                        <p className="text-xs text-red-500">{shippingErrors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {intentError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                  >
                    {intentError}
                  </motion.div>
                )}

                <Button
                  size="lg"
                  className="w-full h-14 rounded-2xl text-base font-semibold"
                  onClick={handleShippingContinue}
                  disabled={loadingIntent}
                >
                  {loadingIntent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing payment...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === "payment" && clientSecret && summary && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Payment</h2>
                  <button
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
                    onClick={() => setStep("shipping")}
                  >
                    ← Edit shipping
                  </button>
                </div>

                {/* Shipping summary badge */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {shipping.line1}, {shipping.city}, {shipping.state} {shipping.zipCode}
                  </span>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#ffffff",
                        colorBackground: "#1a1a1a",
                        colorText: "#ffffff",
                        colorDanger: "#ff6b6b",
                        fontFamily: "Inter, system-ui, sans-serif",
                        borderRadius: "12px",
                        spacingUnit: "4px",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    summary={summary}
                    onSuccess={(orderNumber) => {
                      setSuccessOrder(orderNumber)
                      setStep("done")
                    }}
                  />
                </Elements>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel: Order summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-secondary/30 rounded-3xl p-8 border sticky top-24 space-y-6"
          >
            <h2 className="text-xl font-bold">Order Summary</h2>

            {/* Cart items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-secondary shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={`font-medium ${shipping_fee === 0 ? "text-green-500" : ""}`}>
                  {shipping_fee === 0 ? "Free" : `$${shipping_fee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-5 flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold">
                ${(subtotal + shipping_fee + tax).toFixed(2)}
              </span>
            </div>

            {subtotal < 200 && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3 text-center">
                Add ${(200 - subtotal).toFixed(2)} more for <span className="text-green-500 font-medium">free shipping</span>
              </p>
            )}

            {/* Trust badges */}
            <div className="border-t pt-5 flex flex-wrap gap-3 justify-center">
              {[
                { icon: Lock, label: "Secure" },
                { icon: Shield, label: "Protected" },
                { icon: ShoppingBag, label: "Easy returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
