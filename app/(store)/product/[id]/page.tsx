"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import { Star, Truck, Check } from "lucide-react"
import { fetchProductBySlug } from "@/lib/products"
import type { MediaFile } from "@/lib/types"
import { useCart } from "@/hooks/useCart"
import CheckoutModal from "@/components/CheckoutModal"
import Navbar from "@/components/Navbar"
import CartSidebar from "@/components/CartSidebar"
import imagePayments from "../../../../public/payments.png"

export default function ProductPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const params = useParams()
  const slug = params.id as string

  const { addToCart, clearCart } = useCart()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [selectedOffer, setSelectedOffer] = useState(1)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const { data: product, isLoading } = useSWR(
    slug ? `product-${slug}` : null,
    () => fetchProductBySlug(slug)
  )

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando producto...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    )
  }

  const basePrice = product.price || 0

  // Compute best discount total for a given quantity based on product.discounts metadata.units
  function bestDiscountTotalForQuantity(q: number) {
    const discounts = (product as any).discounts ?? []
    const candidates: number[] = []
    for (const d of discounts) {
      if (!d || !d.is_active) continue
      if (d.currency_code !== "COP") continue
      const units = d.metadata?.units ? Number(d.metadata.units) : null
      const amount = Number(d.discount_amount ?? 0)
      if (!units || !amount) continue
      if (units === q) {
        candidates.push(amount * q)
      } else if (units === 3 && q >= 3) {
        // For metadata.units === 3 apply for any q >= 3
        candidates.push(amount * q)
      }
    }
    if (candidates.length === 0) return 0
    return Math.max(...candidates)
  }

  const offers = [1, 2, 3].map((q) => {
    const original = basePrice * q
    const discountTotal = bestDiscountTotalForQuantity(q)
    const price = Math.max(0, original - discountTotal)
    return {
      id: q,
      quantity: q,
      label: `Lleva ${q}`,
      price,
      originalPrice: original,
      badge: q === 2 ? "Mas Popular" : q === 3 ? "El Mejor" : "",
    }
  })

  const features = product.features

  const handleBuyOffer = () => {
    const selectedOfferData = offers.find((offer) => offer.id === selectedOffer)
    if (selectedOfferData) {
      clearCart()
      const pricePerItem = selectedOfferData.price / selectedOfferData.quantity
      addToCart(product, selectedOfferData.quantity, pricePerItem, currentMediaIndex)
      setIsCheckoutOpen(true)
    }
  }

  const currentMedia = mediaFiles[currentMediaIndex]

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <div className="bg-lime-500 text-white py-4 mt-5 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          <div className="flex items-center mx-4">
            <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Envio gratis para 5 unidades o mas!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Star className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Oferta por tiempo limitado!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Envio gratis para 5 unidades o mas!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Star className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Oferta por tiempo limitado!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Envio gratis para 5 unidades o mas!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Star className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Oferta por tiempo limitado!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Envio gratis para 5 unidades o mas!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Star className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Oferta por tiempo limitado!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Truck className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Envio gratis para 5 unidades o mas!"}</span>
          </div>
          <div className="flex items-center mx-4">
            <Star className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-semibold">{"Oferta por tiempo limitado!"}</span>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        <div className="md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {/* Product Images - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="flex flex-col-reverse md:flex-row md:gap-4">
              {/* Thumbnail Carousel */}
              <div className="flex gap-2 w-full scrollbar-hide overflow-x-auto md:flex-col md:w-auto md:overflow-y-auto md:max-h-[400px] mt-4 md:mt-0">
                {mediaFiles.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-16 h-16 aspect-square rounded-lg overflow-hidden border-2 relative flex-shrink-0 ${
                      index === currentMediaIndex ? "border-lime-500" : "border-gray-200"
                    }`}
                  >
                    {media.type === "image" ? (
                      <Image
                        src={media.src || "/placeholder.svg"}
                        alt=""
                        fill
                        className="object-cover w-full h-full"
                        sizes="64px"
                      />
                    ) : (
                      <video className="object-cover w-full h-full" style={{ aspectRatio: "1/1" }}>
                        <source src={media.src} type="video/mp4" />
                      </video>
                    )}
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 flex justify-center">
                <div className="aspect-square max-w-[400px] w-full bg-lime-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {currentMedia?.type === "image" ? (
                    <Image
                      src={currentMedia.src || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    />
                  ) : currentMedia?.type === "video" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="object-cover w-full h-full"
                      style={{ aspectRatio: "1/1" }}
                    >
                      <source src={currentMedia.src} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full bg-lime-200 flex items-center justify-center">
                      <span className="text-lime-600">Sin imagen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="mt-6 md:mt-0 lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name.toUpperCase()}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.floor(product.stars) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.stars} ({product.reviews} Resenas)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                {product.priceWithoutDiscount > product.price && (
                  <span className="text-lg line-through text-gray-400">
                    $ {product.priceWithoutDiscount.toLocaleString("es-CO")}
                  </span>
                )}
                <span className="text-2xl font-bold text-lime-600">$ {product.price.toLocaleString("es-CO")}</span>
                {product.priceWithoutDiscount > product.price && (
                  <span className="bg-lime-500 text-white text-xs px-2 py-1 rounded">
                    Ahorra $ {(product.priceWithoutDiscount - product.price).toLocaleString("es-CO")}
                  </span>
                )}
              </div>

              {/* Shipping */}
              <div className="flex items-center gap-2 bg-lime-50 p-3 rounded-lg mb-4">
                <Truck className="h-4 w-4 text-lime-600" />
                <span className="text-sm font-medium text-lime-700">{"Se envia en 180 minutos!"}</span>
              </div>

              {/* Features */}
              {features && features.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-lime-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offers Section */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-center mb-4">LLEVA MAS, AHORRA MAS</h2>
              <div className="flex flex-col gap-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer.id)}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedOffer === offer.id ? "border-lime-500 bg-lime-50" : "border-gray-200"
                    }`}
                  >
                    {offer.badge && (
                      <div className="absolute -top-2 left-4 px-2 py-1 text-xs font-bold rounded bg-lime-500 text-white">
                        {offer.badge}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-lime-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={mediaFiles[1]?.src || mediaFiles[0]?.src || "/placeholder.svg"}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{offer.label}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through text-gray-400">$ {offer.originalPrice}</span>
                          <span className="font-bold text-lime-600">$ {offer.price}</span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                          selectedOffer === offer.id ? "border-lime-500 bg-lime-500" : "border-gray-300"
                        }`}
                      >
                        {selectedOffer === offer.id && (
                          <div className="w-full h-full bg-white rounded-full scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuyOffer}
              className="w-full bg-lime-500 text-white font-bold py-4 rounded-lg mb-4 hover:bg-lime-600 transition-colors"
            >
              {"Comprar Ahora!"}
            </button>

            {/* Payment Methods */}
            <div className="flex w-full h-auto items-center justify-center">
              <Image
                src={imagePayments}
                alt="Metodos de pago"
                width={200}
                height={50}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
