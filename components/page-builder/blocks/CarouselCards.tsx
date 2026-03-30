"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

export interface CarouselCard {
  id: string
  title: string
  description: string
  image: string
  link?: string
}

export interface CarouselCardsContent {
  title: string
  subtitle: string
  cards: CarouselCard[]
  cardsPerView: number
}

const defaultContent: CarouselCardsContent = {
  title: "Nuestros Servicios",
  subtitle: "Descubre todo lo que podemos ofrecerte",
  cards: [
    {
      id: "card-1",
      title: "Servicio 1",
      description: "Descripción del primer servicio que ofrecemos a nuestros clientes.",
      image: "/images/placeholder.svg",
      link: "#",
    },
    {
      id: "card-2",
      title: "Servicio 2",
      description: "Descripción del segundo servicio con todas sus características.",
      image: "/images/placeholder.svg",
      link: "#",
    },
    {
      id: "card-3",
      title: "Servicio 3",
      description: "Descripción del tercer servicio disponible para ti.",
      image: "/images/placeholder.svg",
      link: "#",
    },
    {
      id: "card-4",
      title: "Servicio 4",
      description: "Descripción del cuarto servicio que ofrecemos.",
      image: "/images/placeholder.svg",
      link: "#",
    },
  ],
  cardsPerView: 3,
}

export function CarouselCards({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: RegisteredComponentProps) {
  const {
    title = defaultContent.title,
    subtitle = defaultContent.subtitle,
    cards = defaultContent.cards,
    cardsPerView = defaultContent.cardsPerView,
  } = content as unknown as CarouselCardsContent

  const [scrollPosition, setScrollPosition] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const cardWidth = 100 / cardsPerView
  const maxScroll = Math.max(0, cards.length - cardsPerView)

  const scroll = (direction: "left" | "right") => {
    setScrollPosition((prev) => {
      if (direction === "left") {
        return Math.max(0, prev - 1)
      } else {
        return Math.min(maxScroll, prev + 1)
      }
    })
  }

  const handleTitleChange = (value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, title: value })
    }
  }

  const handleSubtitleChange = (value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, subtitle: value })
    }
  }

  const handleCardChange = (
    cardIndex: number,
    field: "title" | "description",
    value: string
  ) => {
    if (!onContentChange) return
    const newCards = [...cards]
    newCards[cardIndex] = { ...newCards[cardIndex], [field]: value }
    onContentChange({ ...content, cards: newCards })
  }

  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-20",
        isSelected && "ring-2 ring-primary",
        styles?.className
      )}
      style={{
        backgroundColor: styles?.backgroundColor,
        color: styles?.textColor,
      }}
      onClick={onSelect}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          {isEditable ? (
            <>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 outline-none focus:ring-2 focus:ring-primary rounded px-2"
                style={{ color: styles?.textColor }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTitleChange(e.currentTarget.textContent || "")}
              >
                {title}
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto outline-none focus:ring-2 focus:ring-primary rounded px-2"
                style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleSubtitleChange(e.currentTarget.textContent || "")}
              >
                {subtitle}
              </p>
            </>
          ) : (
            <>
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: styles?.textColor }}
              >
                {title}
              </h2>
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
              >
                {subtitle}
              </p>
            </>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {cards.length > cardsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg hidden md:flex"
                onClick={(e) => {
                  e.stopPropagation()
                  scroll("left")
                }}
                disabled={scrollPosition === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg hidden md:flex"
                onClick={(e) => {
                  e.stopPropagation()
                  scroll("right")
                }}
                disabled={scrollPosition >= maxScroll}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Cards Container */}
          <div className="overflow-hidden" ref={containerRef}>
            <div
              className="flex transition-transform duration-300 ease-in-out gap-4 md:gap-6"
              style={{
                transform: `translateX(-${scrollPosition * cardWidth}%)`,
              }}
            >
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  className="flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow"
                  style={{ width: `calc(${cardWidth}% - 1rem)` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    {isEditable ? (
                      <CardTitle
                        className="outline-none focus:ring-2 focus:ring-primary rounded px-1"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleCardChange(index, "title", e.currentTarget.textContent || "")
                        }
                      >
                        {card.title}
                      </CardTitle>
                    ) : (
                      <CardTitle>{card.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isEditable ? (
                      <CardDescription
                        className="outline-none focus:ring-2 focus:ring-primary rounded px-1"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleCardChange(index, "description", e.currentTarget.textContent || "")
                        }
                      >
                        {card.description}
                      </CardDescription>
                    ) : (
                      <CardDescription>{card.description}</CardDescription>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mobile Dots */}
          {cards.length > cardsPerView && (
            <div className="flex justify-center gap-2 mt-6 md:hidden">
              {Array.from({ length: maxScroll + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setScrollPosition(index)
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === scrollPosition ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  aria-label={`Ir a grupo ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
