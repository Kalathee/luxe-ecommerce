import { NextResponse } from "next/server"
import Stripe from "stripe"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil" as Stripe.StripeConfig["apiVersion"],
})

const schema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),   // Used to look up authoritative price from DB
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().default("US"),
  }),
})

export async function POST(req: Request) {
  // Check if Stripe keys are configured
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("REPLACE_ME")) {
    return NextResponse.json(
      { error: "Stripe API keys are not configured. Please add your real keys to the .env file." },
      { status: 500 }
    )
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { items, shipping } = parsed.data

    // Look up products by SLUG (matches static data slugs) — never trust client prices
    const slugs = items.map((i) => i.slug)
    const dbProducts = await prisma.product.findMany({
      where: { slug: { in: slugs }, isActive: true },
    })

    if (dbProducts.length !== slugs.length) {
      const foundSlugs = dbProducts.map((p) => p.slug)
      const missingSlugs = slugs.filter((s) => !foundSlugs.includes(s))
      console.error("Products not found in DB:", missingSlugs)
      return NextResponse.json(
        {
          error: "One or more products are unavailable",
          missing: missingSlugs,
        },
        { status: 422 }
      )
    }

    // Build line items using DB-authoritative prices
    const lineItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.slug === item.slug)!
      return {
        productId: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        quantity: item.quantity,
        unitPriceCents: Math.round(dbProduct.price * 100),
      }
    })

    const subtotalCents = lineItems.reduce(
      (sum, li) => sum + li.unitPriceCents * li.quantity,
      0
    )
    const shippingCents = subtotalCents >= 20000 ? 0 : 1500 // Free shipping over $200
    const taxCents = Math.round(subtotalCents * 0.08)       // 8% tax
    const totalCents = subtotalCents + shippingCents + taxCents

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session.user.id,
        itemCount: items.length.toString(),
      },
    })

    // Create Address record
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        line1: shipping.line1,
        line2: shipping.line2 ?? null,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zipCode,
        country: shipping.country,
      },
    })

    // Create Order with PENDING status (confirmed via webhook on payment success)
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        totalAmountCents: totalCents,
        subtotalAmountCents: subtotalCents,
        taxAmountCents: taxCents,
        shippingAmountCents: shippingCents,
        paymentIntentId: paymentIntent.id,
        shippingAddressId: address.id,
        items: {
          create: lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            price: li.unitPriceCents / 100,
            total: (li.unitPriceCents * li.quantity) / 100,
          })),
        },
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalCents,
      subtotalCents,
      shippingCents,
      taxCents,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    console.error("create-payment-intent error:", error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
