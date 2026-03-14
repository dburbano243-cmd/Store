"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

export interface ImageTextContent {
  title: string
  text: string
  image: string
  imageAlt: string
  imagePosition: "left" | "right"
  buttonText?: string
  buttonUrl?: string
  showButton: boolean
}

const defaultContent: ImageTextContent = {
  title: "Sobre Nosotros",
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  image: "/placeholder.svg?height=400&width=600",
  imageAlt: "Imagen descriptiva",
  imagePosition: "left",
  buttonText: "Saber más",
  buttonUrl: "#",
  showButton: true,
}

export function ImageText({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: RegisteredComponentProps) {
  const {
    title = defaultContent.title,
    text = defaultContent.text,
    image = defaultContent.image,
    imageAlt = defaultContent.imageAlt,
    imagePosition = defaultContent.imagePosition,
    buttonText = defaultContent.buttonText,
    buttonUrl = defaultContent.buttonUrl,
    showButton = defaultContent.showButton,
  } = content as ImageTextContent

  const handleTextChange = (field: string, value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, [field]: value })
    }
  }

  const ImageComponent = (
    <div className="relative aspect-[4/3] md:aspect-square lg:aspect-[4/3] rounded-lg overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        className="object-cover"
      />
    </div>
  )

  const TextComponent = (
    <div className="flex flex-col justify-center space-y-4">
      {isEditable ? (
        <>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold outline-none focus:ring-2 focus:ring-primary rounded px-2"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange("title", e.currentTarget.textContent || "")}
          >
            {title}
          </h2>
          <div
            className="text-muted-foreground leading-relaxed whitespace-pre-line outline-none focus:ring-2 focus:ring-primary rounded px-2"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange("text", e.currentTarget.textContent || "")}
          >
            {text}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            {title}
          </h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {text}
          </div>
        </>
      )}

      {showButton && buttonText && (
        <div className="pt-4">
          <Button
            size="lg"
            onClick={(e) => {
              if (isEditable) {
                e.preventDefault()
              }
            }}
          >
            {isEditable ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleTextChange("buttonText", e.currentTarget.textContent || "")
                }
                className="outline-none"
              >
                {buttonText}
              </span>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      )}
    </div>
  )

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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {imagePosition === "left" ? (
            <>
              {ImageComponent}
              {TextComponent}
            </>
          ) : (
            <>
              {TextComponent}
              {ImageComponent}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
