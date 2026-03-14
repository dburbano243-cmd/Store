"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Plus, Pencil, Trash2, Globe, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { getPages, createPage, deletePage } from "@/lib/services/page-builder.service"
import type { Page, PageStatus } from "@/lib/types/page-builder.types"

const statusConfig: Record<PageStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "secondary" },
  published: { label: "Publicado", variant: "default" },
  archived: { label: "Archivado", variant: "outline" },
}

export default function PagesAdminPage() {
  const { data: pages, error, isLoading, mutate } = useSWR<Page[]>("admin-pages", getPages)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [newPageTitle, setNewPageTitle] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")

  const handleCreatePage = async () => {
    if (!newPageTitle.trim() || !newPageSlug.trim()) return

    setIsSubmitting(true)
    try {
      await createPage({
        title: newPageTitle.trim(),
        slug: newPageSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        status: "draft",
      })
      await mutate()
      setIsCreateDialogOpen(false)
      setNewPageTitle("")
      setNewPageSlug("")
    } catch (err) {
      console.error("Error creating page:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePage = async () => {
    if (!pageToDelete) return

    setIsSubmitting(true)
    try {
      await deletePage(pageToDelete.id)
      await mutate()
      setIsDeleteDialogOpen(false)
      setPageToDelete(null)
    } catch (err) {
      console.error("Error deleting page:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (page: Page) => {
    setPageToDelete(page)
    setIsDeleteDialogOpen(true)
  }

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setNewPageTitle(value)
    setNewPageSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error al cargar las páginas</p>
          <Button variant="outline" onClick={() => mutate()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Páginas</h1>
          <p className="text-muted-foreground">
            Administra las páginas de tu sitio web
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Página
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Página</DialogTitle>
              <DialogDescription>
                Ingresa el título y slug para la nueva página. Podrás editar el contenido después.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Mi nueva página"
                  value={newPageTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="slug"
                    placeholder="mi-nueva-pagina"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePage}
                disabled={isSubmitting || !newPageTitle.trim() || !newPageSlug.trim()}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Página
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Páginas
          </CardTitle>
          <CardDescription>
            {pages?.length ?? 0} página(s) en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pages && pages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {page.is_home && (
                          <Globe className="h-4 w-4 text-primary" title="Página de inicio" />
                        )}
                        {page.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      /{page.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[page.status].variant}>
                        {statusConfig[page.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(page.created_at).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/pages/${page.id}`}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(page)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No hay páginas creadas aún
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Crear tu primera página
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la página
              {pageToDelete && (
                <span className="font-semibold"> "{pageToDelete.title}"</span>
              )} y todos sus componentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePage}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
