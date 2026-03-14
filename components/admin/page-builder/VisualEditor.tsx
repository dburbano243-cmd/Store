"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  ArrowLeft,
  Save,
  Upload,
  Eye,
  Plus,
  Loader2,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

import { EditorCanvas } from "./EditorCanvas"
import { EditorSidebar } from "./EditorSidebar"
import { ComponentToolbar } from "./ComponentToolbar"

import {
  updateComponent,
  updateComponentsOrder,
  updatePage,
  publishPageComponents,
} from "@/lib/services/page-builder.service"
import type {
  PageWithComponents,
  PageComponent,
  ComponentStyles,
} from "@/lib/types/page-builder.types"

interface VisualEditorProps {
  page: PageWithComponents
  globalComponents: PageComponent[]
  onSave?: () => void
}

export function VisualEditor({ page, globalComponents, onSave }: VisualEditorProps) {
  const { toast } = useToast()
  
  // State
  const [components, setComponents] = useState<PageComponent[]>(page.components)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Selected component
  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null

  // Handlers
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          sort_order: index,
        }))
        return newItems
      })
      setHasUnsavedChanges(true)
    }
  }, [])

  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id)
  }, [])

  const handleContentChange = useCallback((id: string, content: Record<string, unknown>) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, draft_content: content } : c))
    )
    setHasUnsavedChanges(true)
  }, [])

  const handleStylesChange = useCallback((id: string, styles: ComponentStyles) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, styles } : c))
    )
    setHasUnsavedChanges(true)
  }, [])

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      // Save all component changes
      const updates = components.map((comp) =>
        updateComponent(comp.id, {
          draft_content: comp.draft_content,
          styles: comp.styles,
          sort_order: comp.sort_order,
        })
      )
      await Promise.all(updates)

      // Update component order
      await updateComponentsOrder(
        components.map((c, index) => ({ id: c.id, sort_order: index }))
      )

      setHasUnsavedChanges(false)
      toast({
        title: "Borrador guardado",
        description: "Los cambios se han guardado correctamente.",
      })
      onSave?.()
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // First save the draft
      await handleSaveDraft()

      // Then publish (copy draft_content to published_content)
      await publishPageComponents(page.id)

      // Update page status to published
      await updatePage(page.id, { status: "published" })

      toast({
        title: "Página publicada",
        description: "La página ahora está visible para los visitantes.",
      })
      onSave?.()
    } catch (error) {
      console.error("Error publishing:", error)
      toast({
        title: "Error al publicar",
        description: "No se pudo publicar la página.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Editor Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">{page.title}</h1>
            <Badge variant={page.status === "published" ? "default" : "secondary"}>
              {page.status === "published" ? "Publicado" : "Borrador"}
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600">
                Sin guardar
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${page.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Vista previa
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar borrador
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Publicar
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Component Toolbar */}
        <ComponentToolbar pageId={page.id} />

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={components.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <EditorCanvas
                components={components}
                globalComponents={globalComponents}
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                onContentChange={handleContentChange}
                onStylesChange={handleStylesChange}
              />
            </SortableContext>
          </DndContext>

          {/* Empty State */}
          {components.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
              <Plus className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Arrastra componentes desde la barra lateral izquierda
              </p>
            </div>
          )}
        </div>

        {/* Properties Sidebar */}
        {isSidebarOpen && (
          <EditorSidebar
            selectedComponent={selectedComponent}
            onContentChange={(content) =>
              selectedComponent && handleContentChange(selectedComponent.id, content)
            }
            onStylesChange={(styles) =>
              selectedComponent && handleStylesChange(selectedComponent.id, styles)
            }
            onClose={() => setSelectedComponentId(null)}
          />
        )}
      </div>
    </div>
  )
}
