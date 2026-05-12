"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Get in Touch</h1>
        <p className="text-muted-foreground text-lg max-w-[500px] mx-auto">
          Have a question or feedback? We&apos;d love to hear from you. Our team typically responds within 24 hours.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: <Mail className="h-6 w-6" />, title: "Email", detail: "hello@luxe.com" },
          { icon: <Phone className="h-6 w-6" />, title: "Phone", detail: "+1 (555) 000-0000" },
          { icon: <MapPin className="h-6 w-6" />, title: "Office", detail: "123 Design Street, NYC" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center text-center gap-3 p-8 border rounded-2xl"
          >
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-foreground">
              {item.icon}
            </div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.detail}</p>
          </motion.div>
        ))}
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border rounded-3xl p-8 md:p-12 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Name</label>
            <Input id="name" placeholder="Your name" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="subject">Subject</label>
          <Input id="subject" placeholder="How can we help?" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={6}
            placeholder="Tell us more about your inquiry..."
            className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
          />
        </div>
        <Button size="lg" className="rounded-xl h-12 px-8">
          Send Message
        </Button>
      </motion.form>
    </div>
  )
}
