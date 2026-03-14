"use client"

import { X, Settings2, Palette, Layout } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { PageComponent, ComponentStyles } from "@/lib/types/page-builder.types"

interface EditorSidebarProps {
  selectedComponent: PageComponent | null
  onContentChange: (content: Record<string, unknown>) => void
  onStylesChange: (styles: ComponentStyles) => void
  onClose: () => void
}

export function EditorSidebar({
  selectedComponent,
  onContentChange,
  onStylesChange,
  onClose,
}: EditorSidebarProps) {
  if (!selectedComponent) {
    return (
      <div className="w-80 shrink-0 border-l border-border bg-background">
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <Settings2 className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Selecciona un componente para editar sus propiedades
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 shrink-0 border-l border-border bg-background">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div>
          <h3 className="font-semibold">{selectedComponent.component_type}</h3>
          <p className="text-xs text-muted-foreground">Propiedades del componente</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="content" className="flex-1">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="content"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Contenido
          </TabsTrigger>
          <TabsTrigger
            value="styles"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Palette className="mr-2 h-4 w-4" />
            Estilos
          </TabsTrigger>
          <TabsTrigger
            value="layout"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Layout className="mr-2 h-4 w-4" />
            Layout
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          {/* Content Tab */}
          <TabsContent value="content" className="m-0 p-4">
            <ContentEditor
              content={selectedComponent.draft_content}
              componentType={selectedComponent.component_type}
              onChange={onContentChange}
            />
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="m-0 p-4">
            <StylesEditor
              styles={selectedComponent.styles}
              onChange={onStylesChange}
            />
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="m-0 p-4">
            <LayoutEditor
              styles={selectedComponent.styles}
              onChange={onStylesChange}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

// =============================================
// CONTENT EDITOR
// =============================================

interface ContentEditorProps {
  content: Record<string, unknown>
  componentType: string
  onChange: (content: Record<string, unknown>) => void
}

function ContentEditor({ content, componentType, onChange }: ContentEditorProps) {
  // Por ahora renderizamos los campos de forma genérica
  // Cuando registres componentes, esto se personalizará
  const fields = Object.entries(content)

  if (fields.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        <p>No hay campos de contenido configurados para este componente.</p>
        <p className="mt-2 text-xs">
          Registra el componente en ComponentRegistry para definir sus campos editables.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="capitalize">
            {key.replace(/_/g, " ")}
          </Label>
          {typeof value === "string" ? (
            value.length > 100 ? (
              <textarea
                id={key}
                value={value}
                onChange={(e) => onChange({ ...content, [key]: e.target.value })}
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            ) : (
              <Input
                id={key}
                value={value}
                onChange={(e) => onChange({ ...content, [key]: e.target.value })}
              />
            )
          ) : typeof value === "number" ? (
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => onChange({ ...content, [key]: Number(e.target.value) })}
            />
          ) : typeof value === "boolean" ? (
            <Select
              value={value ? "true" : "false"}
              onValueChange={(v) => onChange({ ...content, [key]: v === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Si</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={key}
              value={JSON.stringify(value)}
              onChange={(e) => {
                try {
                  onChange({ ...content, [key]: JSON.parse(e.target.value) })
                } catch {
                  // Mantener como string si no es JSON válido
                }
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
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
    <div className="space-y-6">
      {/* Background */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Fondo
        </Label>
        <div className="space-y-2">
          <Label htmlFor="backgroundColor" className="text-sm">
            Color de fondo
          </Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              value={styles.backgroundColor || ""}
              onChange={(e) =>
                onChange({ ...styles, backgroundColor: e.target.value })
              }
              placeholder="#ffffff o transparent"
              className="flex-1"
            />
            <input
              type="color"
              value={styles.backgroundColor || "#ffffff"}
              onChange={(e) =>
                onChange({ ...styles, backgroundColor: e.target.value })
              }
              className="h-9 w-9 cursor-pointer rounded border"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Text */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Texto
        </Label>
        <div className="space-y-2">
          <Label htmlFor="textColor" className="text-sm">
            Color de texto
          </Label>
          <div className="flex gap-2">
            <Input
              id="textColor"
              value={styles.textColor || ""}
              onChange={(e) => onChange({ ...styles, textColor: e.target.value })}
              placeholder="#000000"
              className="flex-1"
            />
            <input
              type="color"
              value={styles.textColor || "#000000"}
              onChange={(e) => onChange({ ...styles, textColor: e.target.value })}
              className="h-9 w-9 cursor-pointer rounded border"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Custom Classes */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Clases CSS
        </Label>
        <div className="space-y-2">
          <Label htmlFor="className" className="text-sm">
            Clases de Tailwind
          </Label>
          <Input
            id="className"
            value={styles.className || ""}
            onChange={(e) => onChange({ ...styles, className: e.target.value })}
            placeholder="p-4 bg-gray-100 rounded-lg"
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
    <div className="space-y-6">
      {/* Padding */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Padding (interno)
        </Label>
        <div className="space-y-2">
          <Label htmlFor="padding" className="text-sm">
            Padding
          </Label>
          <Select
            value={styles.padding || "none"}
            onValueChange={(v) =>
              onChange({ ...styles, padding: v === "none" ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona padding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              <SelectItem value="py-2">Pequeño (py-2)</SelectItem>
              <SelectItem value="py-4">Mediano (py-4)</SelectItem>
              <SelectItem value="py-8">Grande (py-8)</SelectItem>
              <SelectItem value="py-12">Extra grande (py-12)</SelectItem>
              <SelectItem value="py-16">Muy grande (py-16)</SelectItem>
              <SelectItem value="py-24">Enorme (py-24)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Margin */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Margin (externo)
        </Label>
        <div className="space-y-2">
          <Label htmlFor="margin" className="text-sm">
            Margin
          </Label>
          <Select
            value={styles.margin || "none"}
            onValueChange={(v) =>
              onChange({ ...styles, margin: v === "none" ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona margin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              <SelectItem value="my-2">Pequeño (my-2)</SelectItem>
              <SelectItem value="my-4">Mediano (my-4)</SelectItem>
              <SelectItem value="my-8">Grande (my-8)</SelectItem>
              <SelectItem value="my-12">Extra grande (my-12)</SelectItem>
              <SelectItem value="my-16">Muy grande (my-16)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
