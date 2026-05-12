import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil" as Stripe.StripeConfig["apiVersion"],
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Idempotency: skip already-processed events
  const existing = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  })
  if (existing?.processed) {
    return NextResponse.json({ received: true })
  }

  // Record the event
  await prisma.webhookEvent.upsert({
    where: { stripeEventId: event.id },
    update: {},
    create: { stripeEventId: event.id, type: event.type },
  })

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent
      const order = await prisma.order.findUnique({
        where: { paymentIntentId: pi.id },
      })
      if (order) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          }),
          prisma.payment.upsert({
            where: { paymentIntentId: pi.id },
            update: { status: "succeeded" },
            create: {
              orderId: order.id,
              paymentIntentId: pi.id,
              amountCents: pi.amount,
              currency: pi.currency,
              status: "succeeded",
            },
          }),
        ])
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent
      await prisma.order.updateMany({
        where: { paymentIntentId: pi.id },
        data: { status: "CANCELLED" },
      })
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true },
    })

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }
}
