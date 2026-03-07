"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Eye, Filter, ChevronDown, ShoppingBag, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadges"
import type { Order, OrderStatus } from "@/lib/types"

const statusFilters: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")

  useEffect(() => {
    // TODO: Fetch orders from Supabase
    // const fetchOrders = async () => {
    //   const { data, error } = await supabase
    //     .from('orders')
    //     .select('*, order_items(*), shipping_addresses(*)')
    //     .order('created_at', { ascending: false })
    //   if (data) setOrders(data)
    // }
    // fetchOrders()
    setLoading(false)
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
                    Estado
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
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver orden</span>
                              </Link>
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
    </div>
  )
}
