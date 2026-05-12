"use client"

import { motion } from "framer-motion"
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/store/useCartStore"

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const totalPrice = useCartStore((state) => state.totalPrice)

  const subtotal = totalPrice()
  const shipping = items.length > 0 ? 15 : 0
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-24 md:py-32 max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <h1 className="text-3xl font-bold tracking-tighter">Your cart is empty</h1>
          <p className="text-muted-foreground max-w-md">
            Looks like you haven&apos;t added anything to your cart yet. Explore our collection and find something you love.
          </p>
          <Link href="/shop">
            <Button size="lg" className="rounded-full h-12 px-8">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-6xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-6 items-center border-b pb-8"
            >
              <Link href={`/shop/${item.id}`} className="relative w-24 h-32 md:w-32 md:h-40 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill
                  sizes="(max-width: 768px) 96px, 128px"
                  className="object-cover" 
                />
              </Link>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                <div className="flex flex-col gap-2">
                  <Link href={`/shop/${item.id}`}>
                    <h3 className="font-semibold text-lg hover:underline">{item.name}</h3>
                  </Link>
                  <p className="text-muted-foreground text-sm">Black / Medium</p>
                  <p className="font-medium text-lg mt-2">${item.price}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center border rounded-full overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-secondary/30 rounded-3xl p-8 border"
          >
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 text-sm border-b pb-6 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Estimate</span>
                <span className="font-medium">${shipping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
            
            <Link href="/checkout">
              <Button size="lg" className="w-full rounded-full h-14 text-base">
                Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <div className="mt-4">
              <Link href="/shop">
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                  Continue Shopping
                </Button>
              </Link>
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              Secure checkout via Stripe.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
