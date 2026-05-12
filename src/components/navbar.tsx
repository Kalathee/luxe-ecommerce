"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShoppingBag, Search, User, Menu, Heart, X } from "lucide-react"
import { Button } from "./ui/button"
import { useCartStore } from "@/store/useCartStore"
import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const cartItems = useCartStore((state) => state.items)
  const totalItems = useCartStore((state) => state.totalItems)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const accountMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold tracking-tighter"
            >
              LUXE.
            </motion.span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              New Arrivals
            </Link>
            <Link href="/shop?category=men" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Men
            </Link>
            <Link href="/shop?category=women" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Women
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Our Story
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/shop?focus=search">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>
          
          {status === "authenticated" && session?.user ? (
            <div className="relative" ref={accountMenuRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="rounded-full bg-secondary/50"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
              
              {accountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border bg-background p-2 shadow-md"
                >
                  <div className="px-2 py-1.5 text-sm font-medium border-b mb-1 truncate">
                    {session.user.name}
                  </div>
                  <Link href="/dashboard" onClick={() => setAccountMenuOpen(false)}>
                    <div className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-secondary cursor-pointer">
                      My Account
                    </div>
                  </Link>
                  {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                    <Link href="/admin" onClick={() => setAccountMenuOpen(false)}>
                      <div className="flex w-full items-center rounded-md px-2 py-1.5 text-sm font-bold text-primary hover:bg-primary/10 cursor-pointer">
                        Admin Dashboard
                      </div>
                    </Link>
                  )}
                  <Link href="/dashboard/orders" onClick={() => setAccountMenuOpen(false)}>
                    <div className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-secondary cursor-pointer">
                      Orders
                    </div>
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setAccountMenuOpen(false)}>
                    <div className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-secondary cursor-pointer">
                      Settings
                    </div>
                  </Link>
                  <div className="my-1 border-t"></div>
                  <button 
                    onClick={() => { setAccountMenuOpen(false); signOut(); }}
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems()}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t bg-background/95 backdrop-blur-md"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 hover:text-primary transition-colors">
              New Arrivals
            </Link>
            <Link href="/shop?category=men" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 hover:text-primary transition-colors">
              Men
            </Link>
            <Link href="/shop?category=women" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 hover:text-primary transition-colors">
              Women
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 hover:text-primary transition-colors">
              Our Story
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
