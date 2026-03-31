"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Plus, Trash2, Upload, X, Loader2, ImageIcon, FileVideo } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import type { MasonryItem } from "./index"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MasonryMediaEditorProps {
  /** El ID del page_component (viene del componente instanciado) */
  pageComponentId: string
  items: MasonryItem[]
  onChange: (items: MasonryItem[]) => void
}

interface PendingFile {
  file: File
  preview: string
  type: "image" | "video"
}

/* ------------------------------------------------------------------ */
/*  Fetcher for SWR                                                    */
/* ------------------------------------------------------------------ */

const fetcher = (url: string) => fetch(url).then(res => res.json())

/* ------------------------------------------------------------------ */
/*  Main Editor Component                                              */
/* ------------------------------------------------------------------ */

export function MasonryMediaEditor({ pageComponentId, items, onChange }: MasonryMediaEditorProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing items from DB using page_component_id
  const { data, mutate, isLoading } = useSWR(
    pageComponentId ? `/api/component-media?pageComponentId=${pageComponentId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Sync data from SWR to parent
  useEffect(() => {
    if (data?.items && JSON.stringify(data.items) !== JSON.stringify(items)) {
      onChange(data.items)
    }
  }, [data?.items])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPendingFiles: PendingFile[] = []
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      if (isVideo || isImage) {
        newPendingFiles.push({
          file,
          preview: URL.createObjectURL(file),
          type: isVideo ? "video" : "image",
        })
      }
    })

    setPendingFiles((prev) => [...prev, ...newPendingFiles])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const removed = prev[index]
      URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0 || !pageComponentId) return

    setIsUploading(true)

    try {
      for (const pendingFile of pendingFiles) {
        const formData = new FormData()
        formData.append("file", pendingFile.file)
        formData.append("pageComponentId", pageComponentId)
        formData.append("mediaType", pendingFile.type)

        const response = await fetch("/api/component-media", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          console.error("Upload error:", error)
        }
      }

      // Clear pending files
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview))
      setPendingFiles([])
      
      // Refresh the data
      mutate()
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (item: MasonryItem) => {
    if (!pageComponentId) return

    setDeletingId(item.id)

    try {
      const response = await fetch("/api/component-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: item.id,
          pageComponentId,
        }),
      })

      if (response.ok) {
        mutate()
      }
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const existingItems = data?.items || items || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Galeria de Medios
        </Label>
        <span className="text-xs text-muted-foreground">
          {existingItems.length} items
        </span>
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || !pageComponentId}
      >
        <Upload className="h-4 w-4" />
        Agregar imagenes o videos
      </Button>

      {!pageComponentId && (
        <p className="text-xs text-amber-500">
          Guarda el componente primero para poder subir media.
        </p>
      )}

      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Archivos pendientes ({pendingFiles.length})
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {pendingFiles.map((file, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden bg-muted group"
              >
                {file.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FileVideo className="w-6 h-6 text-muted-foreground" />
                  </div>
                ) : (
                  <Image
                    src={file.preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                )}
                <button
                  onClick={() => removePendingFile(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full gap-2"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Subir {pendingFiles.length} archivos
              </>
            )}
          </Button>
        </div>
      )}

      {/* Existing items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : existingItems.length > 0 ? (
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-3 gap-2 pr-3">
            {existingItems.map((item: MasonryItem) => (
              <div
                key={item.id}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden bg-muted group",
                  deletingId === item.id && "opacity-50"
                )}
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <Image
                    src={item.url}
                    alt={item.alt || "Gallery item"}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Type indicator */}
                <div className="absolute bottom-1 left-1 p-1 rounded bg-black/50 text-white">
                  {item.type === "video" ? (
                    <FileVideo className="w-3 h-3" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed rounded-lg">
          <ImageIcon className="w-8 h-8 mb-2" />
          <p className="text-xs">No hay media agregado</p>
        </div>
      )}
    </div>
  )
}

export default MasonryMediaEditor
