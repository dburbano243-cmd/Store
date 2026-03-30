"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface FooterLink {
  id: string
  label: string
  href: string
}

interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
}

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface FooterConfig {
  company_name: string
  description: string
  columns: FooterColumn[]
  social_links: SocialLink[]
  copyright_text: string
  show_newsletter: boolean
}

const DEFAULT_CONFIG: FooterConfig = {
  company_name: "Mi Tienda",
  description: "Tu tienda de confianza para productos de calidad.",
  columns: [
    {
      id: "1",
      title: "Tienda",
      links: [
        { id: "1-1", label: "Productos", href: "/productos" },
        { id: "1-2", label: "Categorías", href: "/categorias" },
      ],
    },
    {
      id: "2",
      title: "Ayuda",
      links: [
        { id: "2-1", label: "Contacto", href: "/contacto" },
        { id: "2-2", label: "Envíos", href: "/envios" },
      ],
    },
  ],
  social_links: [],
  copyright_text: "© 2024 Mi Tienda. Todos los derechos reservados.",
  show_newsletter: false,
}

export function FooterEditor() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_CONFIG)
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
        .select("footer_config")
        .limit(1)
        .single()

      if (data?.footer_config) {
        setConfig(data.footer_config as FooterConfig)
      }
    } catch (error) {
      console.error("Error loading footer config:", error)
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
          .update({ footer_config: config, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      } else {
        await supabase.from("site_settings").insert({ footer_config: config })
      }

      toast({ title: "Guardado", description: "Configuración del footer guardada correctamente." })
    } catch (error) {
      console.error("Error saving footer config:", error)
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const addColumn = () => {
    setConfig({
      ...config,
      columns: [...config.columns, { id: Date.now().toString(), title: "Nueva Sección", links: [] }],
    })
  }

  const removeColumn = (id: string) => {
    setConfig({ ...config, columns: config.columns.filter((c) => c.id !== id) })
  }

  const updateColumnTitle = (id: string, title: string) => {
    setConfig({
      ...config,
      columns: config.columns.map((c) => (c.id === id ? { ...c, title } : c)),
    })
  }

  const addLinkToColumn = (columnId: string) => {
    setConfig({
      ...config,
      columns: config.columns.map((c) =>
        c.id === columnId
          ? { ...c, links: [...c.links, { id: Date.now().toString(), label: "Nuevo enlace", href: "/" }] }
          : c
      ),
    })
  }

  const removeLinkFromColumn = (columnId: string, linkId: string) => {
    setConfig({
      ...config,
      columns: config.columns.map((c) =>
        c.id === columnId ? { ...c, links: c.links.filter((l) => l.id !== linkId) } : c
      ),
    })
  }

  const updateColumnLink = (columnId: string, linkId: string, field: keyof FooterLink, value: string) => {
    setConfig({
      ...config,
      columns: config.columns.map((c) =>
        c.id === columnId
          ? { ...c, links: c.links.map((l) => (l.id === linkId ? { ...l, [field]: value } : l)) }
          : c
      ),
    })
  }

  const addSocialLink = () => {
    setConfig({
      ...config,
      social_links: [...config.social_links, { id: Date.now().toString(), platform: "facebook", url: "" }],
    })
  }

  const removeSocialLink = (id: string) => {
    setConfig({ ...config, social_links: config.social_links.filter((s) => s.id !== id) })
  }

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setConfig({
      ...config,
      social_links: config.social_links.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
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
          <h2 className="text-xl font-semibold">Configuración del Footer</h2>
          <p className="text-sm text-muted-foreground">Personaliza el pie de página de tu sitio</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la Empresa</Label>
              <Input
                value={config.company_name}
                onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Texto de Copyright</Label>
              <Input
                value={config.copyright_text}
                onChange={(e) => setConfig({ ...config, copyright_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Redes Sociales</CardTitle>
            <Button variant="outline" size="sm" onClick={addSocialLink}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.social_links.map((social) => (
                <div key={social.id} className="flex items-center gap-2">
                  <select
                    value={social.platform}
                    onChange={(e) => updateSocialLink(social.id, "platform", e.target.value)}
                    className="h-10 rounded-md border px-3 text-sm"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <Input
                    value={social.url}
                    onChange={(e) => updateSocialLink(social.id, "url", e.target.value)}
                    placeholder="URL del perfil"
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeSocialLink(social.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {config.social_links.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-2">Sin redes sociales</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Columnas de Enlaces</CardTitle>
            <CardDescription>Organiza los enlaces en columnas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addColumn}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Columna
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {config.columns.map((column) => (
              <div key={column.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={column.title}
                    onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                    className="font-semibold"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeColumn(column.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {column.links.map((link) => (
                    <div key={link.id} className="flex items-center gap-2">
                      <Input
                        value={link.label}
                        onChange={(e) => updateColumnLink(column.id, link.id, "label", e.target.value)}
                        placeholder="Etiqueta"
                        className="flex-1 text-sm"
                      />
                      <Input
                        value={link.href}
                        onChange={(e) => updateColumnLink(column.id, link.id, "href", e.target.value)}
                        placeholder="/ruta"
                        className="flex-1 text-sm"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLinkFromColumn(column.id, link.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => addLinkToColumn(column.id)}>
                  <Plus className="mr-2 h-3 w-3" />
                  Agregar enlace
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
