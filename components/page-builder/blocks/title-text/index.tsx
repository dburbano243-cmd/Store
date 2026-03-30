"use client"

import { cn } from "@/lib/utils"
import type { BlockComponentProps } from "../types"

export interface TitleTextContent {
  title: string
  text: string
  alignment: "left" | "center" | "right"
  titleSize: "sm" | "md" | "lg" | "xl"
}

const defaultContent: TitleTextContent = {
  title: "Titulo de la Seccion",
  text: "Este es el contenido de texto que acompana al titulo. Puedes escribir aqui toda la informacion que necesites compartir con tus visitantes. El texto se puede editar directamente haciendo clic sobre el.",
  alignment: "center",
  titleSize: "lg",
}

const titleSizeClasses = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
  xl: "text-4xl md:text-5xl lg:text-6xl",
}

const alignmentClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export function TitleText({
  content,
  styles,
  isEditable = false,
  isSelected = false,
  onSelect,
  onContentChange,
}: BlockComponentProps) {
  const {
    title = defaultContent.title,
    text = defaultContent.text,
    alignment = defaultContent.alignment,
    titleSize = defaultContent.titleSize,
  } = content as TitleTextContent

  const handleTextChange = (field: string, value: string) => {
    if (onContentChange) {
      onContentChange({ ...content, [field]: value })
    }
  }

  return (
    <section
      className={cn(
        "py-12 md:py-16 lg:py-20",
        alignmentClasses[alignment],
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
        <div
          className={cn(
            "max-w-3xl",
            alignment === "center" && "mx-auto",
            alignment === "right" && "ml-auto"
          )}
        >
          {isEditable ? (
            <>
              <h2
                className={cn(
                  "font-bold mb-6 outline-none focus:ring-2 focus:ring-primary rounded px-2",
                  titleSizeClasses[titleSize]
                )}
                style={{ color: styles?.textColor }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("title", e.currentTarget.textContent || "")}
              >
                {title}
              </h2>
              <div
                className="text-lg leading-relaxed whitespace-pre-line outline-none focus:ring-2 focus:ring-primary rounded px-2"
                style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange("text", e.currentTarget.textContent || "")}
              >
                {text}
              </div>
            </>
          ) : (
            <>
              <h2 
                className={cn("font-bold mb-6", titleSizeClasses[titleSize])}
                style={{ color: styles?.textColor }}
              >
                {title}
              </h2>
              <div 
                className="text-lg leading-relaxed whitespace-pre-line"
                style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined, opacity: styles?.textColor ? 1 : 0.7 }}
              >
                {text}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
