"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import useSWR from "swr"
import {
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Link2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getPages } from "@/lib/services/page-builder.service"
import type { Page } from "@/lib/types/page-builder.types"
import type { EterisSlide } from "./index"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface HeaderMediaEditorProps {
  pageComponentId: string
  slides: EterisSlide[]
  onChange: (slides: EterisSlide[]) => void
}

interface DBMediaItem {
  id: string
  url: string
  type: string
  alt?: string
  metadata?: { slideId?: string }
}

/* ------------------------------------------------------------------ */
/*  Fetcher                                                            */
/* ------------------------------------------------------------------ */

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function HeaderMediaEditor({
  pageComponentId,
  slides,
  onChange,
}: HeaderMediaEditorProps) {
  const [openSlides, setOpenSlides] = useState<Set<string>>(new Set())
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null)
  const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingSlideIdRef = useRef<string | null>(null)

  // Pages for URL selector
  const { data: pages } = useSWR<Page[]>("admin-pages", getPages)

  // All media for this component indexed by slideId
  const { data: mediaData, mutate: mutateMedia } = useSWR(
    pageComponentId
      ? `/api/component-media?pageComponentId=${pageComponentId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const dbItems: DBMediaItem[] = mediaData?.items || []

  // Find the DB image for a given slide (by metadata.slideId)
  const getSlideImage = (slideId: string): DBMediaItem | undefined =>
    dbItems.find((item) => item.metadata?.slideId === slideId)

  const toggleSlide = (id: string) => {
    const next = new Set(openSlides)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpenSlides(next)
  }

  const updateSlideField = (
    slideId: string,
    field: keyof EterisSlide,
    value: string
  ) => {
    onChange(
      slides.map((s) => (s.id === slideId ? { ...s, [field]: value } : s))
    )
  }

  const addSlide = () => {
    const newSlide: EterisSlide = {
      id: `slide-${Date.now()}`,
      title: "Nuevo titulo",
      text: "Descripcion del slide",
      image: "/images/placeholder.svg",
      buttonText: "READ MORE",
      buttonUrl: "#",
    }
    onChange([...slides, newSlide])
    setOpenSlides(new Set([...openSlides, newSlide.id]))
  }

  const removeSlide = (slideId: string) => {
    onChange(slides.filter((s) => s.id !== slideId))
    const next = new Set(openSlides)
    next.delete(slideId)
    setOpenSlides(next)
  }

  const moveSlide = (index: number, direction: "up" | "down") => {
    const arr = [...slides]
    const newIdx = direction === "up" ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]
    onChange(arr)
  }

  // ---- Image upload ----

  const triggerFileInput = (slideId: string) => {
    pendingSlideIdRef.current = slideId
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const slideId = pendingSlideIdRef.current
    if (!file || !slideId || !pageComponentId) return

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ""

    setUploadingSlideId(slideId)

    try {
      // Delete old image for this slide if one exists
      const existing = getSlideImage(slideId)
      if (existing) {
        await fetch("/api/component-media", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId: existing.id, pageComponentId }),
        })
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("pageComponentId", pageComponentId)
      formData.append("mediaType", "image")
      formData.append("metadata", JSON.stringify({ slideId }))

      const res = await fetch("/api/component-media", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const { data } = await res.json()
        // Update the slide's image URL in content immediately
        updateSlideField(slideId, "image", data.url)
        mutateMedia()
      }
    } catch (err) {
      console.error("Header media upload error:", err)
    } finally {
      setUploadingSlideId(null)
      pendingSlideIdRef.current = null
    }
  }

  const handleDeleteImage = async (slideId: string) => {
    const existing = getSlideImage(slideId)
    if (!existing || !pageComponentId) return

    setDeletingSlideId(slideId)
    try {
      const res = await fetch("/api/component-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: existing.id, pageComponentId }),
      })
      if (res.ok) {
        // Revert to default image
        updateSlideField(slideId, "image", "/images/placeholder.svg")
        mutateMedia()
      }
    } catch (err) {
      console.error("Header media delete error:", err)
    } finally {
      setDeletingSlideId(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Slides ({slides.length})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSlide}
          className="h-7 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Agregar slide
        </Button>
      </div>

      <div className="space-y-2">
        {slides.map((slide, index) => {
          const dbImage = getSlideImage(slide.id)
          const isUploading = uploadingSlideId === slide.id
          const isDeleting = deletingSlideId === slide.id
          const isOpen = openSlides.has(slide.id)
          const displayImage = dbImage?.url || slide.image || "/images/placeholder.svg"

          return (
            <Collapsible
              key={slide.id}
              open={isOpen}
              onOpenChange={() => toggleSlide(slide.id)}
            >
              <div
                className={cn(
                  "rounded-lg border transition-colors",
                  isOpen
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                )}
              >
                {/* Header row */}
                <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-left">
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-12 rounded overflow-hidden bg-muted shrink-0">
                      <Image
                        src={displayImage}
                        alt={slide.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium truncate max-w-[140px]">
                      {slide.title || `Slide ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t p-3 space-y-3">
                    {/* Image section */}
                    <div className="space-y-2">
                      <Label className="text-xs">Imagen de fondo</Label>
                      <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                        {isUploading || isDeleting ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        ) : null}
                        <Image
                          src={displayImage}
                          alt={slide.title}
                          fill
                          className="object-cover"
                        />
                        {/* Overlay actions */}
                        {!isUploading && !isDeleting && (
                          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-8 text-xs gap-1"
                              onClick={() => triggerFileInput(slide.id)}
                              disabled={!pageComponentId}
                            >
                              <Upload className="h-3 w-3" />
                              Cambiar
                            </Button>
                            {dbImage && (
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs gap-1"
                                onClick={() => handleDeleteImage(slide.id)}
                              >
                                <X className="h-3 w-3" />
                                Quitar
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {!pageComponentId && (
                        <p className="text-xs text-amber-500">
                          Guarda el componente para subir imagenes.
                        </p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <Label className="text-xs">Titulo</Label>
                      <Input
                        value={slide.title}
                        onChange={(e) =>
                          updateSlideField(slide.id, "title", e.target.value)
                        }
                        placeholder="Titulo del slide"
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Text */}
                    <div className="space-y-1">
                      <Label className="text-xs">Texto</Label>
                      <textarea
                        value={slide.text}
                        onChange={(e) =>
                          updateSlideField(slide.id, "text", e.target.value)
                        }
                        placeholder="Descripcion del slide"
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    {/* Button text */}
                    <div className="space-y-1">
                      <Label className="text-xs">Texto del boton</Label>
                      <Input
                        value={slide.buttonText || ""}
                        onChange={(e) =>
                          updateSlideField(slide.id, "buttonText", e.target.value)
                        }
                        placeholder="READ MORE"
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Button URL */}
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        URL del boton
                      </Label>
                      <Select
                        value={slide.buttonUrl || "#"}
                        onValueChange={(v) =>
                          updateSlideField(slide.id, "buttonUrl", v)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecciona una pagina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="#">Sin enlace</SelectItem>
                          <SelectItem value="/">Inicio</SelectItem>
                          {pages?.map((page) => (
                            <SelectItem key={page.id} value={`/${page.slug}`}>
                              {page.title} (/{page.slug})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSlide(index, "up")}
                          disabled={index === 0}
                          className="h-7 w-7 p-0"
                          aria-label="Mover arriba"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveSlide(index, "down")}
                          disabled={index === slides.length - 1}
                          className="h-7 w-7 p-0"
                          aria-label="Mover abajo"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlide(slide.id)}
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        disabled={slides.length <= 1}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })}
      </div>

      {slides.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed rounded-lg text-muted-foreground">
          <ImageIcon className="h-8 w-8 mb-2" />
          <p className="text-xs">No hay slides. Agrega uno para comenzar.</p>
        </div>
      )}
    </div>
  )
}

export default HeaderMediaEditor
