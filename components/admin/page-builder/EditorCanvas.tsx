"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import type { PageComponent, ComponentStyles } from "@/lib/types/page-builder.types"

// Registry para renderizar componentes
// Por ahora está vacío, se llenará cuando crees componentes
import { componentRegistry } from "./ComponentRegistry"

interface EditorCanvasProps {
  components: PageComponent[]
  globalComponents: PageComponent[]
  selectedComponentId: string | null
  onSelectComponent: (id: string | null) => void
  onContentChange: (id: string, content: Record<string, unknown>) => void
  onStylesChange: (id: string, styles: ComponentStyles) => void
  onDeleteComponent: (id: string) => void
}

export function EditorCanvas({
  components,
  globalComponents,
  selectedComponentId,
  onSelectComponent,
  onContentChange,
  onStylesChange,
  onDeleteComponent,
}: EditorCanvasProps) {
  // Render global header components first
  const headerComponents = globalComponents.filter(
    (c) => c.component_type.toLowerCase().includes("header") || 
           c.component_type.toLowerCase().includes("navbar")
  )

  // Render global footer components last
  const footerComponents = globalComponents.filter(
    (c) => c.component_type.toLowerCase().includes("footer")
  )

  return (
    <div className="mx-auto w-full max-w-full md:max-w-5xl overflow-x-hidden overflow-y-visible">
      {/* Global Header Components (no editables) */}
      {headerComponents.map((component) => (
        <div
          key={component.id}
          className="relative mb-2 md:mb-4 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-1 md:p-2 overflow-hidden w-full"
        >
          <div className="absolute -top-2 left-1 md:-top-2.5 md:left-2 rounded bg-blue-500 px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs text-white">
            Global: {component.component_type}
          </div>
          <ComponentRenderer
            component={component}
            isEditable={false}
            isSelected={false}
          />
        </div>
      ))}

      {/* Page Components (editables y arrastrables) */}
      <div className="space-y-2 md:space-y-4 w-full overflow-hidden">
        {components.map((component) => (
          <SortableComponent
            key={component.id}
            component={component}
            isSelected={selectedComponentId === component.id}
            onSelect={() => onSelectComponent(component.id)}
            onContentChange={(content) => onContentChange(component.id, content)}
            onStylesChange={(styles) => onStylesChange(component.id, styles)}
            onDelete={() => onDeleteComponent(component.id)}
          />
        ))}
      </div>

      {/* Global Footer Components (no editables) */}
      {footerComponents.map((component) => (
        <div
          key={component.id}
          className="relative mt-2 md:mt-4 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-1 md:p-2 overflow-hidden w-full"
        >
          <div className="absolute -top-2 left-1 md:-top-2.5 md:left-2 rounded bg-blue-500 px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs text-white">
            Global: {component.component_type}
          </div>
          <ComponentRenderer
            component={component}
            isEditable={false}
            isSelected={false}
          />
        </div>
      ))}
    </div>
  )
}

interface SortableComponentProps {
  component: PageComponent
  isSelected: boolean
  onSelect: () => void
  onContentChange: (content: Record<string, unknown>) => void
  onStylesChange: (styles: ComponentStyles) => void
  onDelete: () => void
}

function SortableComponent({
  component,
  isSelected,
  onSelect,
  onContentChange,
  onStylesChange,
  onDelete,
}: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border-2 transition-all overflow-hidden w-full max-w-full",
        isDragging && "opacity-50",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-muted-foreground/20"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Component Toolbar */}
      <div
        className={cn(
          "absolute -top-2.5 md:-top-3 left-1 md:left-2 z-10 flex items-center gap-0.5 md:gap-1 rounded bg-background shadow-sm transition-opacity",
          isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-0.5 md:p-1 hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </button>

        {/* Component Type Label */}
        <span className="px-1 md:px-2 text-[10px] md:text-xs font-medium text-muted-foreground max-w-[80px] md:max-w-none truncate">
          {component.component_type}
        </span>

        {/* Delete Button - hidden on mobile (use bottom sheet instead) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-destructive hidden md:flex"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </Button>
      </div>

      {/* Component Content */}
      <div className="p-1 md:p-2 overflow-hidden w-full">
        <ComponentRenderer
          component={component}
          isEditable={true}
          isSelected={isSelected}
          onContentChange={onContentChange}
          onStylesChange={onStylesChange}
        />
      </div>
    </div>
  )
}

interface ComponentRendererProps {
  component: PageComponent
  isEditable: boolean
  isSelected: boolean
  onContentChange?: (content: Record<string, unknown>) => void
  onStylesChange?: (styles: ComponentStyles) => void
}

function ComponentRenderer({
  component,
  isEditable,
  isSelected,
  onContentChange,
  onStylesChange,
}: ComponentRendererProps) {
  // Buscar el componente en el registry
  const RegisteredComponent = componentRegistry[component.component_type]

  if (!RegisteredComponent) {
    // Placeholder para componentes no registrados
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {component.component_type}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Componente no registrado
          </p>
        </div>
      </div>
    )
  }

  // Wrapper con overflow hidden para evitar scroll horizontal en preview
  return (
    <div className="w-full overflow-hidden [&_*]:max-w-full">
      <RegisteredComponent
        content={component.draft_content}
        styles={component.styles}
        componentId={component.id}
        isEditable={isEditable}
        isSelected={isSelected}
        onContentChange={onContentChange}
        onStylesChange={onStylesChange}
      />
    </div>
  )
}
