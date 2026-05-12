"use client"

import { motion } from "framer-motion"
import { Package, User, CreditCard, Settings, LogOut } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-12">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 font-medium text-foreground transition-colors text-left">
            <Package className="h-5 w-5" />
            Orders
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors text-left">
            <User className="h-5 w-5" />
            Profile Details
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors text-left">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors text-left">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left mt-8">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
        
        <div className="md:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-8">Recent Orders</h2>
            
            <div className="flex flex-col gap-6">
              {[1, 2].map((order) => (
                <div key={order} className="border rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg">Order #LX-8492{order}</p>
                      <p className="text-sm text-muted-foreground">Placed on Oct 24, 2024</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                      Delivered
                    </span>
                    <span className="font-bold">$349.00</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
