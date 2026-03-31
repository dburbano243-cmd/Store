"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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

  // Usar el ID del componente que viene como prop (es el page_component_id real)
  const actualPageComponentId = componentId || pageComponentId

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>(items)
  const [isLoading, setIsLoading] = useState(false)

  // Load items from database using page_component_id
  useEffect(() => {
    if (actualPageComponentId) {
      setIsLoading(true)
      fetch(`/api/component-media?pageComponentId=${actualPageComponentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setMasonryItems(data.items)
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setMasonryItems(items)
    }
  }, [actualPageComponentId, items])

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

  if (isLoading) {
    return (
      <section
        className="relative w-full py-8"
        style={{ backgroundColor: styles?.backgroundColor }}
      >
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    )
  }

  // Empty state
  if (masonryItems.length === 0) {
    return (
      <section
        className="relative w-full py-8"
        style={{ backgroundColor: styles?.backgroundColor }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm">
              No hay imagenes o videos. Agrega contenido desde el editor.
            </p>
          </div>
        </div>
      </section>
    )
  }

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
