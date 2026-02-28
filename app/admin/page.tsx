import React from "react"
import Link from "next/link"
import { LayoutDashboard, Package } from "lucide-react"

export default function AdminIndexPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground text-balance">
        Panel de administracion
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecciona una seccion para comenzar.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/dashboard"
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Resumen general de la tienda
            </p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Productos</p>
            <p className="text-xs text-muted-foreground">
              Administrar inventario y catalogo
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
