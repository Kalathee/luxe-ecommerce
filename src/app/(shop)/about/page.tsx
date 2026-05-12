"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative h-[60vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">Our Story</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto">
            Founded in 2020, Luxe was born from a simple belief: everyone deserves access to premium quality.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 md:px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Designed for those who appreciate the details
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              At Luxe, we believe that exceptional design should be accessible. Our team of designers and craftspeople work tirelessly to create products that combine beauty, functionality, and sustainability.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Every product in our collection goes through rigorous quality testing. We partner with ethical manufacturers who share our commitment to fair labor practices and environmental responsibility.
            </p>
            <Button variant="link" className="text-base group font-medium px-0">
              Read our sustainability report
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-[4/5] rounded-3xl overflow-hidden bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
              alt="Our workshop"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-foreground text-background py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Happy Customers" },
              { value: "200+", label: "Premium Products" },
              { value: "15", label: "Countries Shipped" },
              { value: "4.9", label: "Average Rating" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
                <div className="text-sm text-background/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 md:px-6 py-24 md:py-32">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-center mb-16">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Sarah M.", text: "The quality is unmatched. Every piece I've purchased has exceeded my expectations. Luxe is my go-to for premium essentials.", avatar: "S" },
            { name: "David K.", text: "Incredible attention to detail. From the packaging to the product itself, everything feels intentional and luxurious.", avatar: "D" },
            { name: "Priya R.", text: "I love that Luxe prioritizes sustainability without compromising on design. These are products I feel proud to own.", avatar: "P" },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border rounded-2xl p-8 space-y-4"
            >
              <p className="text-muted-foreground leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <span className="font-medium">{testimonial.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
