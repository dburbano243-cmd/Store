"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BlockComponentProps } from "../types"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MasonryItem {
  id: string
  url: string
  type: "image" | "video"
  alt?: string
  aspectRatio?: number
}

interface MasonryEterisContent {
  /** ID del page_component para cargar media desde la DB */
  pageComponentId?: string
  items?: MasonryItem[]
  columns?: number
  gap?: number
  enableLightbox?: boolean
}

/* ------------------------------------------------------------------ */
/*  Lightbox Modal Component                                           */
/* ------------------------------------------------------------------ */

function LightboxModal({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: {
  items: MasonryItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentItem = items[currentIndex]
  const hasMultiple = items.length > 1

  const handlePrev = useCallback(() => {
    onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1)
  }, [currentIndex, items.length, onNavigate])

  const handleNext = useCallback(() => {
    onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0)
  }, [currentIndex, items.length, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          handlePrev()
          break
        case "ArrowRight":
          handleNext()
          break
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, handlePrev, handleNext])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      {/* Content */}
      <div 
        className="relative z-10 flex items-center justify-center w-full h-full p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Media container */}
        <div className="relative max-w-[90vw] max-h-[85vh] animate-in zoom-in-95 duration-200">
          {currentItem.type === "video" ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={currentItem.url}
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onClick={(e) => e.stopPropagation()}
              />
              {/* Video controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ) : (
            <Image
              src={currentItem.url}
              alt={currentItem.alt || "Gallery image"}
              width={1200}
              height={800}
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>

        {/* Counter */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
            {currentIndex + 1} / {items.length}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Masonry Grid Item Component                                        */
/* ------------------------------------------------------------------ */

function MasonryGridItem({
  item,
  onClick,
  style,
}: {
  item: MasonryItem
  onClick: () => void
  style?: React.CSSProperties
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "relative w-full cursor-pointer overflow-hidden rounded-lg group",
        "transition-all duration-300 ease-out",
        isHovered && "shadow-2xl shadow-black/20 scale-[1.02]"
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}

      {item.type === "video" ? (
        <div className="relative aspect-[9/16]">
          <video
            src={item.url}
            className={cn(
              "w-full h-full object-cover rounded-lg transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            muted
            loop
            playsInline
            autoPlay={isHovered}
            onLoadedData={() => setIsLoaded(true)}
          />
          {/* Play indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "p-3 rounded-full bg-black/50 text-white transition-all duration-300",
              isHovered ? "opacity-0 scale-75" : "opacity-100 scale-100"
            )}>
              <Play className="w-6 h-6" />
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="relative"
          style={{ 
            aspectRatio: item.aspectRatio ? `${item.aspectRatio}` : "auto"
          }}
        >
          <Image
            src={item.url}
            alt={item.alt || "Gallery image"}
            fill
            className={cn(
              "object-cover rounded-lg transition-all duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              isHovered && "brightness-90"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      )}

      {/* Hover overlay */}
      <div className={cn(
        "absolute inset-0 rounded-lg transition-opacity duration-300 pointer-events-none",
        "bg-gradient-to-t from-black/30 via-transparent to-transparent",
        isHovered ? "opacity-100" : "opacity-0"
      )} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Default placeholder items shown when no media has been configured */
/* ------------------------------------------------------------------ */

const DEFAULT_ITEMS: MasonryItem[] = [
  { id: "default-1", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 1", aspectRatio: 1 },
  { id: "default-2", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 2", aspectRatio: 0.75 },
  { id: "default-3", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 3", aspectRatio: 1.33 },
  { id: "default-4", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 4", aspectRatio: 1 },
  { id: "default-5", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 5", aspectRatio: 0.75 },
  { id: "default-6", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 6", aspectRatio: 1.33 },
  { id: "default-7", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 7", aspectRatio: 1 },
  { id: "default-8", url: "/images/placeholder.svg", type: "image", alt: "Placeholder 8", aspectRatio: 0.75 },
]

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function MasonryEteris({ content, styles, componentId }: BlockComponentProps) {
  const {
    pageComponentId,
    items = [],
    columns = 4,
    gap = 16,
    enableLightbox = true,
  } = content as MasonryEterisContent

  // Use the component ID that comes as prop (real page_component_id)
  const actualPageComponentId = componentId || pageComponentId

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>(
    items.length > 0 ? items : DEFAULT_ITEMS
  )
  const [isLoading, setIsLoading] = useState(false)
  // Track which pageComponentId we already fetched so we never re-fetch on
  // every render (parent recreates the `items` array literal each time).
  const fetchedForId = useRef<string | null>(null)

  useEffect(() => {
    // No ID → use content.items or defaults, nothing to fetch from DB.
    if (!actualPageComponentId) {
      setMasonryItems(items.length > 0 ? items : DEFAULT_ITEMS)
      return
    }

    // Already fetched for this exact component ID → do not repeat.
    if (fetchedForId.current === actualPageComponentId) {
      return
    }

    let cancelled = false
    fetchedForId.current = actualPageComponentId
    setIsLoading(true)

    fetch(`/api/component-media?pageComponentId=${actualPageComponentId}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        const dbItems: MasonryItem[] = Array.isArray(data.items) ? data.items : []
        if (dbItems.length > 0) {
          // DB has media → use it
          setMasonryItems(dbItems)
        } else if (items.length > 0) {
          // DB empty but content.items has data (configured in builder) → use it
          setMasonryItems(items)
        } else {
          // Nothing anywhere → show defaults
          setMasonryItems(DEFAULT_ITEMS)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMasonryItems(items.length > 0 ? items : DEFAULT_ITEMS)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Intentionally excluding `items` — it's a new array reference on every
    // render and would cause an infinite fetch loop. We only re-fetch when
    // actualPageComponentId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualPageComponentId])

  const handleItemClick = (index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index)
    }
  }

  // Distribute items into columns for masonry effect
  const distributeItems = () => {
    const cols: MasonryItem[][] = Array.from({ length: columns }, () => [])
    masonryItems.forEach((item, index) => {
      cols[index % columns].push(item)
    })
    return cols
  }

  const columnItems = distributeItems()

  // While fetching from DB, show the current items (defaults or content.items)
  // with a subtle loading overlay instead of a full-screen spinner.

  return (
    <>
      <section
        className="relative w-full py-8"
        style={{ backgroundColor: styles?.backgroundColor }}
      >
        <div className="container mx-auto px-4">
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {columnItems.map((column, colIndex) => (
              <div 
                key={colIndex} 
                className="flex flex-col"
                style={{ gap: `${gap}px` }}
              >
                {column.map((item, itemIndex) => {
                  // Calculate global index for lightbox navigation
                  const globalIndex = masonryItems.findIndex(i => i.id === item.id)
                  return (
                    <MasonryGridItem
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(globalIndex)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxModal
          items={masonryItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}

export default MasonryEteris
export type { MasonryItem, MasonryEterisContent }
