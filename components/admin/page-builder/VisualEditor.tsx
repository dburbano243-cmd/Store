"use client"

import { useState, useCallback, useEffect } from "react"
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
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"

import { EditorCanvas } from "./EditorCanvas"
import { EditorSidebar, MobileEditorPanel } from "./EditorSidebar"
import { ComponentToolbar } from "./ComponentToolbar"

import {
  updateComponent,
  updateComponentsOrder,
  updatePage,
  publishPageComponents,
  deleteComponent,
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
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
    // Open mobile editor when selecting a component on mobile
    if (id && isMobile) {
      setIsMobileEditorOpen(true)
    }
  }, [isMobile])

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

  const handleDeleteComponent = useCallback(async (id: string) => {
    try {
      await deleteComponent(id)
      setComponents((prev) => prev.filter((c) => c.id !== id))
      if (selectedComponentId === id) {
        setSelectedComponentId(null)
      }
      toast({
        title: "Componente eliminado",
        description: "El componente se ha eliminado correctamente.",
      })
      onSave?.()
    } catch (error) {
      console.error("Error deleting component:", error)
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el componente.",
        variant: "destructive",
      })
    }
  }, [selectedComponentId, toast, onSave])

  const handleComponentAdded = useCallback((newComponent: PageComponent) => {
    setComponents((prev) => [...prev, newComponent])
    setHasUnsavedChanges(true)
    toast({
      title: "Componente agregado",
      description: "El componente se ha agregado correctamente.",
    })
  }, [toast])

  // Internal save function that throws errors (for use in publish)
  const saveDraftInternal = async () => {
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
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      await saveDraftInternal()
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
      // First save the draft (without showing toast)
      await saveDraftInternal()

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

  // Get selected component for mobile editor
  const selectedComponentForMobile = selectedComponentId 
    ? components.find((c) => c.id === selectedComponentId) 
    : null

  return (
    <div className="flex h-full flex-col overflow-x-hidden w-full max-w-full">
      {/* Editor Header - Responsive */}
      <div className="flex h-12 md:h-14 shrink-0 items-center justify-between border-b border-border bg-background px-2 md:px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" asChild className="h-8 px-2 md:px-3">
            <Link href="/admin/pages">
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Volver</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <div className="flex items-center gap-1 md:gap-2">
            <h1 className="font-semibold text-xs md:text-base truncate max-w-[100px] md:max-w-none">{page.title}</h1>
            <Badge variant={page.status === "published" ? "default" : "secondary"} className="text-[10px] md:text-xs h-5 md:h-auto">
              {page.status === "published" ? "Pub" : "Borr"}
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600 text-[10px] md:text-xs h-5 md:h-auto hidden sm:flex">
                Sin guardar
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 px-2 md:px-3 hidden sm:flex">
            <Link href={`/${page.slug}`} target="_blank">
              <Eye className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Vista previa</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || !hasUnsavedChanges}
            className="h-8 px-2 md:px-3"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 md:mr-2" />
            )}
            <span className="hidden md:inline">Guardar</span>
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-8 px-2 md:px-3"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 md:mr-2" />
            )}
            <span className="hidden md:inline">Publicar</span>
          </Button>
          <Separator orientation="vertical" className="mx-1 md:mx-2 h-6 hidden md:block" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8 hidden md:flex"
          >
            {isSidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile: Component Toolbar at top (horizontal scrollable) */}
      <div className="md:hidden">
        <ComponentToolbar 
          pageId={page.id} 
          onComponentAdded={handleComponentAdded} 
          isMobile={true}
        />
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Desktop: Component Toolbar on left */}
        <div className="hidden md:block">
          <ComponentToolbar pageId={page.id} onComponentAdded={handleComponentAdded} />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={components.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {/* Canvas */}
            <div className={`flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 p-2 md:p-8 min-w-0 ${isMobile ? 'editor-canvas-mobile' : ''}`}>
              <EditorCanvas
                components={components}
                globalComponents={globalComponents}
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                onContentChange={handleContentChange}
                onStylesChange={handleStylesChange}
                onDeleteComponent={handleDeleteComponent}
              />

              {/* Empty State */}
              {components.length === 0 && (
                <div className="flex h-40 md:h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <Plus className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/50" />
                  <p className="mt-2 md:mt-4 text-xs md:text-sm text-muted-foreground text-center px-4">
                    Selecciona un componente arriba para agregarlo
                  </p>
                </div>
              )}
            </div>

            {/* Desktop: Properties Sidebar on right */}
            {isSidebarOpen && !isMobile && (
              <EditorSidebar
                components={components}
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                onContentChange={handleContentChange}
                onStylesChange={handleStylesChange}
                onDeleteComponent={handleDeleteComponent}
              />
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* Mobile: Editor Sheet at bottom */}
      {isMobile && (
        <Sheet open={isMobileEditorOpen} onOpenChange={setIsMobileEditorOpen}>
          <SheetContent side="bottom" className="h-[70vh] p-0 [&>button]:hidden">
            <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm font-medium">
                  Editar componente
                </SheetTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setIsMobileEditorOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            {selectedComponentForMobile && (
              <MobileEditorPanel
                component={selectedComponentForMobile}
                onContentChange={(content) => handleContentChange(selectedComponentForMobile.id, content)}
                onStylesChange={(styles) => handleStylesChange(selectedComponentForMobile.id, styles)}
                onDelete={() => {
                  handleDeleteComponent(selectedComponentForMobile.id)
                  setIsMobileEditorOpen(false)
                }}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
