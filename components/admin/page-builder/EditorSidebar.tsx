"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Settings2, Palette, Layout, GripVertical, Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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

import { SlidesArrayEditor } from "./SlidesArrayEditor"
import { MasonryMediaEditor } from "@/components/page-builder/blocks/masonry-eteris/MasonryMediaEditor"
import { HeaderMediaEditor } from "@/components/page-builder/blocks/header-eteris/HeaderMediaEditor"
import type { EterisSlide } from "@/components/page-builder/blocks/header-eteris/index"
import type { PageComponent, ComponentStyles } from "@/lib/types/page-builder.types"
import { componentMetadata, componentFieldConfigs, blockArrayEditorConfigs } from "./ComponentRegistry"

interface EditorSidebarProps {
  components: PageComponent[]
  selectedComponentId: string | null
  onSelectComponent: (id: string) => void
  onContentChange: (id: string, content: Record<string, unknown>) => void
  onStylesChange: (id: string, styles: ComponentStyles) => void
  onDeleteComponent?: (id: string) => void
}

export function EditorSidebar({
  components,
  selectedComponentId,
  onSelectComponent,
  onContentChange,
  onStylesChange,
  onDeleteComponent,
}: EditorSidebarProps) {
  if (components.length === 0) {
    return (
      <div className="w-96 shrink-0 border-l border-border bg-background">
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <Settings2 className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Agrega componentes desde el panel izquierdo para editarlos aqui
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 shrink-0 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 shrink-0">
        <div>
          <h3 className="font-semibold">Propiedades</h3>
          <p className="text-xs text-muted-foreground">{components.length} componentes</p>
        </div>
      </div>

      {/* Components List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {components.map((component, index) => (
            <SortableComponentAccordion
              key={component.id}
              component={component}
              index={index}
              isSelected={selectedComponentId === component.id}
              onSelect={() => onSelectComponent(component.id)}
              onContentChange={(content) => onContentChange(component.id, content)}
              onStylesChange={(styles) => onStylesChange(component.id, styles)}
              onDelete={onDeleteComponent ? () => onDeleteComponent(component.id) : undefined}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// =============================================
// SORTABLE COMPONENT ACCORDION
// =============================================

interface SortableComponentAccordionProps {
  component: PageComponent
  index: number
  isSelected: boolean
  onSelect: () => void
  onContentChange: (content: Record<string, unknown>) => void
  onStylesChange: (styles: ComponentStyles) => void
  onDelete?: () => void
}

function SortableComponentAccordion({
  component,
  index,
  isSelected,
  onSelect,
  onContentChange,
  onStylesChange,
  onDelete,
}: SortableComponentAccordionProps) {
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

  const metadata = componentMetadata[component.component_type]
  const label = metadata?.label || component.component_type

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border transition-all",
        isDragging && "opacity-50 shadow-lg",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
      )}
    >
      <Collapsible defaultOpen={isSelected}>
        <div className="flex w-full items-center gap-2 p-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">{index + 1}</span>
          <CollapsibleTrigger
            className="flex-1 text-left font-medium text-sm hover:underline"
            onClick={onSelect}
          >
            {label}
          </CollapsibleTrigger>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <div className="border-t border-border">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-9">
                <TabsTrigger
                  value="content"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none text-xs h-9 px-3"
                >
                  <Settings2 className="mr-1 h-3 w-3" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger
                  value="styles"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none text-xs h-9 px-3"
                >
                  <Palette className="mr-1 h-3 w-3" />
                  Estilos
                </TabsTrigger>
                <TabsTrigger
                  value="layout"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none text-xs h-9 px-3"
                >
                  <Layout className="mr-1 h-3 w-3" />
                  Layout
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="m-0 p-3">
 <ContentEditor
  content={component.draft_content}
  componentType={component.component_type}
  pageComponentId={component.id}
  onChange={onContentChange}
  styles={component.styles}
  onStylesChange={onStylesChange}
                />
              </TabsContent>

              <TabsContent value="styles" className="m-0 p-3">
                <StylesEditor
                  styles={component.styles}
                  onChange={onStylesChange}
                />
              </TabsContent>

              <TabsContent value="layout" className="m-0 p-3">
                <LayoutEditor
                  styles={component.styles}
                  onChange={onStylesChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// =============================================
// CONTENT EDITOR
// =============================================

interface ContentEditorProps {
  content: Record<string, unknown>
  componentType: string
  pageComponentId?: string
  onChange: (content: Record<string, unknown>) => void
  styles?: ComponentStyles
  onStylesChange?: (styles: ComponentStyles) => void
}

function ContentEditor({ content, componentType, pageComponentId, onChange, styles, onStylesChange }: ContentEditorProps) {
  const fieldConfig = componentFieldConfigs[componentType]

  // Obtener configuracion del editor de arrays desde el config del componente
  const arrayEditorConfig = blockArrayEditorConfigs[componentType]
  
  // Determinar si tiene un array editable
  const arrayFieldName = arrayEditorConfig?.arrayFieldName
  const hasEditableArray = arrayFieldName && Array.isArray(content[arrayFieldName])

  if (fieldConfig && fieldConfig.length > 0) {
    // Separate content fields and style fields
    const contentFields = fieldConfig.filter(f => !f.name.startsWith('styles.'))
    const styleFields = fieldConfig.filter(f => f.name.startsWith('styles.'))

    return (
      <div className="space-y-3">
        {contentFields.map((field) => (
          <div key={field.name} className="space-y-1">
            <Label htmlFor={`${componentType}-${field.name}`} className="text-xs">
              {field.label}
            </Label>
            {renderFieldInput(field, content, onChange, componentType)}
          </div>
        ))}

        {/* Array Editor (slides/cards) - configurado desde el config del componente */}
        {/* Skipped for header_eteris — it uses HeaderMediaEditor instead */}
        {hasEditableArray && arrayEditorConfig && arrayFieldName && componentType !== "header_eteris" && (
          <div className="pt-2 border-t border-border">
            <SlidesArrayEditor
              slides={content[arrayFieldName] as Array<{ id: string; [key: string]: unknown }>}
              onChange={(newItems) => onChange({ ...content, [arrayFieldName]: newItems })}
              slideFields={arrayEditorConfig.itemFields}
              labels={{
                title: arrayEditorConfig.labels.title,
                addButton: arrayEditorConfig.labels.addButton,
                slideLabel: arrayEditorConfig.labels.itemLabel,
              }}
            />
          </div>
        )}

        {/* Masonry Media Editor - for masonry_eteris component */}
        {componentType === "masonry_eteris" && pageComponentId && (
          <div className="pt-2 border-t border-border">
            <MasonryMediaEditor
              pageComponentId={pageComponentId}
              items={(content.items as Array<{ id: string; url: string; type: "image" | "video"; alt?: string; aspectRatio?: number }>) || []}
              onChange={(items) => onChange({ ...content, items })}
            />
          </div>
        )}

        {/* Header Media Editor - for header_eteris component */}
        {componentType === "header_eteris" && pageComponentId && (
          <div className="pt-2 border-t border-border">
            <HeaderMediaEditor
              pageComponentId={pageComponentId}
              slides={(content.slides as EterisSlide[]) || []}
              onChange={(slides) => onChange({ ...content, slides })}
            />
          </div>
        )}
        
        {styleFields.length > 0 && onStylesChange && styles && (
          <>
            <div className="pt-2 border-t border-border">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Colores del componente
              </Label>
            </div>
            {styleFields.map((field) => {
              const styleName = field.name.replace('styles.', '')
              return (
                <div key={field.name} className="space-y-1">
                  <Label htmlFor={`${componentType}-${field.name}`} className="text-xs">
                    {field.label}
                  </Label>
                  {renderStyleFieldInput(field, styleName, styles, onStylesChange, componentType)}
                </div>
              )
            })}
          </>
        )}
      </div>
    )
  }

  const fields = Object.entries(content)

  if (fields.length === 0) {
    return (
      <div className="text-center text-xs text-muted-foreground py-4">
        <p>No hay campos configurados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {fields.map(([key, value]) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={key} className="capitalize text-xs">
            {key.replace(/_/g, " ")}
          </Label>
          {typeof value === "string" ? (
            value.length > 100 ? (
              <textarea
                id={key}
                value={value}
                onChange={(e) => onChange({ ...content, [key]: e.target.value })}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            ) : (
              <Input
                id={key}
                value={value}
                onChange={(e) => onChange({ ...content, [key]: e.target.value })}
                className="h-8 text-xs"
              />
            )
          ) : typeof value === "number" ? (
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => onChange({ ...content, [key]: Number(e.target.value) })}
              className="h-8 text-xs"
            />
          ) : typeof value === "boolean" ? (
            <Select
              value={value ? "true" : "false"}
              onValueChange={(v) => onChange({ ...content, [key]: v === "true" })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Si</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function renderStyleFieldInput(
  field: {
    name: string
    label: string
    type: string
    defaultValue?: unknown
  },
  styleName: string,
  styles: ComponentStyles,
  onChange: (styles: ComponentStyles) => void,
  componentType: string
) {
  const value = (styles as Record<string, unknown>)[styleName] ?? field.defaultValue
  const id = `${componentType}-${field.name}`

  if (field.type === 'color') {
    return (
      <div className="flex gap-2">
        <Input
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange({ ...styles, [styleName]: e.target.value })}
          placeholder="#000000"
          className="h-8 text-xs flex-1"
        />
        <input
          type="color"
          value={(value as string) || "#000000"}
          onChange={(e) => onChange({ ...styles, [styleName]: e.target.value })}
          className="h-8 w-8 cursor-pointer rounded border"
        />
      </div>
    )
  }

  return (
    <Input
      id={id}
      value={(value as string) || ""}
      onChange={(e) => onChange({ ...styles, [styleName]: e.target.value })}
      className="h-8 text-xs"
    />
  )
}

function renderFieldInput(
  field: {
    name: string
    label: string
    type: string
    defaultValue?: unknown
    options?: { label: string; value: string }[]
  },
  content: Record<string, unknown>,
  onChange: (content: Record<string, unknown>) => void,
  componentType: string
) {
  const value = content[field.name] ?? field.defaultValue
  const id = `${componentType}-${field.name}`

  switch (field.type) {
    case "text":
      return (
        <Input
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange({ ...content, [field.name]: e.target.value })}
          className="h-8 text-xs"
        />
      )
    case "textarea":
      return (
        <textarea
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange({ ...content, [field.name]: e.target.value })}
          className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      )
    case "number":
      return (
        <Input
          id={id}
          type="number"
          value={(value as number) || 0}
          onChange={(e) => onChange({ ...content, [field.name]: Number(e.target.value) })}
          className="h-8 text-xs"
        />
      )
    case "boolean":
      return (
        <Select
          value={value ? "true" : "false"}
          onValueChange={(v) => onChange({ ...content, [field.name]: v === "true" })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      )
    case "select":
      return (
        <Select
          value={(value as string) || ""}
          onValueChange={(v) => onChange({ ...content, [field.name]: v })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "image":
      return (
        <Input
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange({ ...content, [field.name]: e.target.value })}
          placeholder="URL de la imagen"
          className="h-8 text-xs"
        />
      )
    case "color":
      return (
        <div className="flex gap-2">
          <Input
            id={id}
            value={(value as string) || ""}
            onChange={(e) => onChange({ ...content, [field.name]: e.target.value })}
            placeholder="#000000"
            className="h-8 text-xs flex-1"
          />
          <input
            type="color"
            value={(value as string) || "#000000"}
            onChange={(e) => onChange({ ...content, [field.name]: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border"
          />
        </div>
      )
    default:
      return (
        <Input
          id={id}
          value={typeof value === "string" ? value : JSON.stringify(value)}
          onChange={(e) => onChange({ ...content, [field.name]: e.target.value })}
          className="h-8 text-xs"
        />
      )
  }
}

// =============================================
// STYLES EDITOR
// =============================================

interface StylesEditorProps {
  styles: ComponentStyles
  onChange: (styles: ComponentStyles) => void
}

function StylesEditor({ styles, onChange }: StylesEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Fondo
        </Label>
        <div className="space-y-1">
          <Label htmlFor="backgroundColor" className="text-xs">
            Color de fondo
          </Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              value={styles.backgroundColor || ""}
              onChange={(e) =>
                onChange({ ...styles, backgroundColor: e.target.value })
              }
              placeholder="#ffffff"
              className="flex-1 h-8 text-xs"
            />
            <input
              type="color"
              value={styles.backgroundColor || "#ffffff"}
              onChange={(e) =>
                onChange({ ...styles, backgroundColor: e.target.value })
              }
              className="h-8 w-8 cursor-pointer rounded border"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="overlayColor" className="text-xs">
            Color overlay (para heroes)
          </Label>
          <div className="flex gap-2">
            <Input
              id="overlayColor"
              value={styles.overlayColor || ""}
              onChange={(e) =>
                onChange({ ...styles, overlayColor: e.target.value })
              }
              placeholder="#000000"
              className="flex-1 h-8 text-xs"
            />
            <input
              type="color"
              value={styles.overlayColor || "#000000"}
              onChange={(e) =>
                onChange({ ...styles, overlayColor: e.target.value })
              }
              className="h-8 w-8 cursor-pointer rounded border"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Texto
        </Label>
        <div className="space-y-1">
          <Label htmlFor="textColor" className="text-xs">
            Color de texto
          </Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              value={styles.textColor || ""}
              onChange={(e) => onChange({ ...styles, textColor: e.target.value })}
              placeholder="#000000"
              className="flex-1 h-8 text-xs"
            />
            <input
              type="color"
              value={styles.textColor || "#000000"}
              onChange={(e) => onChange({ ...styles, textColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Acentos y botones
        </Label>
        <div className="space-y-1">
          <Label htmlFor="accentColor" className="text-xs">
            Color de acento
          </Label>
          <div className="flex gap-2">
            <Input
              id="accentColor"
              value={styles.accentColor || ""}
              onChange={(e) => onChange({ ...styles, accentColor: e.target.value })}
              placeholder="#3b82f6"
              className="flex-1 h-8 text-xs"
            />
            <input
              type="color"
              value={styles.accentColor || "#3b82f6"}
              onChange={(e) => onChange({ ...styles, accentColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="buttonColor" className="text-xs">
            Color del boton
          </Label>
          <div className="flex gap-2">
            <Input
              id="buttonColor"
              value={styles.buttonColor || ""}
              onChange={(e) => onChange({ ...styles, buttonColor: e.target.value })}
              placeholder="#111827"
              className="flex-1 h-8 text-xs"
            />
            <input
              type="color"
              value={styles.buttonColor || "#111827"}
              onChange={(e) => onChange({ ...styles, buttonColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="buttonTextColor" className="text-xs">
            Color texto boton
          </Label>
          <div className="flex gap-2">
            <Input
              id="buttonTextColor"
              value={styles.buttonTextColor || ""}
              onChange={(e) => onChange({ ...styles, buttonTextColor: e.target.value })}
              placeholder="#ffffff"
              className="flex-1 h-8 text-xs"
            />
            <input
              type="color"
              value={styles.buttonTextColor || "#ffffff"}
              onChange={(e) => onChange({ ...styles, buttonTextColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Clases CSS
        </Label>
        <div className="space-y-1">
          <Label htmlFor="className" className="text-xs">
            Clases de Tailwind
          </Label>
          <Input
            id="className"
            value={styles.className || ""}
            onChange={(e) => onChange({ ...styles, className: e.target.value })}
            placeholder="p-4 bg-gray-100"
            className="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  )
}

// =============================================
// LAYOUT EDITOR
// =============================================

interface LayoutEditorProps {
  styles: ComponentStyles
  onChange: (styles: ComponentStyles) => void
}

function LayoutEditor({ styles, onChange }: LayoutEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Padding (interno)
        </Label>
        <Select
          value={styles.padding || "none"}
          onValueChange={(v) =>
            onChange({ ...styles, padding: v === "none" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecciona padding" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguno</SelectItem>
            <SelectItem value="py-2">Pequeno (py-2)</SelectItem>
            <SelectItem value="py-4">Mediano (py-4)</SelectItem>
            <SelectItem value="py-8">Grande (py-8)</SelectItem>
            <SelectItem value="py-12">Extra grande (py-12)</SelectItem>
            <SelectItem value="py-16">Muy grande (py-16)</SelectItem>
            <SelectItem value="py-24">Enorme (py-24)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Margin (externo)
        </Label>
        <Select
          value={styles.margin || "none"}
          onValueChange={(v) =>
            onChange({ ...styles, margin: v === "none" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecciona margin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ninguno</SelectItem>
            <SelectItem value="my-2">Pequeno (my-2)</SelectItem>
            <SelectItem value="my-4">Mediano (my-4)</SelectItem>
            <SelectItem value="my-8">Grande (my-8)</SelectItem>
            <SelectItem value="my-12">Extra grande (my-12)</SelectItem>
            <SelectItem value="my-16">Muy grande (my-16)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
