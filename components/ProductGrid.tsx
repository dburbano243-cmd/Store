"use client"

import useSWR from "swr"
import ProductCard from "./ProductCard"
import { fetchProductsForListing } from "@/lib/products"

export default function ProductGrid() {
  // Cache de 2 horas configurado en SWRProvider - usando version limitada para ahorrar ancho de banda
  const { data: products, error, isLoading } = useSWR("products-listing", fetchProductsForListing)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Error al cargar los productos. Intenta de nuevo.</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay productos disponibles.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
