"use client"

import { motion } from "framer-motion"
import { Star, Minus, Plus, Heart, Truck, Shield, RotateCcw, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { useCartStore } from "@/store/useCartStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import { getProductById, getRelatedProducts } from "@/lib/products"

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(id)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  
  const addItem = useCartStore((state) => state.addItem)
  const addWishlistItem = useWishlistStore((state) => state.addItem)
  const removeWishlistItem = useWishlistStore((state) => state.removeItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))

  const toggleWishlist = () => {
    if (isInWishlist) {
      removeWishlistItem(product.id)
    } else {
      addWishlistItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.images[0]
      })
    }
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0],
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
      {/* Product Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image Gallery */}
        <motion.div
          key={product.id + "-images"}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary/30">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === i ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image 
                  src={img} 
                  alt="" 
                  fill
                  sizes="80px"
                  className="object-cover" 
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          key={product.id + "-info"}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <p className="text-3xl font-bold">${product.price}</p>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Color: <span className="text-muted-foreground">{product.colors[selectedColor]}</span></p>
            <div className="flex gap-3">
              {product.colors.map((color, i) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(i)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selectedColor === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Size</p>
            <div className="flex gap-3">
              {product.sizes.map((size, i) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(i)}
                  className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-all ${
                    selectedSize === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center border rounded-full overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-secondary transition-colors">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-secondary transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="rounded-full h-12 flex-1 text-base" onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className={`rounded-full h-12 px-4 transition-colors ${isInWishlist ? 'text-red-500 border-red-500/50 hover:bg-red-500/10' : ''}`}
              onClick={toggleWishlist}
            >
              <Heart className={`h-5 w-5 transition-all ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t mt-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">2 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">30-Day Returns</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <section className="mt-24 md:mt-32">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col gap-4"
            >
              <Link href={`/shop/${p.id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/50">
                  <Image 
                    src={p.images[0]} 
                    alt={p.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
              </Link>
              <Link href={`/shop/${p.id}`} className="flex flex-col gap-1 px-1">
                <div className="text-sm text-muted-foreground">{p.category}</div>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <span className="font-medium text-lg">{p.priceLabel}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
