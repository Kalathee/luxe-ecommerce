import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../src/lib/password"

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function main() {
  console.log("🌱 Seeding database...")

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Accessories" },
      update: {},
      create: { name: "Accessories", slug: "accessories", description: "Premium accessories for the modern individual" },
    }),
    prisma.category.upsert({
      where: { name: "Bags" },
      update: {},
      create: { name: "Bags", slug: "bags", description: "Handcrafted bags with premium materials" },
    }),
    prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: { name: "Electronics", slug: "electronics", description: "Cutting-edge tech with elegant design" },
    }),
    prisma.category.upsert({
      where: { name: "Eyewear" },
      update: {},
      create: { name: "Eyewear", slug: "eyewear", description: "Designer eyewear collection" },
    }),
    prisma.category.upsert({
      where: { name: "Apparel" },
      update: {},
      create: { name: "Apparel", slug: "apparel", description: "Premium clothing and outerwear" },
    }),
    prisma.category.upsert({
      where: { name: "Home" },
      update: {},
      create: { name: "Home", slug: "home", description: "Luxury home essentials" },
    }),
  ])

  const [accessories, bags, electronics, eyewear, apparel, home] = categories

  // Create products
  const products = [
    {
      name: "Minimalist Chronograph Watch",
      slug: "minimalist-chronograph-watch",
      description: "Crafted with precision and designed for the modern minimalist. Features a brushed stainless steel case, sapphire crystal glass, and genuine Italian leather strap. Water-resistant up to 50 meters.",
      price: 299,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop",
      ],
      inventory: 50,
      categoryId: accessories.id,
    },
    {
      name: "Premium Leather Tote",
      slug: "premium-leather-tote",
      description: "Hand-stitched from full-grain Italian leather. Features multiple compartments, magnetic closure, and adjustable shoulder strap. Ages beautifully over time.",
      price: 499,
      images: [
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2038&auto=format&fit=crop",
      ],
      inventory: 30,
      categoryId: bags.id,
    },
    {
      name: "Noise Cancelling Headphones",
      slug: "noise-cancelling-headphones",
      description: "Experience immersive sound with our premium noise-cancelling headphones. 40-hour battery life, premium memory foam cushions, and studio-grade audio drivers.",
      price: 349,
      images: [
        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1888&auto=format&fit=crop",
      ],
      inventory: 75,
      categoryId: electronics.id,
    },
    {
      name: "Signature Sunglasses",
      slug: "signature-sunglasses",
      description: "Polarized lenses with 100% UV protection. Titanium frame with acetate temple tips. Includes premium carrying case.",
      price: 159,
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop",
      ],
      inventory: 100,
      categoryId: eyewear.id,
    },
    {
      name: "Silk Scarf",
      slug: "silk-scarf",
      description: "100% mulberry silk, hand-rolled edges. Original artwork printed with eco-friendly dyes. Versatile styling options.",
      price: 89,
      images: [
        "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1974&auto=format&fit=crop",
      ],
      inventory: 60,
      categoryId: accessories.id,
    },
    {
      name: "Leather Bi-fold Wallet",
      slug: "leather-bi-fold-wallet",
      description: "Slim profile with RFID-blocking technology. 6 card slots, 2 bill compartments, and a coin pocket. Comes in a premium gift box.",
      price: 129,
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1974&auto=format&fit=crop",
      ],
      inventory: 80,
      categoryId: accessories.id,
    },
    {
      name: "Ceramic Mug Set",
      slug: "ceramic-mug-set",
      description: "Set of 4 hand-glazed ceramic mugs. Microwave and dishwasher safe. Each mug holds 12oz. Unique artisanal finish.",
      price: 59,
      images: [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop",
      ],
      inventory: 40,
      categoryId: home.id,
    },
    {
      name: "Wool Overcoat",
      slug: "wool-overcoat",
      description: "Double-breasted overcoat crafted from Italian merino wool. Fully lined with satin. Classic silhouette with modern tailoring.",
      price: 599,
      images: [
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1974&auto=format&fit=crop",
      ],
      inventory: 25,
      categoryId: apparel.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  // Create admin user with a properly hashed password
  const adminPassword = hashPassword("admin123")
  await prisma.user.upsert({
    where: { email: "admin@luxe.com" },
    update: { password: adminPassword },
    create: {
      email: "admin@luxe.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  console.log("✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
