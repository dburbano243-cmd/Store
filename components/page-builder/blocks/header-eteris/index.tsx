"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Instagram, Twitter, Facebook, ChevronRight } from "lucide-react"
import type { BlockComponentProps } from "../types"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_SLIDES: EterisSlide[] = [
  {
    id: "default-1",
    title: "Love will tear us apart again",
    text: "The world without photography will be meaningless to us if there is no light.",
    image: "/images/placeholder.svg",
    buttonText: "READ MORE",
    buttonUrl: "#",
  },
  {
    id: "default-2",
    title: "Capture the moment",
    text: "Every photograph tells a story that words cannot express.",
    image: "/images/placeholder.svg",
    buttonText: "DISCOVER",
    buttonUrl: "#",
  },
]

const defaultContent: HeaderEterisContent = {
  slides: DEFAULT_SLIDES,
  autoplay: true,
  autoplaySpeed: 6000,
  showSocials: true,
  instagramUrl: "#",
  twitterUrl: "#",
  facebookUrl: "#",
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function HeaderEteris({
  content,
  styles,
  componentId,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: BlockComponentProps) {
  const {
    slides: contentSlides = defaultContent.slides,
    autoplay = defaultContent.autoplay,
    autoplaySpeed = defaultContent.autoplaySpeed,
    showSocials = defaultContent.showSocials,
    instagramUrl = defaultContent.instagramUrl,
    twitterUrl = defaultContent.twitterUrl,
    facebookUrl = defaultContent.facebookUrl,
  } = content as HeaderEterisContent

  // Slides with images potentially overridden by DB media
  const [slides, setSlides] = useState<EterisSlide[]>(
    contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES
  )
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)

  // Track fetched componentId to avoid re-fetching
  const fetchedForId = useRef<string | null>(null)

  // Fetch slide images from component_media DB and overlay onto content slides
  useEffect(() => {
    if (!componentId) {
      setSlides(contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES)
      return
    }

    if (fetchedForId.current === componentId) return

    let cancelled = false
    fetchedForId.current = componentId

    fetch(`/api/component-media?pageComponentId=${componentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const dbItems: Array<{ id: string; url: string; metadata?: { slideId?: string } }> =
          Array.isArray(data.items) ? data.items : []

        const base = contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES

        if (dbItems.length === 0) {
          setSlides(base)
          return
        }

        // Map DB images to their respective slides by metadata.slideId
        const withImages = base.map((slide) => {
          const match = dbItems.find((item) => item.metadata?.slideId === slide.id)
          return match ? { ...slide, image: match.url } : slide
        })
        setSlides(withImages)
      })
      .catch(() => {
        if (!cancelled) {
          setSlides(contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId])

  // When content.slides changes (e.g. user edits text), sync without re-fetching
  useEffect(() => {
    if (!componentId) {
      setSlides(contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES)
      return
    }
    // Merge content text updates preserving already-fetched images
    setSlides((prev) =>
      (contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES).map((slide) => {
        const existing = prev.find((p) => p.id === slide.id)
        return existing ? { ...slide, image: existing.image } : slide
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentSlides])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }, [slides.length])

  // Autoplay + progress ring — paused while editing
  useEffect(() => {
    if (autoplay && !isEditable && slides.length > 1) {
      const progressInterval = setInterval(() => {
        setProgress((prev) =>
          prev >= 100 ? 0 : prev + 100 / (autoplaySpeed / 50)
        )
      }, 50)
      const slideInterval = setInterval(nextSlide, autoplaySpeed)
      return () => {
        clearInterval(progressInterval)
        clearInterval(slideInterval)
      }
    }
  }, [autoplay, autoplaySpeed, isEditable, nextSlide, slides.length, currentSlide])

  useEffect(() => {
    setProgress(0)
  }, [currentSlide])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  const handleTextChange = (
    slideIndex: number,
    field: "title" | "text" | "buttonText",
    value: string
  ) => {
    if (!onContentChange) return
    const newSlides = [...(contentSlides.length > 0 ? contentSlides : DEFAULT_SLIDES)]
    newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: value }
    onContentChange({ ...content, slides: newSlides })
  }

  const accentColor = styles?.accentColor || "#c9a962"
  const textColor = styles?.textColor || "#ffffff"
  const overlayColor = styles?.overlayColor || "#000000"

  const activeSlide = slides[currentSlide] ?? slides[0]

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      {/* ---- Slides (fade transition) ---- */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.image || "/images/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: overlayColor, opacity: 0.5 }}
          />
        </div>
      ))}

      {/* ---- Social icons — left side ---- */}
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
              className="text-xs uppercase tracking-widest"
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

      {/* ---- Text content + pagination ---- */}
      <div className="absolute inset-0 z-20 flex items-end pb-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          {/* Title */}
          {isEditable ? (
            <h1
              key={`title-${currentSlide}`}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight outline-none focus:ring-2 focus:ring-white/30 rounded px-1"
              style={{ color: textColor }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleTextChange(currentSlide, "title", e.currentTarget.textContent || "")
              }
            >
              {activeSlide?.title}
            </h1>
          ) : (
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{ color: textColor }}
            >
              {activeSlide?.title}
            </h1>
          )}

          {/* Body text */}
          {isEditable ? (
            <p
              key={`text-${currentSlide}`}
              className="text-base md:text-lg mb-6 leading-relaxed outline-none focus:ring-2 focus:ring-white/30 rounded px-1"
              style={{ color: `${textColor}cc` }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleTextChange(currentSlide, "text", e.currentTarget.textContent || "")
              }
            >
              {activeSlide?.text}
            </p>
          ) : (
            <p
              className="text-base md:text-lg mb-6 leading-relaxed"
              style={{ color: `${textColor}cc` }}
            >
              {activeSlide?.text}
            </p>
          )}

          {/* CTA button */}
          {activeSlide?.buttonText && (
            <Link
              href={activeSlide.buttonUrl || "#"}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest transition-colors hover:opacity-80"
              style={{ color: accentColor }}
              onClick={(e) => isEditable && e.preventDefault()}
            >
              {isEditable ? (
                <span
                  key={`btn-${currentSlide}`}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleTextChange(
                      currentSlide,
                      "buttonText",
                      e.currentTarget.textContent || ""
                    )
                  }
                  className="outline-none"
                >
                  {activeSlide.buttonText}
                </span>
              ) : (
                activeSlide.buttonText
              )}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {/* Numbered pagination with progress ring */}
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
                    className="relative flex items-center justify-center w-10 h-10"
                    aria-label={`Ir al slide ${index + 1}`}
                  >
                    <svg
                      className="absolute inset-0 w-10 h-10 -rotate-90"
                      viewBox="0 0 40 40"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="17"
                        fill="none"
                        stroke={isActive ? `${accentColor}30` : "transparent"}
                        strokeWidth="2"
                      />
                      {isActive && (
                        <circle
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                          stroke={accentColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 17}`}
                          strokeDashoffset={`${2 * Math.PI * 17 * (1 - progress / 100)}`}
                          className="transition-all duration-50"
                        />
                      )}
                    </svg>
                    <span
                      className={cn(
                        "relative z-10 text-sm font-medium transition-colors",
                        !isActive && "text-white/50 hover:text-white/80"
                      )}
                      style={{ color: isActive ? accentColor : undefined }}
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
