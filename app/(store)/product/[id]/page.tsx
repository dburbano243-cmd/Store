"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import { Star, Truck, Check, Minus, Plus, Package, ChevronLeft, ChevronRight, ShieldCheck, RotateCcw, CreditCard, Heart } from "lucide-react"
import { fetchProductBySlug, fetchProducts } from "@/lib/products"
import type { MediaFile, Product } from "@/lib/types"
import { useCart } from "@/hooks/useCart"
import Navbar from "@/components/Navbar"
import CartSidebar from "@/components/CartSidebar"
import ProductCard from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import imagePayments from "../../../../public/payments.png"

export default function ProductPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string

  const { addToCart, clearCart } = useCart()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [selectedOffer, setSelectedOffer] = useState(1)
  const [customQty, setCustomQty] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Producto individual NO se cachea (contiene stock actualizado)
  const { data: product, isLoading } = useSWR(
    slug ? `product-${slug}` : null,
    () => fetchProductBySlug(slug),
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Solo 5 segundos de deduplicacion
    }
  )

  // Lista de productos - CACHE AGRESIVO 
  // Solo carga una vez y usa cache por 2 horas, no revalida
  const { data: allProducts } = useSWR('products', fetchProducts, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 7200000, // 2 horas - no hace fetch duplicado
    refreshInterval: 0, // Nunca refrescar automaticamente
  })

  const otherProducts = useMemo(() => {
    if (!allProducts || !product) return []
    return allProducts.filter(p => p.id !== product.id)
  }, [allProducts, product])

  const [carouselIndex, setCarouselIndex] = useState(0)
  const productsPerView = 4
  const maxIndex = Math.max(0, otherProducts.length - productsPerView)

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
      <div className="min-h-screen bg-background">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium text-foreground mb-2">Producto no encontrado</h2>
            <p className="text-muted-foreground mb-4">El producto que buscas no existe o fue eliminado.</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
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

  const offers = [1, 2, 3]
    .filter(q => q <= stock)
    .map((q) => {
      const original = basePrice * q
      const discountTotal = bestDiscountTotalForQuantity(q)
      const price = Math.max(0, original - discountTotal)
      const savings = original - price
      return {
        id: q,
        quantity: q,
        label: q === 1 ? "1 unidad" : `${q} unidades`,
        price,
        originalPrice: original,
        savings,
        badge: q === 2 ? "Popular" : q === 3 ? "Mejor oferta" : "",
      }
    })

  const currentOriginalTotal = basePrice * customQty
  const currentDiscountTotal = bestDiscountTotalForQuantity(customQty)
  const currentFinalTotal = Math.max(0, currentOriginalTotal - currentDiscountTotal)
  const currentSavings = currentOriginalTotal - currentFinalTotal

  const features = product.features

  const handleSelectOffer = (qty: number) => {
    if (qty > stock) return
    setSelectedOffer(qty)
    setCustomQty(qty)
  }

  const incrementQty = () => {
    if (customQty >= stock) return
    const newQty = customQty + 1
    setCustomQty(newQty)
    setSelectedOffer(newQty <= 3 ? newQty : 0)
  }

  const decrementQty = () => {
    if (customQty <= 1) return
    const newQty = customQty - 1
    setCustomQty(newQty)
    setSelectedOffer(newQty <= 3 ? newQty : 0)
  }

  const handleBuyOffer = () => {
    if (isOutOfStock || customQty > stock) return
    clearCart()
    const pricePerItem = currentFinalTotal / customQty
    addToCart(product, customQty, pricePerItem, currentMediaIndex)
    router.push("/checkout")
  }

  const currentMedia = mediaFiles[currentMediaIndex]
  const discountPercentage = product.priceWithDiscount < product.price
    ? Math.round((1 - product.priceWithDiscount / product.price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={() => router.push("/")} className="hover:text-foreground transition-colors">
            Inicio
          </button>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Section */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden mb-4">
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 left-4 z-10 bg-foreground text-background">
                    -{discountPercentage}%
                  </Badge>
                )}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Agregar a favoritos"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                </button>

                {currentMedia?.type === "image" ? (
                  <Image
                    src={currentMedia.src || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain "
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                ) : currentMedia?.type === "video" ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-contain w-full h-full"
                  >
                    <source src={currentMedia.src} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">Sin imagen</span>
                  </div>
                )}

                {/* Navigation arrows */}
                {mediaFiles.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentMediaIndex(prev => prev === 0 ? mediaFiles.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentMediaIndex(prev => prev === mediaFiles.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {mediaFiles.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-3 pb-2 scrollbar-hide">
                  {mediaFiles.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${index === currentMediaIndex
                        ? "ring-2 ring-foreground ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                        }`}
                    >
                      {media.type === "image" ? (
                        <Image
                          src={media.src || "/placeholder.svg"}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <video className="object-cover w-full h-full">
                          <source src={media.src} type="video/mp4" />
                        </video>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {/* Title & Rating */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4 text-balance leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.floor(product.stars)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                          }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-foreground">{product.stars}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} resenas)
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-muted/50 rounded-2xl p-6 mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">
                    ${product.priceWithDiscount.toLocaleString("es-CO")}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.price.toLocaleString("es-CO")}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-sm text-emerald-600 font-medium">
                    Ahorras ${(product.price - product.priceWithDiscount).toLocaleString("es-CO")}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2 h-2 rounded-full ${stock > 10 ? "bg-emerald-500" : stock > 0 ? "bg-amber-500" : "bg-red-500"}`} />
                {stock > 10 ? (
                  <span className="text-sm text-emerald-600 font-medium">En stock</span>
                ) : stock > 0 ? (
                  <span className="text-sm text-amber-600 font-medium">Solo quedan {stock} unidades</span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">Agotado</span>
                )}
              </div>

              {/* Quantity Offers */}
              {offers.length > 1 && !isOutOfStock && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">Elige tu cantidad</h3>
                  <div className="space-y-2">
                    {offers.map((offer) => (
                      <button
                        key={offer.id}
                        onClick={() => handleSelectOffer(offer.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedOffer === offer.id
                          ? "border-foreground bg-muted/50"
                          : "border-border hover:border-muted-foreground"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOffer === offer.id ? "border-foreground" : "border-muted-foreground"
                            }`}>
                            {selectedOffer === offer.id && (
                              <div className="w-3 h-3 bg-foreground rounded-full" />
                            )}
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-foreground">{offer.label}</span>
                            {offer.badge && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {offer.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-foreground">
                            ${offer.price.toLocaleString("es-CO")}
                          </span>
                          {offer.savings > 0 && (
                            <p className="text-xs text-emerald-600">
                              Ahorras ${offer.savings.toLocaleString("es-CO")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Quantity */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground">Cantidad personalizada</h3>
                    {customQty >= stock && (
                      <span className="text-xs text-amber-600">Maximo disponible</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={decrementQty}
                        disabled={customQty <= 1}
                        className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-14 text-center text-lg font-semibold text-foreground">{customQty}</span>
                      <button
                        type="button"
                        onClick={incrementQty}
                        disabled={customQty >= stock}
                        className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 text-right">
                      {currentSavings > 0 && (
                        <span className="text-sm line-through text-muted-foreground block">
                          ${currentOriginalTotal.toLocaleString("es-CO")}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-foreground">
                        ${currentFinalTotal.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buy Button */}
              <Button
                onClick={handleBuyOffer}
                disabled={isOutOfStock}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl mb-6"
              >
                {isOutOfStock ? "Producto agotado" : "Comprar ahora"}
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Envio rapido</p>
                    <p className="text-xs text-muted-foreground">En 180 minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Compra segura</p>
                    <p className="text-xs text-muted-foreground">100% protegido</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <RotateCcw className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Devoluciones</p>
                    <p className="text-xs text-muted-foreground">30 dias</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Pago flexible</p>
                    <p className="text-xs text-muted-foreground">Multiples metodos</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center justify-center">
                <Image
                  src={imagePayments}
                  alt="Metodos de pago aceptados"
                  width={200}
                  height={50}
                  className="object-contain opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Features */}
        {features && features.length > 0 && (
          <section className="mt-16">
            <Separator className="mb-8" />
            <h2 className="text-xl font-semibold text-foreground mb-6">Caracteristicas del producto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                  <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-background" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other Products */}
        {otherProducts.length > 0 && (
          <section className="mt-16 mb-8">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Tambien te puede interesar</h2>
              {otherProducts.length > productsPerView && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                    disabled={carouselIndex === 0}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                    disabled={carouselIndex >= maxIndex}
                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-4"
                style={{ transform: `translateX(-${carouselIndex * (100 / productsPerView + 4)}%)` }}
              >
                {otherProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
