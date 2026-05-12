"use client"

import { motion } from "framer-motion"
import { Heart, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useWishlistStore } from "@/store/useWishlistStore"
import { useCartStore } from "@/store/useCartStore"
import { useState, useEffect } from "react"

export default function WishlistPage() {
  const [isClient, setIsClient] = useState(false)
  const items = useWishlistStore((state) => state.items)
  const removeItem = useWishlistStore((state) => state.removeItem)
  const addItemToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-6xl">
      <div className="flex items-center gap-3 mb-12 border-b pb-8">
        <Heart className="h-8 w-8" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Wishlist</h1>
        <span className="text-muted-foreground text-lg ml-2">({items.length} items)</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8">Save items you love to your wishlist to easily find them later.</p>
          <Link href="/shop">
            <Button size="lg" className="rounded-full">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col gap-4 relative"
            >
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-all shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
              <Link href={`/shop/${item.id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/50">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg rounded-full"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addItemToCart({
                          id: item.id,
                          slug: item.slug,
                          name: item.name,
                          price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price,
                          quantity: 1,
                          image: item.image
                        })
                      }}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Link>
              <Link href={`/shop/${item.id}`} className="flex flex-col gap-1 px-1">
                <div className="text-sm text-muted-foreground">{item.category}</div>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <span className="font-medium text-lg">{typeof item.price === 'number' ? `$${item.price}` : item.price}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
