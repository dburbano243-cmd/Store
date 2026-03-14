"use client"

import { useEffect, useRef, useState } from "react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

const videos = [
  {
    id: 1,
    type: "video" as const,
    title: "Diseño y Materiales de Alta Calidad",
    description: "Fabricado con polímero de alta adherencia, resistente al uso continuo y totalmente lavable para máxima durabilidad.",
    thumbnail: "/slider/thumbnail.png",
    src: "/slider/1.webp",
  },
  {
    id: 2,
    type: "video" as const,
    title: "Modo de Uso Inteligente",
    description: "Deslízalo suavemente sobre la superficie, enjuágalo con agua y reutilízalo. Rápido, práctico y siempre listo en tu bolsillo.",
    thumbnail: "/slider/thumbnail.png",
    src: "/slider/2.mp4",
  },
  {
    id: 3,
    type: "video" as const,
    title: "Resultados Reales en Segundos",
    description: "Elimina pelusa, polvo y cabello al instante en ropa, muebles y vehículos, dejando un acabado limpio y profesional.",
    thumbnail: "/slider/thumbnail.png",
    src: "/slider/3.webp",
  },
]

export default function VideoSection() {
  const videoRefs = useRef<HTMLVideoElement[]>([])
  const [posters, setPosters] = useState<string[] | null>(null)

  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' fill='%239ca3af' font-size='24' dominant-baseline='middle' text-anchor='middle'>No preview</text></svg>")}`

  useEffect(() => {
    // initialize posters state from videos list (will be replaced with fallback on error)
    if (!posters) setPosters(videos.map((v) => v.thumbnail))

    // preload poster images and replace with fallback on error to avoid 404s
    videos.forEach((video, idx) => {
      const img = new window.Image()
      img.onload = () => {
        // loaded ok, nothing to do
      }
      img.onerror = () => {
        setPosters((prev) => {
          if (!prev) return videos.map((v) => v.thumbnail)
          const next = [...prev]
          next[idx] = fallback
          return next
        })
      }
      img.src = video.thumbnail
    })

    // Use IntersectionObserver to only play videos when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          const videoIndex = videoRefs.current.indexOf(video)
          if (videoIndex === -1 || videos[videoIndex].type !== "video") return
          
          if (entry.isIntersecting) {
            video.muted = true
            video.loop = true
            video.play().catch(() => { })
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
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Videos Demostrativos</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre más sobre mis productos a través de estos videos informativos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center">
              <AspectRatio ratio={9 / 16}>
                {video.type === "video" ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[index] = el
                    }}
                    src={video.src}
                    poster={posters ? posters[index] : video.thumbnail}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{video.title}</h3>
              <p className="text-gray-600 text-sm">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
