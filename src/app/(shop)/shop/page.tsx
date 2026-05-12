"use client"

import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCartStore } from "@/store/useCartStore"
import { products } from "@/lib/products"
import { Suspense, useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

const categories = ["All", "Accessories", "Bags", "Electronics", "Eyewear", "Apparel", "Home"]

// Map navbar filters to product categories
const categoryMap: Record<string, string[]> = {
  all: [],
  men: ["Accessories", "Electronics", "Apparel"],
  women: ["Bags", "Eyewear", "Accessories", "Apparel"],
  accessories: ["Accessories"],
  bags: ["Bags"],
  electronics: ["Electronics"],
  eyewear: ["Eyewear"],
  apparel: ["Apparel"],
  home: ["Home"],
}

function ShopContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")?.toLowerCase() || ""
  const focusParam = searchParams.get("focus")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (focusParam === "search" && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [focusParam])

  const filteredProducts = products.filter((p) => {
    // Category filter
    let matchesCategory = true
    if (categoryParam && categoryParam !== "all") {
      const mapped = categoryMap[categoryParam]
      if (mapped && mapped.length > 0) {
        matchesCategory = mapped.includes(p.category)
      } else {
        matchesCategory = p.category.toLowerCase() === categoryParam
      }
    }

    // Search query filter
    let matchesSearch = true
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      matchesSearch = 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    }

    return matchesCategory && matchesSearch
  })

  const activeLabel = categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
    : "All"

  const { toast } = useToast()

  const handleQuickAdd = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    })
    toast(`${product.name} added to your bag`)
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-6 border-b pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                {categoryParam && categoryParam !== "all" ? activeLabel : "All Products"}
              </h1>
              <p className="text-muted-foreground mt-2">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-secondary/30 border-transparent focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/shop">
              <Button
                variant={!categoryParam || categoryParam === "all" ? "default" : "outline"}
                className="rounded-full h-9 text-sm"
                size="sm"
              >
                All
              </Button>
            </Link>
            {categories.filter(c => c !== "All").map((cat) => (
              <Link key={cat} href={`/shop?category=${cat.toLowerCase()}`}>
                <Button
                  variant={categoryParam === cat.toLowerCase() ? "default" : "outline"}
                  className="rounded-full h-9 text-sm"
                  size="sm"
                >
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl font-semibold mb-2">No products found</p>
            <p className="text-muted-foreground mb-6">Try a different category</p>
            <Link href="/shop">
              <Button variant="outline" className="rounded-full">View All Products</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
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
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-secondary/50 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-secondary/50 rounded-2xl" />
                <div className="h-4 w-24 bg-secondary/50 rounded" />
                <div className="h-5 w-full bg-secondary/50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
