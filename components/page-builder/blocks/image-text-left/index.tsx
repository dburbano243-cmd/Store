"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BlockComponentProps } from "../types"

export interface ImageTextLeftContent {
  title: string
  subtitle: string
  text: string
  image: string
  imageAlt: string
  buttonText: string
  buttonUrl: string
  showButton: boolean
}

const defaultContent: ImageTextLeftContent = {
  title: "Descubre Nuestra Historia",
  subtitle: "Sobre Nosotros",
  text: "Somos una empresa comprometida con la calidad y la excelencia. Cada producto que ofrecemos esta cuidadosamente seleccionado para garantizar la mejor experiencia para nuestros clientes.",
  image: "/images/placeholder.svg",
  imageAlt: "Imagen descriptiva",
  buttonText: "Conocer mas",
  buttonUrl: "/about",
  showButton: true,
}

export function ImageTextLeft({
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
    image = defaultContent.image,
    imageAlt = defaultContent.imageAlt,
    buttonText = defaultContent.buttonText,
    buttonUrl = defaultContent.buttonUrl,
    showButton = defaultContent.showButton,
  } = (content || {}) as Partial<ImageTextLeftContent>

  const handleTextChange = (field: string, value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, [field]: value })
    }
  }

  return (
    <section
      className={cn(
        "py-16 md:py-24",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.className
      )}
      style={{
        backgroundColor: styles?.backgroundColor || "#ffffff",
        color: styles?.textColor,
      }}
      onClick={onSelect}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image - Left */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative element */}
            <div 
              className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl -z-10"
              style={{ backgroundColor: styles?.accentColor || "#3b82f6", opacity: 0.2 }}
            />
          </div>

          {/* Content - Right */}
          <div className="space-y-6">
            {isEditable ? (
              <>
                <span
                  className="text-sm font-semibold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  style={{ color: styles?.accentColor || "#3b82f6" }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange("subtitle", e.currentTarget.textContent || "")}
                >
                  {subtitle}
                </span>
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  style={{ color: styles?.textColor }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextChange("title", e.currentTarget.textContent || "")}
                >
                  {title}
                </h2>
                <p
                  className="text-lg leading-relaxed outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
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
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: styles?.accentColor || "#3b82f6" }}
                >
                  {subtitle}
                </span>
                <h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                  style={{ color: styles?.textColor }}
                >
                  {title}
                </h2>
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
                >
                  {text}
                </p>
              </>
            )}

            {showButton && buttonText && (
              <div className="pt-4">
                {isEditable ? (
                  <Button
                    size="lg"
                    className="px-8"
                    style={{ backgroundColor: styles?.accentColor || "#3b82f6" }}
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
                    className="px-8"
                    style={{ backgroundColor: styles?.accentColor || "#3b82f6" }}
                    asChild
                  >
                    <Link href={buttonUrl}>{buttonText}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
