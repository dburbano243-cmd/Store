"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  Phone,
  Mail,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadges"
import type { Order, OrderStatus } from "@/lib/types"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
]

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending")

  useEffect(() => {
    // TODO: Fetch order from Supabase
    // const fetchOrder = async () => {
    //   const { data, error } = await supabase
    //     .from('orders')
    //     .select('*, order_items(*), shipping_addresses(*)')
    //     .eq('id', orderId)
    //     .single()
    //   if (data) {
    //     setOrder(data)
    //     setCurrentStatus(data.status)
    //   }
    // }
    // fetchOrder()
    setLoading(false)
  }, [orderId])

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus)
    // TODO: Update order status in Supabase
    // await supabase
    //   .from('orders')
    //   .update({ status: newStatus, updated_at: new Date().toISOString() })
    //   .eq('id', orderId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Orden no encontrada</h2>
        <p className="text-muted-foreground mt-2">
          La orden que buscas no existe o fue eliminada.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Volver a ordenes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {order.order_number}
              </h1>
              <OrderStatusBadge status={currentStatus} />
            </div>
            <p className="text-muted-foreground">
              Creada el{" "}
              {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/shipments/${order.id}`}>
            <Button variant="outline" className="gap-2">
              <Truck className="h-4 w-4" />
              Ver envio
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-medium">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span>
                    {order.shipping_cost === 0
                      ? "Gratis"
                      : formatCurrency(order.shipping_cost)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direccion de envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Direccion de envio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.shipping_address.street}</p>
                <p className="text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p className="text-muted-foreground">{order.shipping_address.country}</p>
                {order.shipping_address.notes && (
                  <p className="text-sm text-muted-foreground italic mt-2">
                    Notas: {order.shipping_address.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Estado de la orden */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Estado de la orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Cambiar estado
                </label>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creada</span>
                  <span>
                    {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizada</span>
                  <span>
                    {format(new Date(order.updated_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informacion del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${order.customer_email}`} className="hover:underline">
                  {order.customer_email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href={`tel:${order.customer_phone}`} className="hover:underline">
                  {order.customer_phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Informacion de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Metodo</span>
                <span className="text-sm font-medium">{order.payment_method}</span>
              </div>
              {order.payment_reference && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Referencia</span>
                  <span className="text-sm font-mono">{order.payment_reference}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
