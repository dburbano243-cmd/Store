"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  image: string
  buttonText?: string
  buttonUrl?: string
}

export interface HeroSliderContent {
  slides: HeroSlide[]
  autoplay: boolean
  autoplaySpeed: number
  showArrows: boolean
  showDots: boolean
}

const defaultContent: HeroSliderContent = {
  slides: [
    {
      id: "slide-1",
      title: "Bienvenido a nuestra tienda",
      subtitle: "Descubre los mejores productos con ofertas exclusivas",
      image: "/images/placeholder.svg",
      buttonText: "Ver productos",
      buttonUrl: "/productos",
    },
    {
      id: "slide-2",
      title: "Nueva colección",
      subtitle: "Explora las últimas tendencias de la temporada",
      image: "/images/placeholder.svg",
      buttonText: "Explorar",
      buttonUrl: "/coleccion",
    },
  ],
  autoplay: true,
  autoplaySpeed: 5000,
  showArrows: true,
  showDots: true,
}

export function HeroSlider({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: RegisteredComponentProps) {
  const {
    slides = defaultContent.slides,
    autoplay = defaultContent.autoplay,
    autoplaySpeed = defaultContent.autoplaySpeed,
    showArrows = defaultContent.showArrows,
    showDots = defaultContent.showDots,
  } = content as unknown as HeroSliderContent

  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (autoplay && !isEditable && slides.length > 1) {
      const interval = setInterval(nextSlide, autoplaySpeed)
      return () => clearInterval(interval)
    }
  }, [autoplay, autoplaySpeed, isEditable, nextSlide, slides.length])

  const handleTextChange = (
    slideIndex: number,
    field: "title" | "subtitle" | "buttonText",
    value: string
  ) => {
    if (!onContentChange) return
    const newSlides = [...slides]
    newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: value }
    onContentChange({ ...content, slides: newSlides })
  }

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-muted flex items-center justify-center",
          isSelected && "ring-2 ring-primary",
          styles?.className
        )}
        onClick={onSelect}
      >
        <p className="text-muted-foreground">Agrega slides para mostrar el slider</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group",
        isSelected && "ring-2 ring-primary",
        styles?.className
      )}
      style={{
        backgroundColor: styles?.backgroundColor,
      }}
      onClick={onSelect}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0"
          >
            {/* Background Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            
            {/* Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: styles?.overlayColor || "#000000", opacity: 0.4 } as React.CSSProperties}
            />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {isEditable ? (
                <>
                  <h1
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-4xl outline-none focus:ring-2 focus:ring-white/50 rounded px-2"
                    style={{ color: styles?.textColor || "#ffffff" }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleTextChange(index, "title", e.currentTarget.textContent || "")
                    }
                  >
                    {slide.title}
                  </h1>
                  <p
                    className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl outline-none focus:ring-2 focus:ring-white/50 rounded px-2"
                    style={{ color: styles?.textColor ? `${styles.textColor}e6` : "rgba(255,255,255,0.9)" }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleTextChange(index, "subtitle", e.currentTarget.textContent || "")
                    }
                  >
                    {slide.subtitle}
                  </p>
                </>
              ) : (
                <>
                  <h1 
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-4xl"
                    style={{ color: styles?.textColor || "#ffffff" }}
                  >
                    {slide.title}
                  </h1>
                  <p 
                    className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl"
                    style={{ color: styles?.textColor ? `${styles.textColor}e6` : "rgba(255,255,255,0.9)" }}
                  >
                    {slide.subtitle}
                  </p>
                </>
              )}
              
              {slide.buttonText && (
                <Button
                  size="lg"
                  className="text-lg px-8"
                  style={{ 
                    backgroundColor: styles?.accentColor || "#ffffff", 
                    color: styles?.accentColor ? "#ffffff" : "#000000" 
                  } as React.CSSProperties}
                  onClick={(e) => {
                    if (isEditable) {
                      e.preventDefault()
                    }
                  }}
                >
                  {isEditable ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleTextChange(index, "buttonText", e.currentTarget.textContent || "")
                      }
                      className="outline-none"
                    >
                      {slide.buttonText}
                    </span>
                  ) : (
                    slide.buttonText
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentSlide(index)
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === currentSlide ? "bg-white" : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
