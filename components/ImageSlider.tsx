"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    src: "/slider/1.webp",
    type: "image" as const,
    title: "Lavable y Reutilizable",
    subtitle: "",
  },
  {
    id: 2,
    src: "/slider/2.mp4",
    type: "video" as const,
    title: "Compacto",
    subtitle: "Pequeño, potente y listo para llevar",
  }
]

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const videoRefs = useRef<HTMLVideoElement[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  // Play only the active slide's video; pause/reset others
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v || slides[i].type !== "video") return
      if (i === currentSlide) {
        // Load and play the current video
        if (v.readyState === 0) {
          v.load()
        }
        v.muted = true
        const p = v.play()
        if (p && typeof p.then === "function") p.catch(() => {})
      } else {
        try {
          v.pause()
          v.currentTime = 0
        } catch {}
      }
    })
  }, [currentSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
        >
          {slide.type === "video" ? (
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el
              }}
              className="w-full h-full object-cover"
              playsInline
              muted
              loop
              preload="none"
              aria-hidden={index === currentSlide ? "false" : "true"}
            >
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : (
            <img
              src={slide.src}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h2>
              <p className="text-xl md:text-2xl">{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
              }`}
          />
        ))}
      </div>
    </div>
  )
}
