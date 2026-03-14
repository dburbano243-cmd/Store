"use client"

import type React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import type { Product, MediaFile } from "@/lib/types"
import { useCart } from "@/hooks/useCart"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openCart } = useCart()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Intersection Observer to detect visibility
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

  // Play/pause video based on visibility
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
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
              {"Tu navegador no soporta videos."}
            </video>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}

          {/* Carousel navigation - only show if more than 1 file */}
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

              {/* Dot indicators */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                {mediaFiles.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(index)
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/50"
                      }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Overlay with info and buttons */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-white drop-shadow-lg">{product.name}</h3>
              <button
                onClick={handleAddToCart}
                className="flex items-center bg-gray-900 text-white justify-center backdrop-blur-sm px-3 py-1.5 rounded-md hover:bg-black/60 transition-colors"
                aria-label="Agregar al carrito"
              >
                <ShoppingCart className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                {product.priceWithDiscount < product.price && (
                  <span className="text-[10px] line-through text-white/70 drop-shadow-lg">
                    ${product.price.toLocaleString("es-CO")}
                  </span>
                )}
                <p className="text-xs font-bold text-white drop-shadow-lg">${product.priceWithDiscount.toLocaleString("es-CO")}</p>
              </div>
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
