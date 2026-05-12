"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCartStore } from "@/store/useCartStore"
import { products } from "@/lib/products"

const featuredProducts = products.slice(0, 4)

export default function Home() {
  const addItem = useCartStore((state) => state.addItem)

  const handleQuickAdd = (product: typeof featuredProducts[0]) => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    })
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        
        <div className="container relative z-10 flex flex-col items-center text-center px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-background/30 backdrop-blur-md px-3 py-1 text-sm font-medium mb-8"
          >
            <Star className="mr-2 h-4 w-4 text-primary" fill="currentColor" />
            <span className="text-foreground">Spring Collection 2024</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-4xl text-foreground"
          >
            Redefining <br className="hidden md:block" /> Modern Luxury
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-6 max-w-[600px] text-lg md:text-xl text-foreground/80 font-medium"
          >
            Discover our curated collection of premium essentials designed for those who appreciate the finer details.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/shop">
              <Button size="lg" className="rounded-full h-14 px-8 text-base group">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-background/50 backdrop-blur-md border-foreground/20 hover:bg-background/80">
                View Lookbook
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-[600px]"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Trending Now</h2>
              <p className="text-muted-foreground text-lg">
                Explore our most sought-after pieces, crafted with uncompromising quality and timeless design.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/shop">
                <Button variant="link" className="text-base group font-medium px-0">
                  View all products
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group flex flex-col gap-4"
              >
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/50">
                    <Image 
                      src={product.images[0]} 
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg rounded-full"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleQuickAdd(product)
                        }}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Quick Add
                      </Button>
                    </div>
                  </div>
                </Link>
                <Link href={`/shop/${product.id}`} className="flex flex-col gap-1 px-1">
                  <div className="text-sm text-muted-foreground">{product.category}</div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="font-medium text-lg">{product.priceLabel}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Brand Value Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="flex flex-col items-center space-y-4"
             >
               <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center text-2xl font-bold">1</div>
               <h3 className="text-2xl font-bold">Uncompromising Quality</h3>
               <p className="text-background/70">Every piece is crafted with meticulous attention to detail and premium materials.</p>
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="flex flex-col items-center space-y-4"
             >
               <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center text-2xl font-bold">2</div>
               <h3 className="text-2xl font-bold">Sustainable Sourcing</h3>
               <p className="text-background/70">We partner with ethical manufacturers to ensure our products respect both people and planet.</p>
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="flex flex-col items-center space-y-4"
             >
               <div className="h-16 w-16 rounded-full bg-background/10 flex items-center justify-center text-2xl font-bold">3</div>
               <h3 className="text-2xl font-bold">Timeless Design</h3>
               <p className="text-background/70">Our aesthetics transcend trends, offering sophisticated pieces you&apos;ll cherish for years.</p>
             </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
