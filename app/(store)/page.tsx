import React from "react"
import ProductGrid from "@/components/ProductGrid"

export default function StorePage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Tienda</h1>
      <ProductGrid />
    </div>
  )
}
