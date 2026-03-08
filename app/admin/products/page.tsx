"use client"

import React, { useState, useCallback, useRef } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Tag,
  BarChart3,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

/* ------------------------------------------------------------------ */
/*  Types and helpers                                                  */
/* ------------------------------------------------------------------ */

interface ProductFormData {
  name: string
  slug: string
  description: string
  stock: string
  stars: string
  reviews: string
}

interface PriceFormData {
  amount: string
  is_active: boolean
}

interface DiscountForm {
  id?: string  // If exists, it's an existing discount to update
  discount_amount: string
  discount_percent: string
  start_at: string
  end_at: string
  metadata_units: string
  is_active: boolean
  _deleted?: boolean  // Mark for deletion
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

function emptyForm(): ProductFormData {
  return {
    name: "",
    slug: "",
    description: "",
    stock: "0",
    stars: "0",
    reviews: "0",
  }
}

function productToForm(p: Product): ProductFormData {
  return {
    name: p.name,
    slug: p.slug ?? "",
    description: p.description,
    stock: String(p.stock),
    stars: String(p.stars),
    reviews: String(p.reviews),
  }
}

function formToPayload(f: ProductFormData): ProductPayload {
  return {
    name: f.name,
    slug: f.slug || f.name.toLowerCase().replace(/\s+/g, "-"),
    description: f.description,
    stock: Number(f.stock) || 0,
    stars: Number(f.stars) || 0,
    reviews: Number(f.reviews) || 0,
  }
}

// Helper to format timestamp from DB to datetime-local input format
function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    // Format: YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16)
  } catch {
    return ""
  }
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AdminProductsPage() {
  const { data: products, isLoading, mutate } = useSWR("admin-products", fetchProducts)

  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [price, setPrice] = useState<PriceFormData>({ amount: "0", is_active: true })
  const [discounts, setDiscounts] = useState<DiscountForm[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProducts = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleField = useCallback(
    (field: keyof ProductFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleDiscountField = useCallback(
    (index: number, field: keyof DiscountForm) =>
      (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
        setDiscounts((prev) => {
          const copy = [...prev]
          if (field === "is_active") {
            copy[index] = { ...copy[index], is_active: Boolean(e) }
          } else {
            const value = (e as React.ChangeEvent<HTMLInputElement>).target.value
            copy[index] = { ...copy[index], [field]: value }
          }
          return copy
        })
      },
    []
  )

  const addDiscountRow = () => {
    setDiscounts((prev) => [
      ...prev,
      { discount_amount: "0", discount_percent: "", start_at: "", end_at: "", metadata_units: "0", is_active: true },
    ])
  }

  const removeDiscountRow = (index: number) => {
    setDiscounts((prev) => {
      const discount = prev[index]
      // If it has an ID, mark for deletion instead of removing from array
      if (discount.id) {
        const copy = [...prev]
        copy[index] = { ...copy[index], _deleted: true }
        return copy
      }
      // If it's a new discount (no ID), just remove it
      return prev.filter((_, i) => i !== index)
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
    setDiscounts([])
    setMediaFiles([])
    setExistingMedia([])
    setDialogOpen(true)
  }

  const openEdit = async (product: Product) => {
    setEditingProduct(product)
    setForm(productToForm(product))
    
    // Load price (all prices in COP)
    setPrice({ amount: String(product.priceCOP ?? product.price ?? 0), is_active: true })

    // Load discounts
    if (product.discounts && product.discounts.length > 0) {
      const ds = product.discounts.map((d: any) => ({
        id: d.id,  // Keep the ID to know if it's existing
        discount_amount: d.discount_amount ? String(d.discount_amount) : "",
        discount_percent: d.discount_percent ? String(d.discount_percent) : "",
        start_at: formatDateForInput(d.start_at),
        end_at: formatDateForInput(d.end_at),
        metadata_units: d.metadata?.units ? String(d.metadata.units) : "0",
        is_active: Boolean(d.is_active),
        _deleted: false,
      }))
      setDiscounts(ds)
    } else {
      setDiscounts([])
    }

    // Load existing media
    const { data: mediaData } = await supabase
      .from("product_media")
      .select("id, url, media_type, file_name, storage_path")
      .eq("product_id", product.id)
      .order("position")

    setExistingMedia(mediaData || [])
    setMediaFiles([])
    setDialogOpen(true)
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
        // Create/update price (all prices in COP)
        const amountNum = Number(price.amount) || 0
        await createProductPrice({
          product_id: savedProduct.id,
          amount: amountNum,
          is_active: price.is_active,
        })

        // Handle discounts using admin API (bypasses RLS)
        for (const d of discounts) {
          const discAmount = d.discount_amount ? Number(d.discount_amount) : null
          const discPercent = d.discount_percent ? Number(d.discount_percent) : null
          const metadata = { units: Number(d.metadata_units || 0) }
          
          // If marked for deletion
          if (d._deleted && d.id) {
            await fetch("/api/admin/discounts", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: d.id }),
            })
            continue
          }
          
          // Skip deleted items
          if (d._deleted) continue
          
          // If has ID, update existing
          if (d.id) {
            await fetch("/api/admin/discounts", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: d.id,
                discount_amount: discAmount,
                discount_percent: discPercent,
                start_at: d.start_at || undefined,
                end_at: d.end_at || undefined,
                metadata,
                is_active: d.is_active,
              }),
            })
          } else {
            // Create new
            await fetch("/api/admin/discounts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                product_id: savedProduct.id,
                discount_amount: discAmount,
                discount_percent: discPercent,
                start_at: d.start_at || undefined,
                end_at: d.end_at || undefined,
                metadata,
                is_active: d.is_active,
              }),
            })
          }
        }

        // Upload media files
        await uploadMediaFiles(savedProduct.id)
      }

      setDialogOpen(false)
      // Delay mutate to avoid race condition with auth token
      setTimeout(() => {
        mutate()
      }, 100)
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
      // Use admin API to delete product (bypasses RLS)
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
      setTimeout(() => {
        mutate()
      }, 100)
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setDeleting(false)
    }
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
              <TableHead className="text-xs font-semibold text-muted-foreground w-12"></TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Slug</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Precio</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Stock</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Rating</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Acciones</TableHead>
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
                      {search
                        ? "No se encontraron productos con esa busqueda."
                        : "Aun no hay productos. Crea el primero."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell className="w-12">
                    {product.media?.[0]?.url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
                        <Image
                          src={product.media[1]?.url || product.media[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {product.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {product.slug ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    ${product.price.toLocaleString("es-CO")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={product.stock > 0 ? "default" : "destructive"}
                      className="tabular-nums"
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      {product.stars}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(product)}
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDelete(product)}
                        aria-label={`Eliminar ${product.name}`}
                      >
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

      {/* Product count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filteredProducts.length} de {products?.length ?? 0} producto(s)
        </p>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-0">
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
                <TabsTrigger value="discounts" className="gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Descuentos</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* General Tab */}
            <TabsContent value="general" className="p-6 pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto</Label>
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

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={handleField("description")}
                  placeholder="Describe las caracteristicas del producto..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="stock" className="text-xs text-muted-foreground">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={form.stock}
                          onChange={handleField("stock")}
                          className="h-8 mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="stars" className="text-xs text-muted-foreground">Estrellas</Label>
                        <Input
                          id="stars"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={form.stars}
                          onChange={handleField("stars")}
                          className="h-8 mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="reviews" className="text-xs text-muted-foreground">Reviews</Label>
                        <Input
                          id="reviews"
                          type="number"
                          value={form.reviews}
                          onChange={handleField("reviews")}
                          className="h-8 mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="price-amount">Monto</Label>
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
                      <Label htmlFor="price-currency">Moneda</Label>
                      <Input
                        id="price-currency"
                        value={price.currency_code}
                        onChange={handlePriceField("currency_code")}
                        placeholder="COP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
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

            {/* Discounts Tab */}
            <TabsContent value="discounts" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Descuentos</h3>
                  <p className="text-sm text-muted-foreground">Configura descuentos para este producto</p>
                </div>
                <Button onClick={addDiscountRow} size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {discounts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Tag className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No hay descuentos configurados</p>
                    <Button onClick={addDiscountRow} variant="link" size="sm" className="mt-2">
                      Agregar primer descuento
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {discounts.filter(d => !d._deleted).map((d, idx) => {
                    // Find the actual index in the original array
                    const actualIdx = discounts.findIndex(disc => disc === d)
                    return (
                    <Card key={d.id || idx}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium">Descuento {idx + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeDiscountRow(actualIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Porcentaje (%)</Label>
                            <Input
                              type="number"
                              value={d.discount_percent}
                              onChange={handleDiscountField(actualIdx, "discount_percent")}
                              placeholder="10"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Monto fijo</Label>
                            <Input
                              type="number"
                              value={d.discount_amount}
                              onChange={handleDiscountField(actualIdx, "discount_amount")}
                              placeholder="5000"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Moneda</Label>
                            <Input
                              value={d.currency_code}
                              onChange={handleDiscountField(actualIdx, "currency_code")}
                              placeholder="COP"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fecha inicio</Label>
                            <Input
                              type="datetime-local"
                              value={d.start_at}
                              onChange={handleDiscountField(actualIdx, "start_at")}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fecha fin</Label>
                            <Input
                              type="datetime-local"
                              value={d.end_at}
                              onChange={handleDiscountField(actualIdx, "end_at")}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Estado</Label>
                            <div className="flex items-center gap-2 h-10">
                              <Switch
                                checked={d.is_active}
                                onCheckedChange={(v) => handleDiscountField(actualIdx, "is_active")(v)}
                              />
                              <span className="text-xs text-muted-foreground">
                                {d.is_active ? "Activo" : "Inactivo"}
                              </span>
                            </div>
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

              {/* Upload area */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
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

              {/* Existing media */}
              {existingMedia.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Archivos actuales</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {existingMedia.map((media) => (
                      <div key={media.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                          {media.media_type === "video" ? (
                            <div className="flex items-center justify-center h-full">
                              <FileVideo className="h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <Image
                              src={media.url}
                              alt={media.file_name}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(media)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{media.file_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New files to upload */}
              {mediaFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Nuevos archivos ({mediaFiles.length})</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                          {media.type === "video" ? (
                            <video src={media.preview} className="w-full h-full object-cover" />
                          ) : (
                            <Image
                              src={media.preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMediaFile(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1 mt-1">
                          {media.type === "video" ? (
                            <FileVideo className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ImageIcon className="h-3 w-3 text-muted-foreground" />
                          )}
                          <p className="text-xs text-muted-foreground truncate">{media.file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving || uploadingMedia}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || uploadingMedia || !form.name.trim()}
              className="min-w-[140px]"
            >
              {(saving || uploadingMedia) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingMedia ? "Subiendo media..." : saving ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
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
              {"Esta accion no se puede deshacer. Se eliminara permanentemente "}
              <span className="font-semibold text-foreground">
                {deletingProduct?.name}
              </span>
              {" del catalogo junto con todas sus imagenes y videos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
