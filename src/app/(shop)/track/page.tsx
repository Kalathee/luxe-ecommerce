"use client"

import { motion } from "framer-motion"
import { Package, CheckCircle2, Truck, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const steps = [
  { label: "Order Placed", date: "May 8, 2024", icon: <Package className="h-5 w-5" />, completed: true },
  { label: "Processing", date: "May 9, 2024", icon: <CheckCircle2 className="h-5 w-5" />, completed: true },
  { label: "Shipped", date: "May 10, 2024", icon: <Truck className="h-5 w-5" />, completed: true },
  { label: "Delivered", date: "Expected May 13", icon: <MapPin className="h-5 w-5" />, completed: false },
]

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order ID to see real-time shipping updates</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-3 mb-16"
      >
        <Input placeholder="e.g. LX-84921" className="h-12 rounded-xl" />
        <Button className="h-12 px-6 rounded-xl">Track</Button>
      </motion.div>

      {/* Order Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border rounded-3xl p-8 md:p-12"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold">Order #LX-84921</h2>
            <p className="text-sm text-muted-foreground">Minimalist Watch × 1</p>
          </div>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary">
            In Transit
          </span>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-12 ${step.completed ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-12">
                <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
