"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Loader2, User, LogOut, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { useUserOrders } from "@/hooks/useOrders"
import { supabase } from "@/lib/supabase"
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

function getStatusConfig(status: OrderStatus) {
  const configs = {
    pending: { label: "Pendiente", icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    paid: { label: "Pagado", icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200" },
    shipped: { label: "Enviado", icon: Truck, color: "bg-blue-100 text-blue-800 border-blue-200" },
    delivered: { label: "Entregado", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    cancelled: { label: "Cancelado", icon: XCircle, color: "bg-red-100 text-red-800 border-red-200" },
  }
  return configs[status] || configs.pending
}

function getPaymentConfig(status: PaymentStatus) {
  const configs = {
    pending: { label: "Pago Pendiente", color: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Pago Aprobado", color: "bg-green-100 text-green-800" },
    rejected: { label: "Pago Rechazado", color: "bg-red-100 text-red-800" },
  }
  return configs[status] || configs.pending
}

function getStatusMessage(order: Order): string | null {
  if (order.payment_status === "approved" && order.status === "paid") {
    return "Tu pedido fue pagado exitosamente. Estamos preparando tu envio y pronto cambiara a 'Enviado'."
  }
  if (order.status === "shipped") {
    return "Tu pedido esta en camino. Pronto lo recibiras."
  }
  if (order.status === "delivered") {
    return "Tu pedido fue entregado. Gracias por tu compra."
  }
  if (order.payment_status === "pending") {
    return "Estamos esperando la confirmacion de tu pago."
  }
  return null
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const statusConfig = getStatusConfig(order.status)
  const paymentConfig = getPaymentConfig(order.payment_status)
  const StatusIcon = statusConfig.icon
  const statusMessage = getStatusMessage(order)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {order.order_number}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge variant="secondary" className={paymentConfig.color}>
              {paymentConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Message */}
        {statusMessage && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {statusMessage}
          </div>
        )}

        {/* Order Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
          </span>
          <span className="font-semibold">{formatCurrency(order.total)}</span>
        </div>

        {/* Expandable Products */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar productos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver productos
            </>
          )}
        </button>

        {expanded && (
          <div className="space-y-3 pt-2">
            <Separator />
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.unit_price)} x {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envio</span>
                <span>{order.shipping_cost === 0 ? "Gratis" : formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MiCuentaPage() {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth()
  const { orders, loading: ordersLoading } = useUserOrders(profile?.email)
  const router = useRouter()
  
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  // Redirect if not logged in or is admin
  if (!authLoading && !user) {
    router.push("/auth/login")
    return null
  }

  if (!authLoading && isAdmin) {
    router.push("/admin")
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const openEditProfile = () => {
    setName(profile?.name || "")
    setEditProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    
    const { error } = await supabase
      .from("users")
      .update({ name })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
    } else {
      // Reload to get updated profile
      window.location.reload()
    }
    setSaving(false)
    setEditProfileOpen(false)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="rounded-xl border bg-card p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{profile?.name || "Usuario"}</p>
                <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={openEditProfile}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesion
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content - Orders */}
        <main className="flex-1 min-w-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Mis Pedidos</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Consulta el estado de tus compras
              </p>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg">No tienes pedidos aun</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cuando realices una compra, aparecera aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Perfil</SheetTitle>
            <SheetDescription>
              Actualiza tu informacion personal
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El correo no se puede modificar
              </p>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              className="w-full"
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
