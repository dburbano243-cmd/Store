"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Eye, Filter, ChevronDown, ShoppingBag, Loader2, CheckCircle, Clock, Package, User, MapPin, CreditCard, Phone, Mail, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadges"
import type { Order, OrderStatus } from "@/lib/types"
import { useOrders } from "@/hooks/useOrders"

const statusFilters: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
]

type PaymentFilter = "approved" | "pending" | "all"

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

export default function OrdersPage() {
  const { orders, loading, updateOrderStatus, getOrderById } = useOrders()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("approved")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (selectedOrderId) {
      await updateOrderStatus(selectedOrderId, newStatus)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    const matchesPayment = 
      paymentFilter === "all" || order.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })
  
  const approvedCount = orders.filter(o => o.payment_status === "approved").length
  const pendingCount = orders.filter(o => o.payment_status === "pending").length

  const getTotalProducts = (order: Order) => {
    return order.items.reduce((acc, item) => acc + item.quantity, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordenes</h1>
          <p className="text-muted-foreground">
            Gestiona las ordenes de tu tienda
          </p>
        </div>
      </div>

      {/* Quick Payment Status Filters */}
      <div className="flex gap-2">
        <Button
          variant={paymentFilter === "approved" ? "default" : "outline"}
          onClick={() => setPaymentFilter("approved")}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Aprobadas
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {approvedCount}
          </span>
        </Button>
        <Button
          variant={paymentFilter === "pending" ? "default" : "outline"}
          onClick={() => setPaymentFilter("pending")}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          Pendientes
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {pendingCount}
          </span>
        </Button>
        <Button
          variant={paymentFilter === "all" ? "default" : "outline"}
          onClick={() => setPaymentFilter("all")}
        >
          Todas
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {orders.length}
          </span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Lista de Ordenes</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por # orden, cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[280px]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Estado Orden
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusFilters.map((filter) => (
                    <DropdownMenuItem
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={statusFilter === filter.value ? "bg-accent" : ""}
                    >
                      {filter.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No hay ordenes</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Las ordenes apareceran aqui cuando los clientes realicen compras en tu tienda.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Orden</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Productos</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Pago</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron ordenes con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.customer_email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getTotalProducts(order)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell className="text-center">
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-center">
                            <PaymentStatusBadge status={order.payment_status} />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), "HH:mm", { locale: es })}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver orden</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Mostrando {filteredOrders.length} de {orders.length} ordenes
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                {selectedOrder?.order_number}
                {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
              </SheetTitle>
            </div>
            {selectedOrder && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p>
            )}
          </SheetHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Estado de la orden */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cambiar estado</label>
                <Select
                  value={selectedOrder.status}
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

              {/* Productos */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Productos ({selectedOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unit_price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.total_price)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envio</span>
                    <span>{selectedOrder.shipping_cost === 0 ? "Gratis" : formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cliente */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selectedOrder.customer_email}`} className="hover:underline">
                      {selectedOrder.customer_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${selectedOrder.customer_phone}`} className="hover:underline">
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pago */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pago
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <PaymentStatusBadge status={selectedOrder.payment_status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Metodo</span>
                    <span className="font-medium">{selectedOrder.payment_method}</span>
                  </div>
                  {selectedOrder.payment_reference && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Referencia</span>
                      <span className="font-mono text-xs">{selectedOrder.payment_reference}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
