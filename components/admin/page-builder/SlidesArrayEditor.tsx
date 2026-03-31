"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

import { getPages } from "@/lib/services/page-builder.service"
import type { Page } from "@/lib/types/page-builder.types"
import type { ArrayEditorConfig } from "@/components/page-builder/blocks/types"

interface SlideItem {
  id: string
  image?: string
  title?: string
  subtitle?: string
  buttonText?: string
  pageUrl?: string
  buttonUrl?: string
  description?: string
  link?: string
  [key: string]: unknown
}

interface SlidesArrayEditorProps {
  slides: SlideItem[]
  onChange: (slides: SlideItem[]) => void
  /** Campos que tiene cada item - usa el tipo de ArrayEditorConfig */
  slideFields?: ArrayEditorConfig['itemFields']
  labels?: {
    title?: string
    addButton?: string
    slideLabel?: string
  }
}

const defaultSlideFields = {
  image: true,
  title: true,
  subtitle: true,
  buttonText: true,
  pageUrl: true,
}

const defaultLabels = {
  title: "Slides",
  addButton: "Agregar slide",
  slideLabel: "Slide",
}

export function SlidesArrayEditor({
  slides,
  onChange,
  slideFields = defaultSlideFields,
  labels = defaultLabels,
}: SlidesArrayEditorProps) {
  const [openSlides, setOpenSlides] = useState<Set<string>>(new Set())
  
  // Fetch pages for URL selector
  const { data: pages } = useSWR<Page[]>("admin-pages", getPages)

  const toggleSlide = (id: string) => {
    const newOpen = new Set(openSlides)
    if (newOpen.has(id)) {
      newOpen.delete(id)
    } else {
      newOpen.add(id)
    }
    setOpenSlides(newOpen)
  }

  const addSlide = () => {
    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      image: "/images/placeholder.svg",
      title: "Nuevo Titulo",
      subtitle: "Nuevo Subtitulo",
      buttonText: "Ver Mas",
      pageUrl: "/",
    }
    onChange([...slides, newSlide])
    setOpenSlides(new Set([...openSlides, newSlide.id]))
  }

  const removeSlide = (id: string) => {
    onChange(slides.filter((s) => s.id !== id))
    const newOpen = new Set(openSlides)
    newOpen.delete(id)
    setOpenSlides(newOpen)
  }

  const updateSlide = (id: string, field: keyof SlideItem, value: string) => {
    onChange(
      slides.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= slides.length) return
    ;[newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]]
    onChange(newSlides)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          {labels.title} ({slides.length})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSlide}
          className="h-7 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          {labels.addButton}
        </Button>
      </div>

      <div className="space-y-2">
        {slides.map((slide, index) => (
          <Collapsible
            key={slide.id}
            open={openSlides.has(slide.id)}
            onOpenChange={() => toggleSlide(slide.id)}
          >
            <div
              className={cn(
                "rounded-lg border transition-colors",
                openSlides.has(slide.id) ? "border-primary/50 bg-primary/5" : "border-border"
              )}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-left">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">
                    {labels.slideLabel} {index + 1}: {slide.title || "Sin titulo"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {openSlides.has(slide.id) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t p-3 space-y-3">
                  {/* Image URL */}
                  {slideFields.image && (
                    <div className="space-y-1">
                      <Label className="text-xs">Imagen URL</Label>
                      <Input
                        value={slide.image || ""}
                        onChange={(e) => updateSlide(slide.id, "image", e.target.value)}
                        placeholder="/images/slide.jpg"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Title */}
                  {slideFields.title && (
                    <div className="space-y-1">
                      <Label className="text-xs">Titulo</Label>
                      <Input
                        value={slide.title || ""}
                        onChange={(e) => updateSlide(slide.id, "title", e.target.value)}
                        placeholder="Titulo del slide"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Subtitle */}
                  {slideFields.subtitle && (
                    <div className="space-y-1">
                      <Label className="text-xs">Subtitulo</Label>
                      <Input
                        value={slide.subtitle || ""}
                        onChange={(e) => updateSlide(slide.id, "subtitle", e.target.value)}
                        placeholder="Subtitulo del slide"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Description (for carousel cards) */}
                  {slideFields.description && (
                    <div className="space-y-1">
                      <Label className="text-xs">Descripcion</Label>
                      <textarea
                        value={slide.description || ""}
                        onChange={(e) => updateSlide(slide.id, "description", e.target.value)}
                        placeholder="Descripcion del card"
                        className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      />
                    </div>
                  )}

                  {/* Button Text */}
                  {slideFields.buttonText && (
                    <div className="space-y-1">
                      <Label className="text-xs">Texto del boton</Label>
                      <Input
                        value={slide.buttonText || ""}
                        onChange={(e) => updateSlide(slide.id, "buttonText", e.target.value)}
                        placeholder="Ver Mas"
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Page URL Selector */}
                  {slideFields.pageUrl && (
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        Pagina de destino
                      </Label>
                      <Select
                        value={slide.pageUrl || "/"}
                        onValueChange={(value) => updateSlide(slide.id, "pageUrl", value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecciona una pagina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">Inicio</SelectItem>
                          {pages?.map((page) => (
                            <SelectItem key={page.id} value={`/${page.slug}`}>
                              {page.title} (/{page.slug})
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">URL personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                      {slide.pageUrl === "custom" && (
                        <Input
                          value=""
                          onChange={(e) => updateSlide(slide.id, "pageUrl", e.target.value)}
                          placeholder="https://ejemplo.com"
                          className="h-8 text-xs mt-2"
                        />
                      )}
                    </div>
                  )}

                  {/* Button URL (for hero slider) */}
                  {slideFields.buttonUrl && (
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        URL del boton
                      </Label>
                      <Select
                        value={slide.buttonUrl || "/"}
                        onValueChange={(value) => updateSlide(slide.id, "buttonUrl", value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecciona una pagina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/">Inicio</SelectItem>
                          {pages?.map((page) => (
                            <SelectItem key={page.id} value={`/${page.slug}`}>
                              {page.title} (/{page.slug})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Link (for carousel cards) */}
                  {slideFields.link && (
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        Enlace
                      </Label>
                      <Select
                        value={slide.link || "#"}
                        onValueChange={(value) => updateSlide(slide.id, "link", value)}
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
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSlide(index, "up")}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
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
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground mt-2">
            No hay slides. Agrega uno para comenzar.
          </p>
        </div>
      )}
    </div>
  )
}
