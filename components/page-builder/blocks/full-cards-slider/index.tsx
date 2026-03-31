"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { BlockComponentProps } from "../types"

export interface FullCardSlide {
  id: string
  image: string
  subtitle: string
  title: string
  buttonText: string
  pageUrl: string
}

export interface FullCardsSliderContent {
  slides: FullCardSlide[]
  autoplay: boolean
  autoplaySpeed: number
  showArrows: boolean
  cardsPerView: number
}

const defaultContent: FullCardsSliderContent = {
  slides: [
    {
      id: "slide-1",
      image: "/images/placeholder.svg",
      subtitle: "SMART AND USUAL",
      title: "PHOTO DESIGN",
      buttonText: "SEE MORE",
      pageUrl: "/",
    },
    {
      id: "slide-2",
      image: "/images/placeholder.svg",
      subtitle: "LIGHT AND COLOUR",
      title: "INTERIOR DESIGN",
      buttonText: "SEE MORE",
      pageUrl: "/",
    },
    {
      id: "slide-3",
      image: "/images/placeholder.svg",
      subtitle: "PASSION AND ART",
      title: "PHOTOGRAPHY",
      buttonText: "SEE MORE",
      pageUrl: "/",
    },
    {
      id: "slide-4",
      image: "/images/placeholder.svg",
      subtitle: "CREATIVE VISION",
      title: "BRANDING",
      buttonText: "SEE MORE",
      pageUrl: "/",
    },
  ],
  autoplay: true,
  autoplaySpeed: 4000,
  showArrows: true,
  cardsPerView: 3,
}

export function FullCardsSlider({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: BlockComponentProps) {
  const {
    slides = defaultContent.slides,
    autoplay = defaultContent.autoplay,
    autoplaySpeed = defaultContent.autoplaySpeed,
    showArrows = defaultContent.showArrows,
    cardsPerView = defaultContent.cardsPerView,
  } = content as FullCardsSliderContent

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  const maxIndex = Math.max(0, slides.length - cardsPerView)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Autoplay
  useEffect(() => {
    if (autoplay && !isEditable && slides.length > cardsPerView && !isDragging) {
      autoplayRef.current = setInterval(nextSlide, autoplaySpeed)
      return () => {
        if (autoplayRef.current) clearInterval(autoplayRef.current)
      }
    }
  }, [autoplay, autoplaySpeed, isEditable, nextSlide, slides.length, cardsPerView, isDragging])

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isEditable) return
    setIsDragging(true)
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
    if (autoplayRef.current) clearInterval(autoplayRef.current)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const threshold = 100
    if (translateX > threshold) {
      prevSlide()
    } else if (translateX < -threshold) {
      nextSlide()
    }
    setTranslateX(0)
  }

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
          "relative w-full h-[70vh] min-h-[500px] bg-muted flex items-center justify-center",
          isSelected && "ring-2 ring-primary",
          styles?.className
        )}
        onClick={onSelect}
      >
        <p className="text-muted-foreground">Agrega slides para mostrar el carrusel</p>
      </div>
    )
  }

  const cardWidth = 100 / cardsPerView
  const gap = 0

  return (
    <div
      className={cn(
        "relative w-full h-[70vh] min-h-[500px] overflow-hidden group",
        isSelected && "ring-2 ring-primary",
        styles?.className
      )}
      style={{
        backgroundColor: styles?.backgroundColor || "#000000",
      }}
      onClick={onSelect}
    >
      {/* Cards Container */}
      <div
        ref={containerRef}
        className={cn(
          "flex h-full transition-transform ease-out select-none",
          isDragging ? "duration-0" : "duration-500"
        )}
        style={{
          transform: `translateX(calc(-${currentIndex * cardWidth}% + ${translateX}px))`,
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {slides.map((slide, index) => {
          const CardWrapper = isEditable ? "div" : Link
          const wrapperProps = isEditable 
            ? { onClick: (e: React.MouseEvent) => e.stopPropagation() }
            : { href: slide.pageUrl || "/" }

          return (
            <div
              key={slide.id}
              className="relative flex-shrink-0 h-full"
              style={{ width: `${cardWidth}%` }}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index < cardsPerView}
                draggable={false}
              />
              
              {/* Overlay */}
              <div 
                className="absolute inset-0" 
                style={{ 
                  backgroundColor: styles?.overlayColor || "#000000", 
                  opacity: parseFloat(String(styles?.overlayOpacity)) || 0.3 
                }}
              />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-start pt-16 md:pt-20 px-6 text-center">
                {isEditable ? (
                  <>
                    <span
                      className="text-xs md:text-sm tracking-[0.2em] mb-2 outline-none focus:ring-2 focus:ring-white/50 rounded px-2"
                      style={{ color: styles?.subtitleColor || "#d4a574" }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleTextChange(index, "subtitle", e.currentTarget.textContent || "")
                      }
                    >
                      {slide.subtitle}
                    </span>
                    <h2
                      className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 outline-none focus:ring-2 focus:ring-white/50 rounded px-2"
                      style={{ color: styles?.titleColor || "#ffffff" }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleTextChange(index, "title", e.currentTarget.textContent || "")
                      }
                    >
                      {slide.title}
                    </h2>
                    <button
                      className="px-6 py-2 text-xs md:text-sm tracking-wider transition-colors"
                      style={{
                        border: `1px solid ${styles?.buttonBorderColor || "#d4a574"}`,
                        color: styles?.buttonTextColor || "#ffffff",
                        backgroundColor: styles?.buttonBackgroundColor || "transparent",
                      }}
                      onClick={(e) => e.preventDefault()}
                    >
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
                    </button>
                  </>
                ) : (
                  <CardWrapper {...(wrapperProps as React.ComponentPropsWithoutRef<typeof Link>)} className="flex flex-col items-center">
                    <span
                      className="text-xs md:text-sm tracking-[0.2em] mb-2"
                      style={{ color: styles?.subtitleColor || "#d4a574" }}
                    >
                      {slide.subtitle}
                    </span>
                    <h2
                      className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6"
                      style={{ color: styles?.titleColor || "#ffffff" }}
                    >
                      {slide.title}
                    </h2>
                    <span
                      className="px-6 py-2 text-xs md:text-sm tracking-wider transition-all hover:scale-105"
                      style={{
                        border: `1px solid ${styles?.buttonBorderColor || "#d4a574"}`,
                        color: styles?.buttonTextColor || "#ffffff",
                        backgroundColor: styles?.buttonBackgroundColor || "transparent",
                      }}
                    >
                      {slide.buttonText}
                    </span>
                  </CardWrapper>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > cardsPerView && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            style={{
              backgroundColor: styles?.arrowBackgroundColor || "rgba(0,0,0,0.3)",
              color: styles?.arrowColor || "#ffffff",
            }}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            style={{
              backgroundColor: styles?.arrowBackgroundColor || "rgba(0,0,0,0.3)",
              color: styles?.arrowColor || "#ffffff",
            }}
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots/Indicators */}
      {slides.length > cardsPerView && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "w-6" 
                  : "hover:opacity-100"
              )}
              style={{
                backgroundColor: index === currentIndex 
                  ? (styles?.dotActiveColor || "#ffffff")
                  : (styles?.dotColor || "rgba(255,255,255,0.5)"),
              }}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
