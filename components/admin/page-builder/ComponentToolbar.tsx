"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Type,
  Image,
  Layout,
  Columns,
  Square,
  List,
  Video,
  MessageSquare,
  Star,
  ShoppingBag,
  Search,
  Loader2,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { getComponentTypes, createComponent } from "@/lib/services/page-builder.service"
import type { ComponentType } from "@/lib/types/page-builder.types"

// Iconos por defecto para tipos de componentes
const componentIcons: Record<string, React.ElementType> = {
  hero: Layout,
  header: Layout,
  navbar: Layout,
  footer: Layout,
  text: Type,
  heading: Type,
  paragraph: Type,
  image: Image,
  gallery: Image,
  video: Video,
  columns: Columns,
  grid: Columns,
  card: Square,
  cards: Square,
  list: List,
  testimonial: MessageSquare,
  testimonials: MessageSquare,
  reviews: Star,
  products: ShoppingBag,
  product_grid: ShoppingBag,
  cta: Square,
  button: Square,
  form: Square,
  contact: Square,
}

// Componentes predefinidos cuando no hay tipos en la base de datos
const defaultComponentTypes: Array<{
  name: string
  label: string
  icon: string
  category: string
}> = [
  { name: "hero", label: "Hero Section", icon: "layout", category: "layout" },
  { name: "heading", label: "Encabezado", icon: "type", category: "text" },
  { name: "paragraph", label: "Párrafo", icon: "type", category: "text" },
  { name: "image", label: "Imagen", icon: "image", category: "media" },
  { name: "gallery", label: "Galería", icon: "image", category: "media" },
  { name: "video", label: "Video", icon: "video", category: "media" },
  { name: "columns", label: "Columnas", icon: "columns", category: "layout" },
  { name: "card", label: "Tarjeta", icon: "square", category: "components" },
  { name: "cta", label: "Call to Action", icon: "square", category: "components" },
  { name: "testimonials", label: "Testimonios", icon: "message-square", category: "components" },
  { name: "product_grid", label: "Productos", icon: "shopping-bag", category: "ecommerce" },
]

interface ComponentToolbarProps {
  pageId: string
}

export function ComponentToolbar({ pageId }: ComponentToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdding, setIsAdding] = useState<string | null>(null)

  const { data: componentTypes, isLoading } = useSWR<ComponentType[]>(
    "component-types",
    getComponentTypes
  )

  // Usar tipos de la DB si existen, sino usar los predefinidos
  const availableTypes = componentTypes && componentTypes.length > 0
    ? componentTypes.map((ct) => ({
        name: ct.name,
        label: ct.label,
        icon: ct.icon || ct.name,
        category: "registered",
      }))
    : defaultComponentTypes

  // Filtrar por búsqueda
  const filteredTypes = searchQuery
    ? availableTypes.filter(
        (ct) =>
          ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ct.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTypes

  // Agrupar por categoría
  const categories = [
    { key: "layout", label: "Layout" },
    { key: "text", label: "Texto" },
    { key: "media", label: "Media" },
    { key: "components", label: "Componentes" },
    { key: "ecommerce", label: "E-commerce" },
    { key: "registered", label: "Registrados" },
  ]

  const handleAddComponent = async (componentType: string) => {
    setIsAdding(componentType)
    try {
      // Crear componente con sort_order alto para que quede al final
      await createComponent({
        page_id: pageId,
        component_type: componentType,
        draft_content: {},
        styles: {},
        sort_order: Date.now(), // Usar timestamp como sort_order temporal
        is_active: true,
        is_global: false,
      })
      // Recargar la página para mostrar el nuevo componente
      window.location.reload()
    } catch (error) {
      console.error("Error adding component:", error)
    } finally {
      setIsAdding(null)
    }
  }

  const getIcon = (iconName: string): React.ElementType => {
    return componentIcons[iconName.toLowerCase()] || Square
  }

  return (
    <div className="w-64 shrink-0 border-r border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="font-semibold">Componentes</h3>
        <p className="text-xs text-muted-foreground">
          Arrastra o haz clic para agregar
        </p>
      </div>

      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar componente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Component List */}
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-3">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TooltipProvider delayDuration={300}>
              {categories.map((category) => {
                const categoryComponents = filteredTypes.filter(
                  (ct) => ct.category === category.key
                )

                if (categoryComponents.length === 0) return null

                return (
                  <div key={category.key} className="mb-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      {category.label}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryComponents.map((ct) => {
                        const Icon = getIcon(ct.icon)
                        const isAddingThis = isAdding === ct.name

                        return (
                          <Tooltip key={ct.name}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-auto flex-col gap-1 p-3"
                                onClick={() => handleAddComponent(ct.name)}
                                disabled={isAddingThis}
                              >
                                {isAddingThis ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Icon className="h-5 w-5" />
                                )}
                                <span className="text-xs">{ct.label}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Agregar {ct.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </TooltipProvider>
          )}

          {filteredTypes.length === 0 && !isLoading && (
            <div className="text-center text-sm text-muted-foreground">
              No se encontraron componentes
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="border-t border-border p-3">
        <p className="text-xs text-muted-foreground text-center">
          {availableTypes.length} componentes disponibles
        </p>
      </div>
    </div>
  )
}
