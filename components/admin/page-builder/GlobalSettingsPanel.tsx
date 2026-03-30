"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Settings, Palette, Type, Loader2, Save, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

import { getGlobalStyles, updateGlobalStyles, type GlobalStyles } from "@/lib/services/page-builder.service"

const FONT_OPTIONS = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "system-ui, sans-serif", label: "System UI" },
]

const SIZE_OPTIONS = [
  { value: "0.75rem", label: "Extra Pequeño (12px)" },
  { value: "0.875rem", label: "Pequeño (14px)" },
  { value: "1rem", label: "Normal (16px)" },
  { value: "1.125rem", label: "Mediano (18px)" },
  { value: "1.25rem", label: "Grande (20px)" },
  { value: "1.5rem", label: "Extra Grande (24px)" },
  { value: "1.875rem", label: "2XL (30px)" },
  { value: "2rem", label: "3XL (32px)" },
  { value: "2.25rem", label: "4XL (36px)" },
  { value: "2.5rem", label: "5XL (40px)" },
  { value: "3rem", label: "6XL (48px)" },
  { value: "3.75rem", label: "7XL (60px)" },
]

export function GlobalSettingsPanel() {
  const { toast } = useToast()
  const { data: styles, error, isLoading, mutate } = useSWR("global-styles", getGlobalStyles)
  
  const [formData, setFormData] = useState<GlobalStyles | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (styles && !formData) {
      setFormData(styles)
    }
  }, [styles, formData])

  const handleChange = (key: keyof GlobalStyles, value: string) => {
    if (!formData) return
    setFormData((prev) => prev ? { ...prev, [key]: value } : null)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!formData) return
    
    setIsSaving(true)
    try {
      await updateGlobalStyles(formData)
      await mutate()
      setHasChanges(false)
      toast({
        title: "Estilos guardados",
        description: "Los estilos globales se han actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error saving styles:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los estilos globales.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (styles) {
      setFormData(styles)
      setHasChanges(false)
    }
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Error al cargar los estilos globales</p>
      </div>
    )
  }

  if (isLoading || !formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Estilos Globales
          </h1>
          <p className="text-muted-foreground">
            Configura colores, fuentes y tamaños para todas las páginas construidas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Descartar
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colores
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Tipografía
          </TabsTrigger>
          <TabsTrigger value="custom">CSS Personalizado</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paleta de Colores</CardTitle>
              <CardDescription>
                Define los colores principales que se aplicarán en las páginas
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Color Primario</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange("primary_color", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => handleChange("primary_color", e.target.value)}
                    className="font-mono"
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Botones, enlaces, acentos</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Color Secundario</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange("secondary_color", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => handleChange("secondary_color", e.target.value)}
                    className="font-mono"
                    placeholder="#64748b"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Elementos secundarios</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent_color">Color de Acento</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleChange("accent_color", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.accent_color}
                    onChange={(e) => handleChange("accent_color", e.target.value)}
                    className="font-mono"
                    placeholder="#f59e0b"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Destacados, notificaciones</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Color de Fondo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => handleChange("background_color", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => handleChange("background_color", e.target.value)}
                    className="font-mono"
                    placeholder="#ffffff"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Fondo principal de páginas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Color de Texto</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => handleChange("text_color", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.text_color}
                    onChange={(e) => handleChange("text_color", e.target.value)}
                    className="font-mono"
                    placeholder="#1f2937"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Texto principal</p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="rounded-lg border p-6"
                style={{ 
                  backgroundColor: formData.background_color,
                  color: formData.text_color
                }}
              >
                <h3 
                  className="mb-2 text-xl font-bold"
                  style={{ color: formData.primary_color }}
                >
                  Título de Ejemplo
                </h3>
                <p className="mb-4">
                  Este es un párrafo de ejemplo para ver cómo se verán los colores en tu página.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="rounded px-4 py-2 text-white"
                    style={{ backgroundColor: formData.primary_color }}
                  >
                    Botón Primario
                  </button>
                  <button 
                    className="rounded px-4 py-2 text-white"
                    style={{ backgroundColor: formData.secondary_color }}
                  >
                    Secundario
                  </button>
                  <button 
                    className="rounded px-4 py-2 text-white"
                    style={{ backgroundColor: formData.accent_color }}
                  >
                    Acento
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuentes</CardTitle>
              <CardDescription>
                Selecciona las fuentes para títulos y texto del cuerpo
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fuente de Títulos</Label>
                <Select 
                  value={formData.heading_font} 
                  onValueChange={(value) => handleChange("heading_font", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem 
                        key={font.value} 
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuente del Cuerpo</Label>
                <Select 
                  value={formData.body_font} 
                  onValueChange={(value) => handleChange("body_font", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem 
                        key={font.value} 
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tamaños de Texto</CardTitle>
              <CardDescription>
                Define los tamaños para diferentes niveles de texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Título H1</Label>
                  <Select 
                    value={formData.heading_size_h1} 
                    onValueChange={(value) => handleChange("heading_size_h1", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Título H2</Label>
                  <Select 
                    value={formData.heading_size_h2} 
                    onValueChange={(value) => handleChange("heading_size_h2", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Título H3</Label>
                  <Select 
                    value={formData.heading_size_h3} 
                    onValueChange={(value) => handleChange("heading_size_h3", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 sm:grid-cols-2">
<div className="space-y-2">
                <Label>Texto Normal</Label>
                <Select 
                  value={formData.body_size} 
                  onValueChange={(value) => handleChange("body_size", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.slice(0, 6).map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Texto Pequeño</Label>
                <Select 
                  value={formData.small_size} 
                  onValueChange={(value) => handleChange("small_size", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.slice(0, 4).map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de Tipografía</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="space-y-4 rounded-lg border p-6"
                style={{ 
                  backgroundColor: formData.background_color,
                  color: formData.text_color
                }}
              >
                <h1 
                  style={{ 
                    fontFamily: formData.heading_font, 
                    fontSize: formData.heading_size_h1,
                    lineHeight: 1.2
                  }}
                >
                  Título H1
                </h1>
                <h2 
                  style={{ 
                    fontFamily: formData.heading_font, 
                    fontSize: formData.heading_size_h2,
                    lineHeight: 1.3
                  }}
                >
                  Título H2
                </h2>
                <h3 
                  style={{ 
                    fontFamily: formData.heading_font, 
                    fontSize: formData.heading_size_h3,
                    lineHeight: 1.4
                  }}
                >
                  Título H3
                </h3>
                <p 
                  style={{ 
                    fontFamily: formData.body_font, 
                    fontSize: formData.body_size,
                    lineHeight: 1.6
                  }}
                >
                  Este es un párrafo de ejemplo con el tamaño de texto normal. Puedes ver cómo se verá el contenido de tus páginas con esta configuración de tipografía.
                </p>
                <p 
                  style={{ 
                    fontFamily: formData.body_font, 
                    fontSize: formData.small_size,
                    lineHeight: 1.5,
                    opacity: 0.7
                  }}
                >
                  Este es un texto pequeño, usado para notas al pie, captions o información secundaria.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom CSS Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSS Personalizado</CardTitle>
              <CardDescription>
                Agrega estilos CSS personalizados que se aplicarán a todas las páginas construidas.
                Ten cuidado al usar esta opción.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.custom_css}
                onChange={(e) => handleChange("custom_css", e.target.value)}
                placeholder={`/* Ejemplo de CSS personalizado */
.mi-clase {
  color: red;
}

/* Puedes sobrescribir estilos existentes */
h1 {
  text-transform: uppercase;
}`}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
