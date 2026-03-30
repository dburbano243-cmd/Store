"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import AdminSidebar from "@/components/AdminSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on the page builder route
  const isPageBuilder = pathname?.startsWith("/admin/pages/") && pathname !== "/admin/pages"

  // Sidebar state - default collapsed when in page builder
  const [sidebarOpen, setSidebarOpen] = useState(!isPageBuilder)

  // Auto-collapse sidebar when entering page builder
  useEffect(() => {
    if (isPageBuilder) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isPageBuilder])

  // Redirigir si no hay usuario o no es admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login")
    }
  }, [loading, user, isAdmin, router])

  // Mostrar loading mientras se verifica la autenticacion o se redirige
  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            Administracion
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
