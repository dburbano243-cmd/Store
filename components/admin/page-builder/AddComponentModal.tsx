"use client"

import { useState } from "react"
import { Plus, AlertCircle, Code2, FileCode, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface AddComponentModalProps {
  onComponentCreated?: () => void
}

const ICON_OPTIONS = [
  { value: "Type", label: "Texto" },
  { value: "Image", label: "Imagen" },
  { value: "LayoutGrid", label: "Grid" },
  { value: "Mail", label: "Correo" },
  { value: "SplitSquareHorizontal", label: "Split" },
  { value: "Box", label: "Caja" },
  { value: "Columns", label: "Columnas" },
  { value: "List", label: "Lista" },
  { value: "Video", label: "Video" },
  { value: "Quote", label: "Cita" },
  { value: "MapPin", label: "Mapa" },
  { value: "Users", label: "Usuarios" },
  { value: "Star", label: "Estrella" },
  { value: "ShoppingCart", label: "Carrito" },
]

const CATEGORY_OPTIONS = [
  { value: "basics", label: "Básicos" },
  { value: "layout", label: "Layout" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "media", label: "Media" },
]

export function AddComponentModal({ onComponentCreated }: AddComponentModalProps) {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    icon: "Box",
    category: "basics",
  })

  // Convertir label a nombre técnico (snake_case)
  const generateTechnicalName = (label: string): string => {
    return label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
  }

  const handleLabelChange = (label: string) => {
    setFormData(prev => ({
      ...prev,
      label,
      name: generateTechnicalName(label),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    // Validations
    if (!formData.name || !formData.label) {
      setError("El nombre y label son requeridos")
      return
    }
    
    if (!/^[a-z][a-z0-9_]*$/.test(formData.name)) {
      setError("El nombre técnico debe comenzar con letra y solo contener letras, números y guiones bajos")
      return
    }
    
    setIsCreating(true)
    
    try {
      const response = await fetch("/api/admin/components/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        setError(result.error || "Error al crear el componente")
        return
      }
      
      setSuccess(true)
      onComponentCreated?.()
      
      // Reset form after success
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setFormData({
          name: "",
          label: "",
          description: "",
          icon: "Box",
          category: "basics",
        })
      }, 2000)
      
    } catch (err) {
      setError("Error de conexión al crear el componente")
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Componente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Crear Nuevo Componente
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo componente seguro para el Page Builder. 
            Se generará un archivo de plantilla que puedes personalizar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <Code2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Componente creado exitosamente. Ahora puedes sincronizarlo a la base de datos.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="label">Nombre del Componente</Label>
            <Input
              id="label"
              placeholder="Ej: Banner Promocional"
              value={formData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              disabled={isCreating || success}
            />
            {formData.name && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                Nombre técnico: <Badge variant="outline" className="font-mono">{formData.name}</Badge>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Técnico (editar si es necesario)</Label>
            <Input
              id="name"
              placeholder="ej: banner_promocional"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="font-mono"
              disabled={isCreating || success}
            />
            <p className="text-xs text-muted-foreground">
              Solo letras minúsculas, números y guiones bajos. Debe comenzar con letra.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe qué hace este componente..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              disabled={isCreating || success}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icono</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                disabled={isCreating || success}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar icono" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={isCreating || success}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Alert>
            <Code2 className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Seguridad:</strong> El componente se creará con una plantilla base segura. 
              Los archivos generados incluirán validación Zod y solo aceptarán 
              contenido que cumpla con el schema definido.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || success}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Componente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
