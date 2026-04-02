"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { VisualEditor } from "@/components/admin/page-builder/VisualEditor"
import { getPageWithComponents, getGlobalComponents } from "@/lib/services/page-builder.service"
import type { PageWithComponents, PageComponent } from "@/lib/types/page-builder.types"

interface PageEditorProps {
  params: Promise<{ id: string }>
}

async function fetchPageData(id: string): Promise<{
  page: PageWithComponents | null
  globalComponents: PageComponent[]
}> {
  const [page, globalComponents] = await Promise.all([
    getPageWithComponents(id),
    getGlobalComponents(),
  ])
  return { page, globalComponents }
}

export default function PageEditorPage({ params }: PageEditorProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data, error, isLoading, mutate } = useSWR(
    `page-editor-${id}`,
    () => fetchPageData(id),
    {
      revalidateOnFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando editor...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.page) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          {error ? "Error al cargar la página" : "Página no encontrada"}
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/pages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a páginas
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-5rem)]">
      <VisualEditor
        page={data.page}
        globalComponents={data.globalComponents}
        onSave={() => mutate()}
      />
    </div>
  )
}
