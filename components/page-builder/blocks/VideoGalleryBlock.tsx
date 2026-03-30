"use client"

import { useEffect, useRef, useState } from "react"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"
import { dataProvider, type GalleryVideo } from "@/lib/repositories"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"

interface VideoGalleryContent {
  title?: string
  subtitle?: string
  columns?: number
  aspectRatio?: string
  showTitle?: boolean
}

/**
 * VideoGalleryBlock - Bloque del builder para galería de videos
 * 
 * Usa el dataProvider para obtener videos, lo que permite
 * cambiar de proveedor de datos sin modificar este componente.
 */
export function VideoGalleryBlock({
  content,
  styles,
  isEditable = false,
  isSelected = false,
}: RegisteredComponentProps) {
  const [videos, setVideos] = useState<GalleryVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [posters, setPosters] = useState<string[]>([])
  const videoRefs = useRef<HTMLVideoElement[]>([])

  const {
    title = "Videos Demostrativos",
    subtitle = "Descubre más sobre nuestros productos a través de estos videos informativos",
    columns = 3,
    aspectRatio = "9/16",
    showTitle = true,
  } = content as VideoGalleryContent

  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' fill='%239ca3af' font-size='24' dominant-baseline='middle' text-anchor='middle'>No preview</text></svg>"
  )}`

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true)
        const data = await dataProvider.videoGallery.getActiveVideos()
        setVideos(data)
        setPosters(data.map((v) => v.thumbnail))
      } catch (err) {
        console.error("Error loading videos:", err)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  // Preload poster images and replace with fallback on error
  useEffect(() => {
    videos.forEach((video, idx) => {
      const img = new window.Image()
      img.onerror = () => {
        setPosters((prev) => {
          const next = [...prev]
          next[idx] = fallback
          return next
        })
      }
      img.src = video.thumbnail
    })
  }, [videos, fallback])

  // IntersectionObserver to play videos when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          const videoIndex = videoRefs.current.indexOf(video)
          if (videoIndex === -1) return

          if (entry.isIntersecting) {
            video.muted = true
            video.loop = true
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    videoRefs.current.forEach((v) => {
      if (v) observer.observe(v)
    })

    return () => observer.disconnect()
  }, [videos])

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  const [ratioW, ratioH] = aspectRatio.split("/").map(Number)
  const ratio = ratioW && ratioH ? ratioW / ratioH : 9 / 16

  return (
    <section
      className={cn("py-16", styles?.padding)}
      style={{ backgroundColor: styles?.backgroundColor || "#f8fafc" }}
    >
      <div className="max-w-7xl mx-auto px-4">
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
          <div className={cn("grid gap-8", gridCols)}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
              >
                <div className="bg-muted animate-pulse" style={{ aspectRatio: ratio }} />
                <div className="p-6 space-y-2">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay videos disponibles.</p>
          </div>
        ) : (
          <div className={cn("grid gap-8", gridCols)}>
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center">
                  <AspectRatio ratio={ratio}>
                    {video.type === "video" ? (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[index] = el
                        }}
                        src={video.src}
                        poster={posters[index] || video.thumbnail}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        loop
                        preload="none"
                      />
                    ) : (
                      <img
                        src={video.src}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </AspectRatio>
                </div>

                <div className="p-6">
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: styles?.textColor }}
                  >
                    {video.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
                  >
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
