"use client"

import { useState } from "react"
import React from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CartSidebar from "@/components/CartSidebar"

export default function PagesGroupLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main className="pt-16">{children}</main>
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
