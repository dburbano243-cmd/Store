"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface NavLink {
  id: string
  label: string
  href: string
}

interface NavbarConfig {
  logo_text: string
  logo_url: string
  links: NavLink[]
  show_cart: boolean
  show_auth: boolean
}

const DEFAULT_CONFIG: NavbarConfig = {
  logo_text: "Mi Tienda",
  logo_url: "",
  links: [
    { id: "1", label: "Inicio", href: "/" },
    { id: "2", label: "Productos", href: "/productos" },
  ],
  show_cart: true,
  show_auth: true,
}

export function NavbarEditor() {
  const [config, setConfig] = useState<NavbarConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("navbar_config")
        .limit(1)
        .single()

      if (data?.navbar_config) {
        setConfig(data.navbar_config as NavbarConfig)
      }
    } catch (error) {
      console.error("Error loading navbar config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .single()

      if (existing) {
        await supabase
          .from("site_settings")
          .update({ navbar_config: config, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      } else {
        await supabase.from("site_settings").insert({ navbar_config: config })
      }

      toast({ title: "Guardado", description: "Configuración del navbar guardada correctamente." })
    } catch (error) {
      console.error("Error saving navbar config:", error)
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const addLink = () => {
    setConfig({
      ...config,
      links: [...config.links, { id: Date.now().toString(), label: "Nuevo enlace", href: "/" }],
    })
  }

  const removeLink = (id: string) => {
    setConfig({ ...config, links: config.links.filter((l) => l.id !== id) })
  }

  const updateLink = (id: string, field: keyof NavLink, value: string) => {
    setConfig({
      ...config,
      links: config.links.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configuración del Navbar</h2>
          <p className="text-sm text-muted-foreground">Personaliza la barra de navegación de tu sitio</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Configura el logo o texto del navbar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Texto del Logo</Label>
              <Input
                value={config.logo_text}
                onChange={(e) => setConfig({ ...config, logo_text: e.target.value })}
                placeholder="Mi Tienda"
              />
            </div>
            <div className="space-y-2">
              <Label>URL del Logo (imagen)</Label>
              <Input
                value={config.logo_url}
                onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">Deja vacío para usar solo texto</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opciones</CardTitle>
            <CardDescription>Elementos adicionales del navbar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mostrar carrito</Label>
              <input
                type="checkbox"
                checked={config.show_cart}
                onChange={(e) => setConfig({ ...config, show_cart: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar botón de login</Label>
              <input
                type="checkbox"
                checked={config.show_auth}
                onChange={(e) => setConfig({ ...config, show_auth: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Enlaces de Navegación</CardTitle>
            <CardDescription>Agrega y ordena los enlaces del menú</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addLink}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar enlace
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {config.links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 rounded-lg border p-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    value={link.label}
                    onChange={(e) => updateLink(link.id, "label", e.target.value)}
                    placeholder="Etiqueta"
                  />
                  <Input
                    value={link.href}
                    onChange={(e) => updateLink(link.id, "href", e.target.value)}
                    placeholder="/ruta"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLink(link.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {config.links.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No hay enlaces. Agrega uno para comenzar.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
