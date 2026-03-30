"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import useSWR from "swr"
import {
  fetchProducts,
  createProduct,
  updateProduct,
  type ProductPayload,
} from "@/lib/products"
import { createProductPrice } from "@/lib/products"
import type { Product } from "@/lib/types"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Star,
  ImageIcon,
  Upload,
  X,
  FileVideo,
  DollarSign,
  Sliders,
  Layers,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AttributeType {
  id: string
  name: string
  display_name: string
  type: 'select' | 'color' | 'text' | 'number'
}

interface AttributeValue {
  name: string
  hex?: string // Para colores
  unit?: string // Para peso (g, kg)
}

interface ProductAttribute {
  id?: string
  attribute_type_id: string
  values: AttributeValue[]
  _deleted?: boolean
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  stock: string
  weight: string
  is_active: boolean
  is_featured: boolean
}

interface PriceFormData {
  amount: string
  is_active: boolean
}

interface MediaFile {
  file: File
  preview: string
  type: "image" | "video"
}

interface ExistingMedia {
  id: string
  url: string
  media_type: string
  file_name: string
  storage_path: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

function getMediaUrl(media: { url?: string | null; storage_path?: string | null }): string {
  if (media.url) return media.url
  if (media.storage_path) {
    return `${SUPABASE_URL}/storage/v1/object/public/storage/${media.storage_path}`
  }
  return "/images/placeholder.svg"
}

function PesoInput({ onAdd }: { onAdd: (name: string, unit: string) => void }) {
  const [value, setValue] = useState("")
  const [unit, setUnit] = useState("g")

  const handleAdd = () => {
    if (value) {
      onAdd(value, unit)
      setValue("")
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Valor (500, 1, 2...)"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleAdd()
          }
        }}
      />
      <Select value={unit} onValueChange={setUnit}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="g">g</SelectItem>
          <SelectItem value="kg">kg</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" size="sm" onClick={handleAdd}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

function emptyForm(): ProductFormData {
  return {
    name: "",
    slug: "",
    description: "",
    short_description: "",
    sku: "",
    stock: "0",
    weight: "",
    is_active: true,
    is_featured: false,
  }
}

function productToForm(p: Product): ProductFormData {
  return {
    name: p.name,
    slug: p.slug ?? "",
    description: p.description,
    short_description: (p as any).short_description ?? "",
    sku: (p as any).sku ?? "",
    stock: String(p.stock),
    weight: (p as any).weight ? String((p as any).weight) : "",
    is_active: (p as any).is_active ?? true,
    is_featured: (p as any).is_featured ?? false,
  }
}

function formToPayload(f: ProductFormData): ProductPayload {
  return {
    name: f.name,
    slug: f.slug || f.name.toLowerCase().replace(/\s+/g, "-"),
    description: f.description,
    short_description: f.short_description || undefined,
    sku: f.sku || undefined,
    stock: Number(f.stock) || 0,
    weight: f.weight ? Number(f.weight) : undefined,
    is_active: f.is_active,
    is_featured: f.is_featured,
    stars: 0,
    reviews: 0,
  }
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AdminProductsPage() {
  const { data: products, isLoading, mutate } = useSWR("admin-products", fetchProducts, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    dedupingInterval: 0,
  })

  // Attribute types from DB
  const [attributeTypes, setAttributeTypes] = useState<AttributeType[]>([])

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [price, setPrice] = useState<PriceFormData>({ amount: "0", is_active: true })
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load attribute types on mount
  useEffect(() => {
    const loadAttributeTypes = async () => {
      const { data } = await supabase
        .from("attribute_types")
        .select("*")
        .order("display_name")
      if (data) setAttributeTypes(data)
    }
    loadAttributeTypes()
  }, [])

  const filteredProducts = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleField = useCallback(
    (field: keyof ProductFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | boolean) => {
        if (typeof e === "boolean") {
          setForm((prev) => ({ ...prev, [field]: e }))
          return
        }
        const value = e.target.value
        setForm((prev) => {
          if (field === "name") {
            const generated = value.toLowerCase().trim().replace(/\s+/g, "-")
            return { ...prev, name: value, slug: generated }
          }
          return { ...prev, [field]: value }
        })
      },
    []
  )

  const handlePriceField = useCallback(
    (field: keyof PriceFormData) =>
      (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
        setPrice((prev) => {
          if (field === "is_active") {
            return { ...prev, is_active: Boolean(e) }
          }
          const value = (e as React.ChangeEvent<HTMLInputElement>).target.value
          return { ...prev, [field]: value }
        })
      },
    []
  )

  // Attribute handlers
  const addAttribute = () => {
    if (attributeTypes.length === 0) return
    setAttributes((prev) => [
      ...prev,
      { attribute_type_id: attributeTypes[0].id, values: [] },
    ])
  }

  const removeAttribute = (index: number) => {
    setAttributes((prev) => {
      const attr = prev[index]
      if (attr.id) {
        const copy = [...prev]
        copy[index] = { ...copy[index], _deleted: true }
        return copy
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateAttributeType = (index: number, typeId: string) => {
    setAttributes((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], attribute_type_id: typeId }
      return copy
    })
  }

  const addAttributeValue = (index: number, value: AttributeValue) => {
    setAttributes((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], values: [...copy[index].values, value] }
      return copy
    })
  }

  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    setAttributes((prev) => {
      const copy = [...prev]
      copy[attrIndex] = { 
        ...copy[attrIndex], 
        values: copy[attrIndex].values.filter((_, i) => i !== valueIndex) 
      }
      return copy
    })
  }

