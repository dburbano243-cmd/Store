"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import { ChevronDown, ChevronUp, Truck, Clock, RotateCcw, CreditCard } from "lucide-react"
import { fetchProductBySlug, fetchProducts } from "@/lib/products"
import { supabase } from "@/lib/supabase"
import type { MediaFile } from "@/lib/types"
import { useCart } from "@/hooks/useCart"
import ProductCard from "@/components/ProductCard"

interface ProductSettings {
  shipping_info?: string
  delivery_time?: string
  returns_info?: string
  payment_methods?: string
  size_guide_note?: string
}

interface AttributeType {
  id: string
  name: string
  display_name: string
}

async function fetchProductSettings(): Promise<ProductSettings> {
  const { data } = await supabase
    .from("site_settings")
    .select("product_settings")
    .limit(1)
    .single()
  return data?.product_settings || {}
}

async function fetchAttributeTypes(): Promise<AttributeType[]> {
  const { data } = await supabase
    .from("attribute_types")
    .select("id, name, display_name")
  return data || []
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string

  const { addToCart, clearCart } = useCart()
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [showDetails, setShowDetails] = useState(true)

  const { data: product, isLoading } = useSWR(
    slug ? `product-${slug}` : null,
    () => fetchProductBySlug(slug),
    { revalidateOnFocus: true, revalidateIfStale: true, dedupingInterval: 5000 }
  )

  const { data: settings } = useSWR("product-settings", fetchProductSettings)
  const { data: attributeTypes } = useSWR("attribute-types", fetchAttributeTypes)

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
    return [{ src: "/images/placeholder.svg", type: "image" as const, name: "placeholder" }]
  }, [product])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium text-neutral-900 mb-2">Producto no encontrado</h2>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-neutral-900 text-neutral-900 text-sm hover:bg-neutral-900 hover:text-white transition-colors"
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
  const attributes = (product as any).attributes || []

  // Filter only attributes that have selectable values
  const selectableAttributes = attributes.filter((attr: any) =>
    attr.values && Array.isArray(attr.values) && attr.values.length > 0
  )

  // All selected if no selectable attributes OR all have been selected
  const allAttributesSelected = selectableAttributes.length === 0 ||
    selectableAttributes.every((attr: any) => selectedAttributes[attr.id])

  const handleSelectAttribute = (attrId: string, value: string) => {
    setSelectedAttributes(prev => {
      if (prev[attrId] === value) {
        const newState = { ...prev }
        delete newState[attrId]
        return newState
      }
      return { ...prev, [attrId]: value }
    })
  }

  const handleBuy = () => {
    if (isOutOfStock || !allAttributesSelected) return
    clearCart()
    addToCart(product, 1)
    router.push("/checkout")
  }

  const handleAddToCart = () => {
    if (isOutOfStock || !allAttributesSelected) return
    addToCart(product, 1)
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-2">
              {mediaFiles.map((media, index) => (
                <div key={index} className="relative bg-neutral-50 aspect-[3/4]">
                  {media.type === "image" ? (
                    <Image
                      src={media.src || "/images/placeholder.svg"}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 29vw"
                      priority={index < 2}
                      quality={85}
                    />
                  ) : (
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                      <source src={media.src} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {/* SKU */}
              {(product as any).sku && (
                <p className="text-xs text-neutral-400 mb-1">
                  Item: {(product as any).sku}
                </p>
              )}

              {/* Title */}
              <h1 className="text-base font-normal text-neutral-900 uppercase tracking-wide mb-1">
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-base text-neutral-900 mb-6">
                ${basePrice.toLocaleString("es-CO")}
              </p>

              {/* Short Description */}
              {(product as any).short_description && (
                <p className="text-xs text-neutral-500 mb-4">
                  {(product as any).short_description}
                </p>
              )}

              {/* Attributes */}
              {selectableAttributes.length > 0 && (
                <div className="space-y-4 mb-6">
                  {selectableAttributes.map((attr: any) => {
                    const values = attr.values || []
                    const attrType = attributeTypes?.find((t) => t.id === attr.attribute_type_id)
                    const isColor = attrType?.name === "color"

                    return (
                      <div key={attr.id} className="space-y-2">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide">
                          {attrType?.display_name || "Opcion"}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {values.map((val: any, idx: number) => {
                            const valueName = typeof val === "string" ? val : val.name
                            const valueHex = typeof val === "object" ? val.hex : null
                            const valueUnit = typeof val === "object" ? val.unit : null
                            const displayValue = valueUnit ? `${valueName} ${valueUnit}` : valueName
                            const isSelected = selectedAttributes[attr.id] === valueName

                            if (isColor && valueHex) {
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleSelectAttribute(attr.id, valueName)}
                                  title={valueName}
                                  className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected
                                    ? "ring-2 ring-offset-2 ring-neutral-900 border-neutral-900"
                                    : "border-neutral-200 hover:border-neutral-400"
                                    }`}
                                  style={{ backgroundColor: valueHex }}
                                />
                              )
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectAttribute(attr.id, valueName)}
                                className={`min-w-[40px] px-3 py-2 text-sm border transition-all ${isSelected
                                  ? "border-neutral-900 bg-neutral-900 text-white"
                                  : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                                  }`}
                              >
                                {displayValue}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !allAttributesSelected}
                  className={`w-full py-3.5 border text-sm font-medium transition-colors ${isOutOfStock || !allAttributesSelected
                    ? "border-neutral-300 text-neutral-400 cursor-not-allowed"
                    : "border-neutral-900 text-neutral-900 hover:bg-neutral-100"
                    }`}
                >
                  {isOutOfStock ? "AGOTADO" : !allAttributesSelected ? "SELECCIONA UNA OPCION" : "AGREGAR AL CARRITO"}
                </button>
                <button
                  onClick={handleBuy}
                  disabled={isOutOfStock || !allAttributesSelected}
                  className={`w-full py-3.5 text-sm font-medium transition-colors ${isOutOfStock || !allAttributesSelected
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                >
                  COMPRAR AHORA
                </button>
              </div>

              {/* Shipping Info from DB */}
              {settings && (
                <div className="space-y-4 mb-8">
                  {settings.shipping_info && (
                    <div className="flex items-start gap-4">
                      <Truck className="h-5 w-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">{settings.shipping_info}</p>
                    </div>
                  )}
                  {settings.delivery_time && (
                    <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">{settings.delivery_time}</p>
                    </div>
                  )}
                  {settings.returns_info && (
                    <div className="flex items-start gap-4">
                      <RotateCcw className="h-5 w-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">{settings.returns_info}</p>
                    </div>
                  )}
                  {settings.payment_methods && (
                    <div className="flex items-start gap-4">
                      <CreditCard className="h-5 w-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">{settings.payment_methods}</p>
                    </div>
                  )}
                </div>
              )}

              {/* About Product */}
              {product.description && (
                <div className="border-t border-neutral-200">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between py-4 text-sm font-medium text-neutral-900"
                  >
                    <span>SOBRE EL PRODUCTO</span>
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showDetails && (
                    <div className="pb-6">
                      <div
                        className="text-sm text-neutral-600 leading-relaxed prose prose-sm max-w-none [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {otherProducts.length > 0 && (
          <section className="mt-20 border-t border-neutral-200 pt-12">
            <h2 className="text-sm font-medium text-neutral-900 mb-8 uppercase tracking-wide">
              Tambien te puede interesar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
