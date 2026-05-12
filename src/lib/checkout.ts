import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { logger } from "@/lib/logger"

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface CartItem {
  productId: string
  quantity: number
}

export interface CheckoutInput {
  userId: string
  items: CartItem[]
  shippingAddressId?: string
  paymentIntent?: string
  paymentMethod?: string
}

export interface CheckoutResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  error?: string
}

// ──────────────────────────────────────────
// Atomic Checkout Transaction
// ──────────────────────────────────────────

/**
 * Creates an order atomically with inventory validation.
 * 
 * This uses Prisma interactive transactions to:
 * 1. Validate all products exist and are active
 * 2. Check inventory >= requested quantity
 * 3. Decrement inventory atomically with optimistic concurrency
 * 4. Create the order and order items
 * 
 * If ANY step fails, the entire transaction rolls back.
 */
export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const { userId, items, shippingAddressId, paymentIntent, paymentMethod } = input

  if (!items.length) {
    return { success: false, error: "Cart is empty" }
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Step 1: Fetch all products and validate
      const productIds = items.map((i) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      })

      // Validate all products exist
      if (products.length !== items.length) {
        const foundIds = new Set(products.map((p) => p.id))
        const missing = items.filter((i) => !foundIds.has(i.productId))
        throw new Error(
          `Products not found or inactive: ${missing.map((m) => m.productId).join(", ")}`
        )
      }

      // Step 2: Validate inventory and calculate totals
      const productMap = new Map(products.map((p) => [p.id, p]))
      let subtotal = 0

      for (const item of items) {
        const product = productMap.get(item.productId)!
        if (product.inventory < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.inventory}`
          )
        }
        subtotal += product.price * item.quantity
      }

      const taxRate = 0.08 // 8% tax
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100
      const shippingAmount = subtotal >= 100 ? 0 : 15 // Free shipping over $100
      const totalAmount = subtotal + taxAmount + shippingAmount

      // Step 3: Decrement inventory atomically with optimistic concurrency
      for (const item of items) {
        const product = productMap.get(item.productId)!
        const updated = await tx.product.updateMany({
          where: {
            id: product.id,
            version: product.version, // Optimistic lock
            inventory: { gte: item.quantity }, // Double-check stock
          },
          data: {
            inventory: { decrement: item.quantity },
            version: { increment: 1 },
          },
        })

        if (updated.count === 0) {
          throw new Error(
            `Concurrent modification detected for "${product.name}". Please try again.`
          )
        }
      }

      // Step 4: Create order with items
      const orderNumber = generateOrderNumber()
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PAID",
          subtotalAmountCents: Math.round(subtotal * 100),
          taxAmountCents: Math.round(taxAmount * 100),
          shippingAmountCents: Math.round(shippingAmount * 100),
          totalAmountCents: Math.round(totalAmount * 100),
          paymentIntentId: paymentIntent,
          paymentMethod,
          shippingAddressId,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                total: product.price * item.quantity,
              }
            }),
          },
        },
        include: { items: true },
      })

      logger.info({
        event: "order_created",
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        userId,
        total: totalAmount,
        itemCount: items.length,
      })

      return newOrder
    }, {
      // Transaction options
      maxWait: 5000, // Max time to wait for transaction to start
      timeout: 10000, // Max time for transaction to complete
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed"
    logger.error({ event: "checkout_failed", userId, error: message })
    return { success: false, error: message }
  }
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

/**
 * Generate a human-readable order number: LX-XXXXXX
 */
function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = "LX-"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Restore inventory when an order is cancelled.
 */
export async function cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (!order) throw new Error("Order not found")
      if (order.userId !== userId) throw new Error("Unauthorized")
      if (order.status === "CANCELLED") throw new Error("Order already cancelled")
      if (order.status === "SHIPPED" || order.status === "DELIVERED") {
        throw new Error("Cannot cancel shipped/delivered orders")
      }

      // Restore inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: { increment: item.quantity },
            version: { increment: 1 },
          },
        })
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      })

      logger.info({ event: "order_cancelled", orderId, userId })
    })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancellation failed"
    return { success: false, error: message }
  }
}
