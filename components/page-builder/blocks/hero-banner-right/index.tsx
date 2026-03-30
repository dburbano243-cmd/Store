"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BlockComponentProps } from "../types"

export interface HeroBannerRightContent {
  title: string
  subtitle: string
  text: string
  backgroundImage: string
  overlayOpacity: number
  buttonText: string
  buttonUrl: string
  showButton: boolean
  secondaryButtonText: string
  secondaryButtonUrl: string
  showSecondaryButton: boolean
}

const defaultContent: HeroBannerRightContent = {
  title: "Productos de Calidad Premium",
  subtitle: "Nueva Coleccion",
  text: "Encuentra lo mejor para ti en nuestra seleccion exclusiva. Envios rapidos y atencion personalizada.",
  backgroundImage: "/images/placeholder.svg",
  overlayOpacity: 50,
  buttonText: "Comprar Ahora",
  buttonUrl: "/productos",
  showButton: true,
  secondaryButtonText: "Ver catalogo",
  secondaryButtonUrl: "/catalogo",
  showSecondaryButton: true,
}

export function HeroBannerRight({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: BlockComponentProps) {
  const {
    title = defaultContent.title,
    subtitle = defaultContent.subtitle,
    text = defaultContent.text,
    backgroundImage = defaultContent.backgroundImage,
    overlayOpacity = defaultContent.overlayOpacity,
    buttonText = defaultContent.buttonText,
    buttonUrl = defaultContent.buttonUrl,
    showButton = defaultContent.showButton,
    secondaryButtonText = defaultContent.secondaryButtonText,
    secondaryButtonUrl = defaultContent.secondaryButtonUrl,
    showSecondaryButton = defaultContent.showSecondaryButton,
  } = (content || {}) as Partial<HeroBannerRightContent>

  const handleTextChange = (field: string, value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, [field]: value })
    }
  }

  return (
    <section
      className={cn(
        "relative min-h-[80vh] flex items-center",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.className
      )}
      onClick={onSelect}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay - gradient from right */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to left, ${styles?.overlayColor || "#000000"}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')} 0%, transparent 100%)`,
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: styles?.overlayColor || "#000000",
            opacity: (overlayOpacity / 100) * 0.3
          }}
        />
      </div>

      {/* Content - Right aligned */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl ml-auto text-right">
          {isEditable ? (
            <>
              <span
                className="inline-block text-sm font-semibold uppercase tracking-wider mb-4 outline-none focus:ring-2 focus:ring-primary rounded px-1"
                style={{ color: styles?.accentColor || "#10b981" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("subtitle", e.currentTarget.textContent || "")}
              >
                {subtitle}
              </span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 outline-none focus:ring-2 focus:ring-primary rounded px-1"
                style={{ color: styles?.textColor || "#ffffff" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("title", e.currentTarget.textContent || "")}
              >
                {title}
              </h1>
              <p
                className="text-lg md:text-xl leading-relaxed mb-8 outline-none focus:ring-2 focus:ring-primary rounded px-1"
                style={{ color: styles?.textColor ? `${styles.textColor}e6` : "rgba(255,255,255,0.9)" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("text", e.currentTarget.textContent || "")}
              >
                {text}
              </p>
            </>
          ) : (
            <>
              <span 
                className="inline-block text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: styles?.accentColor || "#10b981" }}
              >
                {subtitle}
              </span>
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ color: styles?.textColor || "#ffffff" }}
              >
                {title}
              </h1>
              <p 
                className="text-lg md:text-xl leading-relaxed mb-8"
                style={{ color: styles?.textColor ? `${styles.textColor}e6` : "rgba(255,255,255,0.9)" }}
              >
                {text}
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-4 justify-end">
            {showButton && buttonText && (
              isEditable ? (
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  style={{ backgroundColor: styles?.accentColor || "#10b981" }}
                  onClick={(e) => e.preventDefault()}
                >
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("buttonText", e.currentTarget.textContent || "")}
                    className="outline-none"
                  >
                    {buttonText}
                  </span>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  style={{ backgroundColor: styles?.accentColor || "#10b981" }}
                  asChild
                >
                  <Link href={buttonUrl}>{buttonText}</Link>
                </Button>
              )
            )}

            {showSecondaryButton && secondaryButtonText && (
              isEditable ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg hover:opacity-80"
                  style={{ 
                    borderColor: styles?.textColor || "#ffffff", 
                    color: styles?.textColor || "#ffffff",
                    backgroundColor: "transparent"
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange("secondaryButtonText", e.currentTarget.textContent || "")}
                    className="outline-none"
                  >
                    {secondaryButtonText}
                  </span>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg hover:opacity-80"
                  style={{ 
                    borderColor: styles?.textColor || "#ffffff", 
                    color: styles?.textColor || "#ffffff",
                    backgroundColor: "transparent"
                  }}
                  asChild
                >
                  <Link href={secondaryButtonUrl}>{secondaryButtonText}</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
