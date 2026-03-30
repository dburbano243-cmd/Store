"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingCart, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"
import type { Product, MediaFile } from "@/lib/types"
import { dataProvider } from "@/lib/repositories"
import { useCart } from "@/hooks/useCart"
import { cn } from "@/lib/utils"

interface ProductGridContent {
  title?: string
  subtitle?: string
  columns?: number
  limit?: number
  showTitle?: boolean
}

/**
 * ProductGridBlock - Bloque del builder para mostrar productos
 * 
 * Usa el dataProvider para obtener productos, lo que permite
 * cambiar de proveedor de datos sin modificar este componente.
 */
export function ProductGridBlock({
  content,
  styles,
  isEditable = false,
  isSelected = false,
}: RegisteredComponentProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    title = "Mis Productos",
    subtitle = "Descubre nuestra colección cuidadosamente seleccionada de productos de alta calidad",
    columns = 4,
    limit = 8,
    showTitle = true,
  } = content as ProductGridContent

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await dataProvider.products.getAllForListing()
        setProducts(limit ? data.slice(0, limit) : data)
        setError(null)
      } catch (err) {
        console.error("Error loading products:", err)
        setError("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [limit])

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <section
      className={cn("py-16 px-4", styles?.padding)}
      style={{ backgroundColor: styles?.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: styles?.textColor }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="max-w-2xl mx-auto"
                style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-8 ${gridCols}">
            {Array.from({ length: limit || 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
              >
                <div className="bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay productos disponibles.</p>
          </div>
        ) : (
          <div className={cn("grid gap-8", gridCols)}>
            {products.map((product) => (
              <ProductCardBlock key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// =============================================
// PRODUCT CARD SUBCOMPONENT
// =============================================

interface ProductCardBlockProps {
  product: Product
}

function ProductCardBlock({ product }: ProductCardBlockProps) {
  const { addToCart, openCart } = useCart()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isVisible, currentIndex])

  const mediaFiles = useMemo<MediaFile[]>(() => {
    if (product.media && product.media.length > 0) {
      return product.media.map((m) => ({
        src: m.url ?? "",
        type: m.media_type === "video" ? ("video" as const) : ("image" as const),
        name: m.file_name ?? m.storage_path,
      }))
    }

    return [
      {
        src: "/images/placeholder.svg",
        type: "image" as const,
        name: "placeholder",
      },
    ]
  }, [product.media])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
    openCart()
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
    router.push("/checkout")
  }

  const handleCardClick = () => {
    const slug = product.slug || product.id
    router.push(`/product/${slug}`)
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % mediaFiles.length)
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length)
  }

  const currentMedia = mediaFiles[currentIndex]

  return (
    <div ref={cardRef}>
      <div
        onClick={handleCardClick}
        className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="relative" style={{ aspectRatio: "3/4" }}>
          {currentMedia?.type === "image" ? (
            <Image
              src={currentMedia.src || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              quality={70}
              loading="lazy"
            />
          ) : currentMedia?.type === "video" ? (
            <video
              ref={videoRef}
              key={currentMedia.src}
              loop
              muted
              playsInline
              preload="none"
              className="w-full h-full object-cover rounded-lg"
            >
              <source src={currentMedia.src} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}

          {mediaFiles.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 rounded-full backdrop-blur-sm transition-all z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1 rounded-full backdrop-blur-sm transition-all z-10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-3 w-3" />
              </button>

              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                {mediaFiles.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(index)
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-white drop-shadow-lg">
                {product.name}
              </h3>
              <button
                onClick={handleAddToCart}
                className="flex items-center bg-gray-900 text-white justify-center backdrop-blur-sm px-3 py-1.5 rounded-md hover:bg-black/60 transition-colors"
                aria-label="Agregar al carrito"
              >
                <ShoppingCart className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-xs font-bold text-white drop-shadow-lg">
                ${product.price.toLocaleString("es-CO")}
              </p>
              <button
                onClick={handleBuyNow}
                className="text-xs flex items-center justify-center backdrop-blur-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-black/60 transition-colors"
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