  const updateAttributeValue = (attrIndex: number, valueIndex: number, updatedValue: Partial<AttributeValue>) => {
    setAttributes((prev) => {
      const copy = [...prev]
      const values = [...copy[attrIndex].values]
      values[valueIndex] = { ...values[valueIndex], ...updatedValue }
      copy[attrIndex] = { ...copy[attrIndex], values }
      return copy
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newMediaFiles: MediaFile[] = []
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      if (isVideo || isImage) {
        newMediaFiles.push({
          file,
          preview: URL.createObjectURL(file),
          type: isVideo ? "video" : "image",
        })
      }
    })

    setMediaFiles((prev) => [...prev, ...newMediaFiles])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => {
      const removed = prev[index]
      URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeExistingMedia = async (media: ExistingMedia) => {
    try {
      const response = await fetch("/api/upload-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          storagePath: media.storage_path,
        }),
      })

      if (response.ok) {
        setExistingMedia((prev) => prev.filter((m) => m.id !== media.id))
      }
    } catch (err) {
      console.error("Delete media error:", err)
    }
  }

  const uploadMediaFiles = async (productId: string) => {
    if (mediaFiles.length === 0) return

    setUploadingMedia(true)

    for (let i = 0; i < mediaFiles.length; i++) {
      const mediaFile = mediaFiles[i]
      const ext = mediaFile.file.name.split(".").pop() || "jpg"
      const fileName = `${i + 1 + existingMedia.length}.${ext}`

      const formData = new FormData()
      formData.append("file", mediaFile.file)
      formData.append("product_id", productId)
      formData.append("file_name", fileName)
      formData.append("position", String(existingMedia.length + i + 1))
      formData.append("is_primary", String(existingMedia.length === 0 && i === 0))

      try {
        const response = await fetch("/api/upload-media", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Upload error:", errorData.error)
        }
      } catch (err) {
        console.error("Upload error:", err)
      }
    }

    setUploadingMedia(false)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyForm())
    setPrice({ amount: "0", is_active: true })
    setAttributes([])
    setMediaFiles([])
    setExistingMedia([])
    setDialogOpen(true)
  }

  const openEdit = async (product: Product) => {
    setDialogOpen(true)
    
    // Fetch fresh product data directly from DB to avoid cache issues
    const { data: freshProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", product.id)
      .single()
    
    // Get fresh price
    const { data: priceData } = await supabase
      .from("product_prices")
      .select("amount, is_active")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    const productData = freshProduct || product
    setEditingProduct({ ...product, description: productData.description })
    setForm({
      name: productData.name || "",
      slug: productData.slug || "",
      description: productData.description || "",
      short_description: productData.short_description || "",
      sku: productData.sku || "",
      stock: String(productData.stock || 0),
      weight: productData.weight ? String(productData.weight) : "",
      is_active: productData.is_active ?? true,
      is_featured: productData.is_featured ?? false,
    })
    setPrice({ 
      amount: String(priceData?.amount ?? product.priceCOP ?? product.price ?? 0), 
      is_active: priceData?.is_active ?? true 
    })

    // Load attributes
    const { data: attrData } = await supabase
      .from("product_attributes")
      .select("id, attribute_type_id, values")
      .eq("product_id", product.id)

    if (attrData) {
      setAttributes(attrData.map((a) => ({
        id: a.id,
        attribute_type_id: a.attribute_type_id,
        values: a.values || [],
      })))
    } else {
      setAttributes([])
    }

    // Load existing media
    const { data: mediaData } = await supabase
      .from("product_media")
      .select("id, url, media_type, file_name, storage_path")
      .eq("product_id", product.id)
      .order("position")

    setExistingMedia(mediaData || [])
    setMediaFiles([])
  }

  const openDelete = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = formToPayload(form)

      let savedProduct: Product | null = null
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, payload)
      } else {
        savedProduct = await createProduct(payload)
      }

      if (savedProduct) {
        // Create/update price
        const amountNum = Number(price.amount) || 0
        await createProductPrice({
          product_id: savedProduct.id,
          amount: amountNum,
          is_active: price.is_active,
        })

        // Handle attributes
        for (const attr of attributes) {
          if (attr._deleted && attr.id) {
            await supabase.from("product_attributes").delete().eq("id", attr.id)
            continue
          }
          if (attr._deleted) continue

          if (attr.id) {
            await supabase
              .from("product_attributes")
              .update({ values: attr.values })
              .eq("id", attr.id)
          } else {
            await supabase.from("product_attributes").insert({
              product_id: savedProduct.id,
              attribute_type_id: attr.attribute_type_id,
              values: attr.values,
            })
          }
        }

        // Upload media files
        await uploadMediaFiles(savedProduct.id)
      }

      setDialogOpen(false)
      setTimeout(() => mutate(), 100)
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    setDeleting(true)

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: deletingProduct.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Delete error:", errorData.error)
      }

      setDeleteDialogOpen(false)
      setDeletingProduct(null)
      setTimeout(() => mutate(), 100)
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setDeleting(false)
    }
  }

  const getAttributeTypeName = (id: string) => {
    return attributeTypes.find((t) => t.id === id)?.display_name || "Atributo"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra tu catalogo de productos.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-xs font-semibold">Nombre</TableHead>
              <TableHead className="text-xs font-semibold">SKU</TableHead>
              <TableHead className="text-xs font-semibold text-right">Precio</TableHead>
              <TableHead className="text-xs font-semibold text-center">Stock</TableHead>
              <TableHead className="text-xs font-semibold text-center">Estado</TableHead>
              <TableHead className="text-xs font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Cargando productos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">
                      {search ? "No se encontraron productos." : "Aun no hay productos."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell className="w-12">
                    {product.media?.[0] ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                        <Image
                          src={getMediaUrl(product.media[0])}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {product.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {(product as any).sku || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    ${product.price.toLocaleString("es-CO")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={(product as any).is_active !== false ? "default" : "secondary"}>
                      {(product as any).is_active !== false ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDelete(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filteredProducts.length} de {products?.length ?? 0} producto(s)
        </p>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Precio</span>
                </TabsTrigger>
                <TabsTrigger value="attributes" className="gap-2">
                  <Sliders className="h-4 w-4" />
                  <span className="hidden sm:inline">Atributos</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[60vh]">
              {/* General Tab */}
              <TabsContent value="general" className="p-6 pt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del producto *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={handleField("name")}
                      placeholder="Ej: Camiseta deportiva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={handleField("slug")}
                      placeholder="camiseta-deportiva"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={form.sku}
                      onChange={handleField("sku")}
                      placeholder="CAM-DEP-001"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleField("stock")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Descripcion corta</Label>
                  <Input
                    id="short_description"
                    value={form.short_description}
                    onChange={handleField("short_description")}
                    placeholder="Resumen breve del producto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripcion completa *</Label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(val) => setForm(prev => ({ ...prev, description: val }))}
                    placeholder="Describe las caracteristicas del producto..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={form.weight}
                      onChange={handleField("weight")}
                      placeholder="0.5"
                    />
                  </div>
                  <div className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <Label>Producto activo</Label>
                      <Switch
                        checked={form.is_active}
                        onCheckedChange={(v) => handleField("is_active")(v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Producto destacado</Label>
                      <Switch
                        checked={form.is_featured}
                        onCheckedChange={(v) => handleField("is_featured")(v)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="p-6 pt-4 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">Precio del producto</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price-amount">Precio (COP)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="price-amount"
                            type="number"
                            value={price.amount}
                            onChange={handlePriceField("amount")}
                            className="pl-7"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Estado del precio</Label>
                        <div className="flex items-center gap-3 h-10">
                          <Switch
                            checked={price.is_active}
                            onCheckedChange={(v) => handlePriceField("is_active")(v)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {price.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attributes Tab */}
              <TabsContent value="attributes" className="p-6 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Atributos del producto</h3>
                    <p className="text-sm text-muted-foreground">
                      Agrega colores, tallas, materiales u otras caracteristicas
                    </p>
                  </div>
                  <Button onClick={addAttribute} size="sm" variant="outline" className="gap-2" disabled={attributeTypes.length === 0}>
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                {attributeTypes.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Layers className="h-10 w-10 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No hay tipos de atributos configurados.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ejecuta el SQL para crear los tipos de atributos primero.
                      </p>
                    </CardContent>
                  </Card>
                ) : attributes.filter((a) => !a._deleted).length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Sliders className="h-10 w-10 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No hay atributos configurados
                      </p>
                      <Button onClick={addAttribute} variant="link" size="sm" className="mt-2">
                        Agregar primer atributo
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {attributes.filter((a) => !a._deleted).map((attr, idx) => {
                      const actualIdx = attributes.findIndex((a) => a === attr)
                      const attrType = attributeTypes.find((t) => t.id === attr.attribute_type_id)
                      const isColor = attrType?.name === "color"
                      const isPeso = attrType?.name === "peso"

                      return (
                        <Card key={attr.id || idx}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{attrType?.display_name || "Atributo"}</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeAttribute(actualIdx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Tipo de atributo</Label>
                                <Select
                                  value={attr.attribute_type_id}
                                  onValueChange={(v) => updateAttributeType(actualIdx, v)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {attributeTypes.map((type) => (
                                      <SelectItem key={type.id} value={type.id}>
                                        {type.display_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Valores existentes */}
                              {attr.values.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-xs">Valores agregados</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {attr.values.map((val, valIdx) => (
                                      <div key={valIdx} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                                        {isColor && val.hex && (
                                          <div 
                                            className="w-4 h-4 rounded-full border border-border" 
                                            style={{ backgroundColor: val.hex }}
                                          />
                                        )}
                                        <span className="text-sm">
                                          {val.name}{val.unit ? ` ${val.unit}` : ""}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => removeAttributeValue(actualIdx, valIdx)}
                                          className="ml-1 text-muted-foreground hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Agregar nuevo valor segun tipo */}
                              <div className="border-t pt-3 mt-3">
                                <Label className="text-xs mb-2 block">Agregar valor</Label>
                                {isColor ? (
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Nombre del color (Rojo, Azul...)"
                                      id={`color-name-${actualIdx}`}
                                      className="flex-1"
                                    />
                                    <input
                                      type="color"
                                      id={`color-hex-${actualIdx}`}
                                      className="w-12 h-9 rounded border cursor-pointer"
                                      defaultValue="#000000"
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => {
                                        const nameEl = document.getElementById(`color-name-${actualIdx}`) as HTMLInputElement
                                        const hexEl = document.getElementById(`color-hex-${actualIdx}`) as HTMLInputElement
                                        if (nameEl?.value) {
                                          addAttributeValue(actualIdx, { name: nameEl.value, hex: hexEl?.value || "#000000" })
                                          nameEl.value = ""
                                        }
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : isPeso ? (
                                  <PesoInput onAdd={(name, unit) => addAttributeValue(actualIdx, { name, unit })} />
                                ) : (
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder={`Agregar ${attrType?.display_name?.toLowerCase() || "valor"}...`}
                                      id={`attr-value-${actualIdx}`}
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault()
                                          const el = e.target as HTMLInputElement
                                          if (el.value) {
                                            addAttributeValue(actualIdx, { name: el.value })
                                            el.value = ""
                                          }
                                        }
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => {
                                        const el = document.getElementById(`attr-value-${actualIdx}`) as HTMLInputElement
                                        if (el?.value) {
                                          addAttributeValue(actualIdx, { name: el.value })
                                          el.value = ""
                                        }
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="p-6 pt-4 space-y-4">
                <div>
                  <h3 className="font-medium">Imagenes y Videos</h3>
                  <p className="text-sm text-muted-foreground">Sube imagenes y videos del producto</p>
                </div>

                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium">Haz clic para subir archivos</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imagenes (JPG, PNG, WebP) o Videos (MP4, MOV)
                  </p>
                </div>

                {existingMedia.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Archivos actuales</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {existingMedia.map((media) => (
                        <div key={media.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                            {media.media_type === "video" ? (
                              <video 
                                src={getMediaUrl(media)} 
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <Image src={getMediaUrl(media)} alt={media.file_name || "Producto"} fill className="object-cover" sizes="150px" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingMedia(media)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mediaFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Nuevos archivos ({mediaFiles.length})</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaFiles.map((media, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                            {media.type === "video" ? (
                              <video src={media.preview} className="w-full h-full object-cover" />
                            ) : (
                              <Image src={media.preview} alt={`Preview ${index + 1}`} fill className="object-cover" sizes="150px" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving || uploadingMedia}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || uploadingMedia || !form.name.trim()} className="min-w-[140px]">
              {(saving || uploadingMedia) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingMedia ? "Subiendo..." : saving ? "Guardando..." : editingProduct ? "Guardar" : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente el producto
              <strong className="mx-1">{deletingProduct?.name}</strong>
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
