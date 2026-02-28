"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { useCart } from "@/hooks/useCart"
import ImageSlider from "@/components/ImageSlider"
import ProductGrid from "@/components/ProductGrid"
import VideoSection from "@/components/VideoSection"
import ContactForm from "@/components/ContactForm"
import Footer from "@/components/Footer"
import CartSidebar from "@/components/CartSidebar"

export default function Home() {
  const { isCartOpen, openCart, closeCart } = useCart()

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartClick={openCart} />

      <main>
        {/* Hero Slider */}
        <section className="pt-16">
          <ImageSlider />
        </section>

        {/* Products Section */}
        <section id="productos" className="py-16 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mis Productos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre mis colecciónes cuidadosamente seleccionada de productos de alta calidad
            </p>
          </div>
          <ProductGrid />
        </section>

        {/* Video Section */}
        <section className="py-16 bg-gray-50">
          <VideoSection />
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-16 px-4 max-w-4xl mx-auto">
          <ContactForm />
        </section>
      </main>

      <Footer />

      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </div>
  )
}
