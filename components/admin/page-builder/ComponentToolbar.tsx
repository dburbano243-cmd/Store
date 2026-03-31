"use client"

import { useState } from "react"
import {
  Type,
  Image,
  Layout,
  LayoutGrid,
  Columns,
  Square,
  List,
  Video,
  MessageSquare,
  Star,
  ShoppingBag,
  Search,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { createComponent } from "@/lib/services/page-builder.service"
import { blockMetadata, allowedBlockTypes } from "./ComponentRegistry"

// Mapa de nombre de icono (string) a componente Lucide
const iconMap: Record<string, React.ElementType> = {
  Layout: Layout,
  Layers: Layout,
  Type: Type,
  Image: Image,
  Video: Video,
  Columns: Columns,
  LayoutGrid: LayoutGrid,
  Square: Square,
  List: List,
  MessageSquare: MessageSquare,
  Star: Star,
  ShoppingBag: ShoppingBag,
  Mail: Square,
}

// Fallback para iconos que no estan en el mapa
const getIconComponent = (iconName: string): React.ElementType => {
  return iconMap[iconName] || Square
}

// Componentes predefinidos desde el registry (siempre disponibles)
const registryComponentTypes: Array<{
  name: string
  label: string
  icon: string
  category: string
}> = allowedBlockTypes.map(name => {
  const meta = blockMetadata[name]
  return {
    name,
    label: meta?.label || name,
    icon: meta?.icon || "Square",
    category: "registered",
  }
})

interface ComponentToolbarProps {
  pageId: string
  onComponentAdded?: (component: import("@/lib/types/page-builder.types").PageComponent) => void
}

export function ComponentToolbar({ pageId, onComponentAdded }: ComponentToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdding, setIsAdding] = useState<string | null>(null)

  // Los tipos vienen directamente del registry (auto-detectados)
  const availableTypes = registryComponentTypes

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
      const newComponent = await createComponent({
        page_id: pageId,
        component_type: componentType,
        draft_content: {},
        styles: {},
        sort_order: Date.now(), // Usar timestamp como sort_order temporal
        is_active: true,
        is_global: false,
      })
      // Notificar al editor para que actualice el estado
      onComponentAdded?.(newComponent)
    } catch (error) {
      console.error("Error adding component:", error)
    } finally {
      setIsAdding(null)
    }
  }

  const getIcon = (iconName: string): React.ElementType => {
    return getIconComponent(iconName)
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
                  <div className="flex flex-col gap-1.5">
                    {categoryComponents.map((ct) => {
                      const Icon = getIcon(ct.icon)
                      const isAddingThis = isAdding === ct.name

                      return (
                        <Tooltip key={ct.name}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-auto justify-start gap-2.5 px-3 py-2.5 w-full text-left"
                              onClick={() => handleAddComponent(ct.name)}
                              disabled={isAddingThis}
                            >
                              {isAddingThis ? (
                                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                              ) : (
                                <Icon className="h-4 w-4 shrink-0" />
                              )}
                              <span className="text-xs font-medium truncate">{ct.label}</span>
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

          {filteredTypes.length === 0 && (
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
