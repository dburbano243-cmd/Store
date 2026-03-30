"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

export interface ImageTextRightContent {
  title: string
  subtitle: string
  text: string
  image: string
  imageAlt: string
  buttonText: string
  buttonUrl: string
  showButton: boolean
}

const defaultContent: ImageTextRightContent = {
  title: "Calidad Garantizada",
  subtitle: "Nuestro Compromiso",
  text: "Nos esforzamos por ofrecer productos de la más alta calidad. Cada artículo pasa por rigurosos controles para asegurar que cumple con nuestros estándares de excelencia.",
  image: "/images/placeholder.svg",
  imageAlt: "Imagen descriptiva",
  buttonText: "Ver productos",
  buttonUrl: "/productos",
  showButton: true,
}

export function ImageTextRight({
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
    text = defaultContent.text,
    image = defaultContent.image,
    imageAlt = defaultContent.imageAlt,
    buttonText = defaultContent.buttonText,
    buttonUrl = defaultContent.buttonUrl,
    showButton = defaultContent.showButton,
  } = (content || {}) as Partial<ImageTextRightContent>

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
        backgroundColor: styles?.backgroundColor || "#f8fafc",
        color: styles?.textColor,
      }}
      onClick={onSelect}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content - Left */}
          <div className="space-y-6 order-2 lg:order-1">
            {isEditable ? (
              <>
                <span
                  className="text-sm font-semibold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  style={{ color: styles?.accentColor || "#3b82f6" } as React.CSSProperties}
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
                  style={{ color: styles?.accentColor || "#3b82f6" } as React.CSSProperties}
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
                    style={{ backgroundColor: styles?.accentColor || "#3b82f6" } as React.CSSProperties}
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
                    style={{ backgroundColor: styles?.accentColor || "#3b82f6" } as React.CSSProperties}
                    asChild
                  >
                    <Link href={buttonUrl}>{buttonText}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Image - Right */}
          <div className="relative order-1 lg:order-2">
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
              className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl -z-10"
              style={{ backgroundColor: styles?.accentColor || "#3b82f6", opacity: 0.2 } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
