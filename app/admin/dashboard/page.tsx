import React from "react"
import { DollarSign, ShoppingCart, Users } from "lucide-react"

const stats = [
  { label: "Ventas (hoy)", value: "$1,240", icon: DollarSign },
  { label: "Pedidos", value: "12", icon: ShoppingCart },
  { label: "Usuarios nuevos", value: "3", icon: Users },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Resumen general de tu tienda.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-card-foreground">
          Actividad reciente
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>- Pedido #1024 creado (2 horas)</li>
          <li>- Usuario maria@example.com se registro (4 horas)</li>
          <li>- Producto &apos;Auriculares&apos; actualizado (1 dia)</li>
        </ul>
      </section>
    </div>
  )
}
