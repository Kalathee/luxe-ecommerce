export interface Product {
  id: string
  slug: string
  name: string
  price: number
  priceLabel: string
  description: string
  category: string
  images: string[]
  rating: number
  reviews: number
  colors: string[]
  sizes: string[]
}

export const products: Product[] = [
  {
    id: "1",
    slug: "minimalist-chronograph-watch",
    name: "Minimalist Chronograph Watch",
    price: 299,
    priceLabel: "$299",
    description: "Crafted with precision and designed for the modern minimalist. This chronograph watch features a brushed stainless steel case, sapphire crystal glass, and a genuine Italian leather strap. Water-resistant up to 50 meters.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1994&auto=format&fit=crop",
    ],
    rating: 4.8,
    reviews: 124,
    colors: ["Black", "Silver", "Rose Gold"],
    sizes: ["38mm", "42mm"],
  },
  {
    id: "2",
    slug: "premium-leather-tote",
    name: "Premium Leather Tote",
    price: 499,
    priceLabel: "$499",
    description: "Hand-stitched from full-grain Italian leather. Features multiple compartments, magnetic closure, and adjustable shoulder strap. Ages beautifully over time, developing a unique patina.",
    category: "Bags",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2038&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop",
    ],
    rating: 4.9,
    reviews: 89,
    colors: ["Tan", "Black", "Burgundy"],
    sizes: ["Medium", "Large"],
  },
  {
    id: "3",
    slug: "noise-cancelling-headphones",
    name: "Noise Cancelling Headphones",
    price: 349,
    priceLabel: "$349",
    description: "Experience immersive sound with our premium noise-cancelling headphones. 40-hour battery life, premium memory foam cushions, and studio-grade 40mm audio drivers deliver crystal-clear highs and deep bass.",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1888&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
    ],
    rating: 4.7,
    reviews: 312,
    colors: ["Matte Black", "Silver", "Midnight Blue"],
    sizes: ["One Size"],
  },
  {
    id: "4",
    slug: "signature-sunglasses",
    name: "Signature Sunglasses",
    price: 159,
    priceLabel: "$159",
    description: "Polarized lenses with 100% UV protection. Titanium frame with acetate temple tips for all-day comfort. Includes premium carrying case and microfiber cloth.",
    category: "Eyewear",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop",
    ],
    rating: 4.6,
    reviews: 67,
    colors: ["Tortoise", "Black", "Gold"],
    sizes: ["Standard", "Large"],
  },
  {
    id: "5",
    slug: "silk-scarf",
    name: "Silk Scarf",
    price: 89,
    priceLabel: "$89",
    description: "100% mulberry silk, hand-rolled edges. Original artwork printed with eco-friendly dyes. Versatile styling options — wear as a headband, neck scarf, or bag accessory.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1974&auto=format&fit=crop",
    ],
    rating: 4.5,
    reviews: 42,
    colors: ["Floral", "Abstract", "Classic"],
    sizes: ["70cm × 70cm", "90cm × 90cm"],
  },
  {
    id: "6",
    slug: "leather-bi-fold-wallet",
    name: "Leather Bi-fold Wallet",
    price: 129,
    priceLabel: "$129",
    description: "Slim profile with RFID-blocking technology. 6 card slots, 2 bill compartments, and a coin pocket. Comes in a premium gift box — the perfect present.",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1974&auto=format&fit=crop",
    ],
    rating: 4.8,
    reviews: 156,
    colors: ["Black", "Brown", "Navy"],
    sizes: ["Standard"],
  },
  {
    id: "7",
    slug: "ceramic-mug-set",
    name: "Ceramic Mug Set",
    price: 59,
    priceLabel: "$59",
    description: "Set of 4 hand-glazed ceramic mugs. Microwave and dishwasher safe. Each mug holds 12oz with a unique artisanal finish that makes every piece one of a kind.",
    category: "Home",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop",
    ],
    rating: 4.4,
    reviews: 78,
    colors: ["Earth Tones", "Ocean", "Charcoal"],
    sizes: ["12oz"],
  },
  {
    id: "8",
    slug: "wool-overcoat",
    name: "Wool Overcoat",
    price: 599,
    priceLabel: "$599",
    description: "Double-breasted overcoat crafted from Italian merino wool. Fully lined with satin. Classic silhouette with modern tailoring ensures a flattering fit for all body types.",
    category: "Apparel",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1974&auto=format&fit=crop",
    ],
    rating: 4.9,
    reviews: 34,
    colors: ["Camel", "Charcoal", "Navy"],
    sizes: ["S", "M", "L", "XL"],
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getRelatedProducts(currentId: string, count = 3): Product[] {
  return products.filter((p) => p.id !== currentId).slice(0, count)
}
