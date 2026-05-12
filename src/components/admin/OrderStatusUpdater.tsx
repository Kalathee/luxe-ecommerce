"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  CheckCircle2, 
  Loader2, 
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { OrderStatus } from "@prisma/client"

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

const statusOptions: { label: string, value: OrderStatus, color: string }[] = [
  { label: "Pending", value: "PENDING", color: "bg-amber-500" },
  { label: "Processing", value: "PROCESSING", color: "bg-blue-500" },
  { label: "Shipped", value: "SHIPPED", color: "bg-purple-500" },
  { label: "Delivered", value: "DELIVERED", color: "bg-emerald-500" },
  { label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
  { label: "Refunded", value: "REFUNDED", color: "bg-gray-500" },
]

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast(`Order marked as ${newStatus}`)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong"
      toast(message, "error")
    } finally {
      setLoading(false)
      setIsOpen(false)
    }
  }

  const currentOption = statusOptions.find(o => o.value === currentStatus) || statusOptions[0]

  return (
    <div className="relative">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="rounded-xl min-w-[160px] justify-between shadow-lg shadow-primary/10"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
          <>
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${currentOption.color}`} />
              {currentOption.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-1">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update Status</div>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusUpdate(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 transition-colors flex items-center justify-between ${
                  currentStatus === option.value ? "text-primary font-bold" : ""
                }`}
              >
                {option.label}
                {currentStatus === option.value && <CheckCircle2 className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
