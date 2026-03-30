"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Instagram, Twitter, Facebook, ChevronRight } from "lucide-react"
import type { ComponentStyles, EditableComponentProps } from "@/lib/types/page-builder.types"

export interface EterisSlide {
  id: string
  title: string
  text: string
  image: string
  buttonText?: string
  buttonUrl?: string
}

export interface HeaderEterisContent {
  slides: EterisSlide[]
  autoplay: boolean
  autoplaySpeed: number
  showSocials: boolean
  instagramUrl: string
  twitterUrl: string
  facebookUrl: string
}

const defaultContent: HeaderEterisContent = {
  slides: [
    {
      id: "slide-1",
      title: "Love will tear us apart again",
      text: "The world without photography will be meaningless to us if there is no light.",
      image: "/images/placeholder.svg",
      buttonText: "READ MORE",
      buttonUrl: "#",
    },
    {
      id: "slide-2",
      title: "Capture the moment",
      text: "Every photograph tells a story that words cannot express.",
      image: "/images/placeholder.svg",
      buttonText: "DISCOVER",
      buttonUrl: "#",
    },
  ],
  autoplay: true,
  autoplaySpeed: 6000,
  showSocials: true,
  instagramUrl: "#",
  twitterUrl: "#",
  facebookUrl: "#",
}

interface HeaderEterisProps extends EditableComponentProps {
  content: Record<string, unknown>
  styles: ComponentStyles
}

export function HeaderEteris({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: HeaderEterisProps) {
  const {
    slides = defaultContent.slides,
    autoplay = defaultContent.autoplay,
    autoplaySpeed = defaultContent.autoplaySpeed,
    showSocials = defaultContent.showSocials,
    instagramUrl = defaultContent.instagramUrl,
    twitterUrl = defaultContent.twitterUrl,
    facebookUrl = defaultContent.facebookUrl,
  } = content as unknown as HeaderEterisContent

  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }, [slides.length])

  // Autoplay and progress animation
  useEffect(() => {
    if (autoplay && !isEditable && slides.length > 1) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0
          }
          return prev + (100 / (autoplaySpeed / 50))
        })
      }, 50)

      const slideInterval = setInterval(nextSlide, autoplaySpeed)

      return () => {
        clearInterval(progressInterval)
        clearInterval(slideInterval)
      }
    }
  }, [autoplay, autoplaySpeed, isEditable, nextSlide, slides.length, currentSlide])

  // Reset progress when slide changes manually
  useEffect(() => {
    setProgress(0)
  }, [currentSlide])

  const handleTextChange = (
    slideIndex: number,
    field: "title" | "text" | "buttonText",
    value: string
  ) => {
    if (!onContentChange) return
    const newSlides = [...slides]
    newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: value }
    onContentChange({ ...content, slides: newSlides })
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  const accentColor = styles?.accentColor || "#c9a962"
  const textColor = styles?.textColor || "#ffffff"
  const overlayColor = styles?.overlayColor || "#000000"

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full h-screen bg-neutral-900 flex items-center justify-center",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={onSelect}
      >
        <p className="text-white/50">Agrega slides para mostrar el header</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      {/* Slides with fade transition */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
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
            style={{ backgroundColor: overlayColor, opacity: 0.5 } as React.CSSProperties }
          />
        </div>
      ))}

      {/* Social Media - Left Side */}
      {showSocials && (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-6">
          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors"
            onClick={(e) => isEditable && e.preventDefault()}
          >
            <Instagram className="w-4 h-4" />
            <span 
              className="text-xs uppercase tracking-widest writing-mode-vertical"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Instagram
            </span>
          </Link>
          
          <div className="w-px h-8 bg-white/30" />
          
          <Link
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors"
            onClick={(e) => isEditable && e.preventDefault()}
          >
            <Twitter className="w-4 h-4" />
            <span 
              className="text-xs uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Twitter
            </span>
          </Link>
          
          <div className="w-px h-8 bg-white/30" />
          
          <Link
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors"
            onClick={(e) => isEditable && e.preventDefault()}
          >
            <Facebook className="w-4 h-4" />
            <span 
              className="text-xs uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Facebook
            </span>
          </Link>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-end pb-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          {isEditable ? (
            <>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight outline-none focus:ring-2 focus:ring-white/30 rounded px-1"
                style={{ color: textColor }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleTextChange(currentSlide, "title", e.currentTarget.textContent || "")
                }
              >
                {slides[currentSlide].title}
              </h1>
              <p
                className="text-base md:text-lg mb-6 leading-relaxed outline-none focus:ring-2 focus:ring-white/30 rounded px-1"
                style={{ color: `${textColor}cc` }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleTextChange(currentSlide, "text", e.currentTarget.textContent || "")
                }
              >
                {slides[currentSlide].text}
              </p>
            </>
          ) : (
            <>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                style={{ color: textColor }}
              >
                {slides[currentSlide].title}
              </h1>
              <p
                className="text-base md:text-lg mb-6 leading-relaxed"
                style={{ color: `${textColor}cc` }}
              >
                {slides[currentSlide].text}
              </p>
            </>
          )}

          {/* Read More Button */}
          {slides[currentSlide].buttonText && (
            <Link
              href={slides[currentSlide].buttonUrl || "#"}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest transition-colors hover:opacity-80"
              style={{ color: accentColor } as React.CSSProperties }
              onClick={(e) => isEditable && e.preventDefault()}
            >
              {isEditable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleTextChange(currentSlide, "buttonText", e.currentTarget.textContent || "")
                  }
                  className="outline-none"
                >
                  {slides[currentSlide].buttonText}
                </span>
              ) : (
                slides[currentSlide].buttonText
              )}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {/* Numbered Pagination */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 mt-10">
              {slides.map((_, index) => {
                const isActive = index === currentSlide
                const displayNumber = String(index + 1).padStart(2, "0")
                
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      goToSlide(index)
                    }}
                    className="relative flex items-center justify-center w-10 h-10 group"
                    aria-label={`Ir al slide ${index + 1}`}
                  >
                    {/* Ring SVG with progress */}
                    <svg
                      className="absolute inset-0 w-10 h-10 -rotate-90"
                      viewBox="0 0 40 40"
                    >
                      {/* Background ring */}
                      <circle
                        cx="20"
                        cy="20"
                        r="17"
                        fill="none"
                        stroke={isActive ? `${accentColor}30` : "transparent"}
                        strokeWidth="2"
                      />
                      {/* Progress ring */}
                      {isActive && (
                        <circle
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                          stroke={accentColor as string}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 17}`}
                          strokeDashoffset={`${2 * Math.PI * 17 * (1 - progress / 100)}`}
                          className="transition-all duration-50"
                        />
                      ) }
                    </svg>
                    
                    {/* Number */}
                    <span
                      className={cn(
                        "relative z-10 text-sm font-medium transition-colors",
                        isActive ? "" : "text-white/50 hover:text-white/80"
                      )}
                      style={{ color: isActive ? accentColor : undefined } as React.CSSProperties }
                    >
                      {displayNumber}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
