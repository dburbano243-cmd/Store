"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Eye, Filter, ChevronDown, Truck, Package, Loader2 } from "lucide-react"
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
import { ShipmentStatusBadge } from "@/components/admin/StatusBadges"
import type { Shipment, ShipmentStatus } from "@/lib/types"

const statusFilters: { value: ShipmentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "failed", label: "Fallido" },
]

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all")

  useEffect(() => {
    // TODO: Fetch shipments from Supabase
    // const fetchShipments = async () => {
    //   const { data, error } = await supabase
    //     .from('shipments')
    //     .select('*, shipping_addresses(*)')
    //     .order('created_at', { ascending: false })
    //   if (data) setShipments(data)
    // }
    // fetchShipments()
    setLoading(false)
  }, [])

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.shipping_address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shipment.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Envios</h1>
          <p className="text-muted-foreground">
            Gestiona los envios de tu tienda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Lista de Envios</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por # orden, tracking..."
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
          ) : shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No hay envios</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Los envios se crearan automaticamente cuando se confirmen los pagos de las ordenes.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Orden</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead>Transportadora</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No se encontraron envios con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <Link
                                href={`/admin/orders/${shipment.order_id}`}
                                className="font-medium hover:underline"
                              >
                                {shipment.order_number}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{shipment.customer_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {shipment.shipping_address.city}, {shipment.shipping_address.state}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <ShipmentStatusBadge status={shipment.status} />
                          </TableCell>
                          <TableCell>
                            {shipment.carrier || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {shipment.tracking_number ? (
                              <span className="font-mono text-sm">
                                {shipment.tracking_number}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(shipment.created_at), "dd MMM yyyy", { locale: es })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(shipment.created_at), "HH:mm", { locale: es })}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/shipments/${shipment.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver envio</span>
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
                Mostrando {filteredShipments.length} de {shipments.length} envios
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
