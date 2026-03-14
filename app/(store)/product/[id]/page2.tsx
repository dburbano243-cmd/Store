"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import { Minus, Plus, ChevronDown, ChevronUp, Bookmark } from "lucide-react"
import { fetchProductBySlug, fetchProducts } from "@/lib/products"
import type { MediaFile } from "@/lib/types"
import { useCart } from "@/hooks/useCart"
import Navbar from "@/components/Navbar"
import CartSidebar from "@/components/CartSidebar"
import ProductCard from "@/components/ProductCard"

export default function ProductPage2() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string

  const { addToCart, clearCart } = useCart()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [customQty, setCustomQty] = useState(1)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const { data: product, isLoading } = useSWR(
    slug ? `product-${slug}` : null,
    () => fetchProductBySlug(slug),
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000,
    }
  )

  const { data: allProducts } = useSWR('products', fetchProducts, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 7200000,
    refreshInterval: 0,
  })

  const otherProducts = useMemo(() => {
    if (!allProducts || !product) return []
    return allProducts.filter(p => p.id !== product.id).slice(0, 4)
  }, [allProducts, product])

  const mediaFiles = useMemo<MediaFile[]>(() => {
    if (!product) return []

    if (product.media && product.media.length > 0) {
      return product.media.map((m) => ({
        src: m.url ?? "",
        type: m.media_type === "video" ? "video" as const : "image" as const,
        name: m.file_name ?? m.storage_path,
      }))
    }

    return [
      {
        src: "/placeholder.svg?height=400&width=300",
        type: "image" as const,
        name: "placeholder",
      },
    ]
  }, [product])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            <p className="text-sm text-neutral-500">Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium text-neutral-900 mb-2">Producto no encontrado</h2>
            <p className="text-neutral-500 mb-4">El producto que buscas no existe o fue eliminado.</p>
            <button 
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-neutral-900 text-neutral-900 text-sm hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  const basePrice = product.price || 0
  const stock = product.stock || 0
  const isOutOfStock = stock <= 0

  function bestDiscountTotalForQuantity(q: number) {
    const discounts = (product as any).discounts ?? []
    const candidates: number[] = []
    for (const d of discounts) {
      if (!d || !d.is_active) continue
      const units = d.metadata?.units ? Number(d.metadata.units) : null
      const amount = Number(d.discount_amount ?? 0)
      if (!units || !amount) continue
      if (units === q) {
        candidates.push(amount * q)
      } else if (units === 3 && q >= 3) {
        candidates.push(amount * q)
      }
    }
    if (candidates.length === 0) return 0
    return Math.max(...candidates)
  }

  const currentOriginalTotal = basePrice * customQty
  const currentDiscountTotal = bestDiscountTotalForQuantity(customQty)
  const currentFinalTotal = Math.max(0, currentOriginalTotal - currentDiscountTotal)

  const features = product.features
  const discountPercentage = product.priceWithDiscount < product.price
    ? Math.round((1 - product.priceWithDiscount / product.price) * 100)
    : 0

  const incrementQty = () => {
    if (customQty >= stock) return
    setCustomQty(customQty + 1)
  }

  const decrementQty = () => {
    if (customQty <= 1) return
    setCustomQty(customQty - 1)
  }

  const handleBuyOffer = () => {
    if (isOutOfStock || customQty > stock) return
    clearCart()
    const pricePerItem = currentFinalTotal / customQty
    addToCart(product, customQty, pricePerItem, currentMediaIndex)
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <button onClick={() => router.push("/")} className="hover:text-neutral-900 transition-colors">
            Inicio
          </button>
          <span>/</span>
          <span className="text-neutral-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Gallery - Left Side */}
          <div className="lg:col-span-7">
            {/* Stacked Images */}
            <div className="space-y-4">
              {mediaFiles.map((media, index) => (
                <div 
                  key={index} 
                  className="relative bg-neutral-100 cursor-pointer"
                  onClick={() => setCurrentMediaIndex(index)}
                >
                  {media.type === "image" ? (
                    <Image
                      src={media.src || "/placeholder.svg"}
                      alt={`${product.name} - ${index + 1}`}
                      width={800}
                      height={1000}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 58vw"
                      priority={index === 0}
                      quality={85}
                    />
                  ) : (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-auto object-cover"
                    >
                      <source src={media.src} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {/* Available Quantities */}
              {stock > 0 && (
                <div className="flex items-center gap-3 text-sm text-neutral-600 mb-4">
                  {[1, 2, 3].filter(q => q <= stock).map((q, i, arr) => (
                    <span key={q}>
                      <button 
                        onClick={() => setCustomQty(q)}
                        className={`hover:text-neutral-900 ${customQty === q ? 'text-neutral-900 font-medium' : ''}`}
                      >
                        {q}
                      </button>
                      {i < arr.length - 1 && <span className="ml-3">|</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Title Row */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-lg font-normal text-neutral-900 leading-tight">
                  {product.name}
                </h1>
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="flex-shrink-0 mt-0.5"
                  aria-label="Guardar"
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-neutral-900' : ''} text-neutral-900`} />
                </button>
              </div>



              {/* Description */}
              {product.description && (
                <p className="text-sm text-neutral-600 leading-relaxed mb-8 max-w-md">
                  {product.description}
                </p>
              )}

              {/* Prices */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Precio</p>
                  <p className="text-2xl font-normal text-neutral-900">
                    ${product.priceWithDiscount.toLocaleString("es-CO")}
                    {customQty > 1 && (
                      <span className="text-sm text-neutral-500 ml-1">/ unidad</span>
                    )}
                  </p>
                </div>
                {discountPercentage > 0 && (
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Precio normal</p>
                    <p className="text-2xl font-normal text-neutral-400 line-through">
                      ${product.price.toLocaleString("es-CO")}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <p className="text-sm text-neutral-500 mb-3">Selecciona cantidad</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].filter(q => q <= stock).map((q) => (
                      <button
                        key={q}
                        onClick={() => setCustomQty(q)}
                        className={`px-5 py-2.5 text-sm border transition-colors ${
                          customQty === q
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-300 text-neutral-700 hover:border-neutral-900'
                        }`}
                      >
                        {q} {q === 1 ? 'unidad' : 'unidades'}
                      </button>
                    ))}
                    {stock > 3 && (
                      <div className="flex items-center border border-neutral-300">
                        <button
                          onClick={decrementQty}
                          disabled={customQty <= 1}
                          className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm">{customQty}</span>
                        <button
                          onClick={incrementQty}
                          disabled={customQty >= stock}
                          className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total */}
              {customQty > 1 && (
                <div className="mb-6 p-4 bg-neutral-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Total ({customQty} unidades)</span>
                    <span className="text-xl font-medium text-neutral-900">
                      ${currentFinalTotal.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Bag Button */}
              <button
                onClick={handleBuyOffer}
                disabled={isOutOfStock}
                className="w-full py-4 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed mb-6"
              >
                {isOutOfStock ? "Agotado" : "Agregar al carrito"}
              </button>

              {/* Stock indicator */}
              {stock > 0 && stock <= 10 && (
                <p className="text-sm text-neutral-500 mb-6 text-center">
                  Solo quedan {stock} unidades disponibles
                </p>
              )}

              {/* Details Accordion */}
              {features && features.length > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between py-3 text-sm font-medium text-neutral-900"
                  >
                    <span>Detalles</span>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {showDetails && (
                    <div className="pb-4 space-y-2">
                      {features.map((feature, index) => (
                        <p key={index} className="text-sm text-neutral-600 leading-relaxed">
                          • {feature}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {otherProducts.length > 0 && (
          <section className="mt-20 mb-12">
            <h2 className="text-lg font-medium text-neutral-900 mb-8">Tambien te puede interesar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
