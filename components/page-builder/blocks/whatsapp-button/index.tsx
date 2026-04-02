"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, MessageCircle } from "lucide-react"
import type { BlockComponentProps } from "../types"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WhatsappButtonContent {
  phoneNumber?: string
  defaultMessage?: string
  tooltipText?: string
  position?: "bottom-right" | "bottom-left"
  showOnMobile?: boolean
  showOnDesktop?: boolean
  pulseAnimation?: boolean
  buttonColor?: string
}

/* ------------------------------------------------------------------ */
/*  WhatsApp SVG Icon (official brand mark)                           */
/* ------------------------------------------------------------------ */

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.352.633 4.633 1.835 6.633L2.667 29.333l6.9-1.807A13.29 13.29 0 0 0 16.003 29.333C23.37 29.333 29.333 23.363 29.333 16c0-7.363-5.963-13.333-13.33-13.333zm0 24.267a11.01 11.01 0 0 1-5.618-1.537l-.4-.237-4.095 1.072 1.09-3.986-.262-.41A10.987 10.987 0 0 1 5.002 16c0-6.066 4.934-10.999 11-10.999C22.069 5.001 27 9.934 27 16c0 6.066-4.934 11-10.997 11zm6.03-8.238c-.33-.165-1.951-.963-2.254-1.072-.304-.11-.524-.165-.745.165s-.854 1.072-1.048 1.291c-.193.22-.385.248-.715.083-.33-.165-1.393-.513-2.654-1.637-.98-.875-1.643-1.956-1.835-2.286-.193-.33-.021-.508.144-.672.149-.147.33-.385.495-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.028-.578-.083-.165-.745-1.798-1.02-2.462-.27-.648-.543-.56-.745-.57l-.633-.011a1.213 1.213 0 0 0-.88.413c-.303.33-1.156 1.13-1.156 2.756s1.183 3.196 1.348 3.416c.165.22 2.328 3.556 5.643 4.988.789.34 1.404.543 1.884.695.791.252 1.512.217 2.082.132.635-.095 1.951-.798 2.227-1.569.275-.77.275-1.43.193-1.568-.083-.138-.303-.22-.633-.385z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function WhatsappButton({
  content,
  isEditable = false,
  isSelected = false,
  onSelect,
}: BlockComponentProps) {
  const {
    phoneNumber = "",
    defaultMessage = "Hola, me gustaria obtener mas informacion.",
    tooltipText = "Chatea con nosotros",
    position = "bottom-right",
    showOnMobile = true,
    showOnDesktop = true,
    pulseAnimation = true,
    buttonColor = "#25D366",
  } = content as WhatsappButtonContent

  const [showTooltip, setShowTooltip] = useState(false)

  // Build the WhatsApp deep-link URL
  const encodedMessage = encodeURIComponent(defaultMessage || "")
  const cleanPhone = (phoneNumber || "").replace(/\D/g, "")
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`

  const isRight = position === "bottom-right"

  const visibilityClasses = cn(
    !showOnMobile && "hidden sm:flex",
    !showOnDesktop && "flex sm:hidden",
    showOnMobile && showOnDesktop && "flex"
  )

  // In edit mode render an in-flow placeholder so the block is visible/selectable
  if (isEditable) {
    return (
      <div
        className={cn(
          "relative w-full py-6 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isSelected
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50"
        )}
        onClick={onSelect}
        role="button"
        aria-label="Boton WhatsApp (preview)"
      >
        {/* Preview badge */}
        <div className="flex items-center gap-3 pointer-events-none select-none">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md text-white shrink-0"
            style={{ backgroundColor: buttonColor }}
          >
            <WhatsAppIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Boton flotante de WhatsApp
            </p>
            <p className="text-xs text-muted-foreground">
              {cleanPhone
                ? `+${cleanPhone}`
                : "Configura el numero en el panel lateral"}
              {" · "}
              {isRight ? "Inferior derecha" : "Inferior izquierda"}
            </p>
          </div>
        </div>

        {/* Warning if no phone configured */}
        {!cleanPhone && (
          <div className="absolute top-2 right-3 flex items-center gap-1 text-amber-500 text-xs">
            <MessageCircle className="w-3 h-3" />
            Sin numero
          </div>
        )}
      </div>
    )
  }

  // Production: render fixed floating button
  return (
    <div
      className={cn(
        "fixed bottom-6 z-50",
        isRight ? "right-6" : "left-6",
        visibilityClasses
      )}
      role="complementary"
      aria-label="Contacto por WhatsApp"
    >
      {/* Tooltip */}
      {showTooltip && tooltipText && (
        <div
          className={cn(
            "absolute bottom-14 mb-1 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md pointer-events-none",
            isRight ? "right-0" : "left-0"
          )}
          role="tooltip"
        >
          {tooltipText}
          {/* Arrow */}
          <span
            className={cn(
              "absolute top-full border-4 border-transparent",
              isRight
                ? "right-4 border-t-foreground"
                : "left-4 border-t-foreground"
            )}
          />
        </div>
      )}

      {/* Pulse ring */}
      {pulseAnimation && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: buttonColor }}
          aria-hidden="true"
        />
      )}

      {/* Main button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 text-white"
        style={{ backgroundColor: buttonColor }}
        aria-label={`Contactar por WhatsApp${cleanPhone ? ` al ${cleanPhone}` : ""}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>
    </div>
  )
}
