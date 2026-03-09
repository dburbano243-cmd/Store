"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Eye, Filter, ChevronDown, Truck, Package, Loader2, MapPin, User, Phone, Clock, ExternalLink, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShipmentStatusBadge } from "@/components/admin/StatusBadges"
import { supabase } from "@/lib/supabase"
import type { ShipmentStatus } from "@/lib/types"

// Nombre de la empresa - puedes cambiarlo aqui
const COMPANY_NAME = "Quita Pelusas Lavable"
const COMPANY_TAGLINE = "Tu tienda de confianza"

interface ShipmentWithAddress {
  id: string
  order_id: string
  tracking_number: string | null
  carrier: string | null
  status: string
  estimated_delivery: string | null
  actual_delivery: string | null
  created_at: string
  updated_at: string
  shipping_address: {
    id: string
    order_id: string
    street: string
    city: string
    receiver_name: string | null
    additional_info: string | null
    neighborhood: string | null
  } | null
  order: {
    order_number: string
    user: {
      name: string
      phone: string | null
    } | null
  } | null
}

const statusFilters: { value: ShipmentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "failed", label: "Fallido" },
]

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "in_transit", label: "En transito" },
  { value: "delivered", label: "Entregado" },
  { value: "failed", label: "Fallido" },
]

const carrierOptions = [
  { value: "servientrega", label: "Servientrega" },
  { value: "coordinadora", label: "Coordinadora" },
  { value: "interrapidisimo", label: "Interrapidisimo" },
  { value: "envia", label: "Envia" },
  { value: "deprisa", label: "Deprisa" },
  { value: "otro", label: "Otro" },
]

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentWithAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all")
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Seleccion multiple para imprimir
  const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(new Set())
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  
  // Campos editables del sheet
  const [currentStatus, setCurrentStatus] = useState<ShipmentStatus>("pending")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("")

  const selectedShipment = selectedShipmentId 
    ? shipments.find(s => s.id === selectedShipmentId) 
    : null

  // Cuando se selecciona un shipment, cargar sus datos en los campos
  useEffect(() => {
    if (selectedShipment) {
      setCurrentStatus(selectedShipment.status as ShipmentStatus)
      setTrackingNumber(selectedShipment.tracking_number || "")
      setCarrier(selectedShipment.carrier || "")
    }
  }, [selectedShipment])

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data: shipmentsData, error: shipmentsError } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false })

        if (shipmentsError) {
          console.error("Error fetching shipments:", shipmentsError)
          setLoading(false)
          return
        }

        if (!shipmentsData || shipmentsData.length === 0) {
          setShipments([])
          setLoading(false)
          return
        }

        const orderIds = shipmentsData.map(s => s.order_id).filter(Boolean)
        
        // Obtener shipping_addresses
        const { data: addressesData } = await supabase
          .from('shipping_addresses')
          .select('*')
          .in('order_id', orderIds)

        // Obtener orders - la tabla orders tiene customer_name y customer_phone directamente
        let ordersData: Array<{id: string, order_number: string, customer_name: string | null, customer_phone: string | null}> = []
        if (orderIds.length > 0) {
          const { data, error } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, customer_phone')
          
          if (!error && data) {
            ordersData = data.filter(o => orderIds.includes(o.id))
          }
        }

        const combinedShipments = shipmentsData.map(shipment => {
          const address = addressesData?.find(a => a.order_id === shipment.order_id) || null
          const order = ordersData?.find(o => o.id === shipment.order_id)

          return {
            ...shipment,
            shipping_address: address,
            order: order ? {
              order_number: order.order_number,
              user: { name: order.customer_name || '', phone: order.customer_phone }
            } : null
          }
        })

        setShipments(combinedShipments)
      } catch (err) {
        console.error("Exception fetching shipments:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchShipments()
  }, [])

  const handleSave = async () => {
    if (!selectedShipmentId) return
    
    setSaving(true)
    try {
      const updateData: Record<string, unknown> = {
        status: currentStatus,
        tracking_number: trackingNumber || null,
        carrier: carrier || null,
        updated_at: new Date().toISOString()
      }

      if (currentStatus === 'delivered') {
        updateData.actual_delivery = new Date().toISOString()
      }

      await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', selectedShipmentId)

      // Actualizar estado local
      setShipments(prev => prev.map(s => 
        s.id === selectedShipmentId 
          ? { 
              ...s, 
              status: currentStatus, 
              tracking_number: trackingNumber || null, 
              carrier: carrier || null,
              updated_at: new Date().toISOString(),
              actual_delivery: currentStatus === 'delivered' ? new Date().toISOString() : s.actual_delivery
            } 
          : s
      ))
    } catch (err) {
      console.error("Error saving shipment:", err)
    } finally {
      setSaving(false)
    }
  }

  // Funciones para seleccion multiple
  const toggleSelectForPrint = (id: string) => {
    setSelectedForPrint(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedForPrint.size === filteredShipments.length) {
      setSelectedForPrint(new Set())
    } else {
      setSelectedForPrint(new Set(filteredShipments.map(s => s.id)))
    }
  }

  const handlePrint = () => {
    setShowPrintDialog(true)
  }

  const executePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiquetas de Envio - ${COMPANY_NAME}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              color: #1a1a1a;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              padding: 20px;
              justify-content: center;
            }
            .label {
              width: 400px;
              border: 2px solid #1a1a1a;
              border-radius: 8px;
              overflow: hidden;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .label-header {
              background: #1a1a1a;
              color: white;
              padding: 16px;
              text-align: center;
            }
            .company-name {
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .company-tagline {
              font-size: 11px;
              opacity: 0.8;
              margin-top: 4px;
            }
            .label-body {
              padding: 20px;
            }
            .order-number {
              background: #f5f5f5;
              border: 1px dashed #ccc;
              border-radius: 6px;
              padding: 12px;
              text-align: center;
              margin-bottom: 16px;
            }
            .order-label {
              font-size: 10px;
              text-transform: uppercase;
              color: #666;
              letter-spacing: 1px;
            }
            .order-value {
              font-size: 18px;
              font-weight: 700;
              font-family: monospace;
              margin-top: 4px;
            }
            .section {
              margin-bottom: 16px;
            }
            .section-title {
              font-size: 10px;
              text-transform: uppercase;
              color: #666;
              letter-spacing: 1px;
              margin-bottom: 6px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .section-title::before {
              content: '';
              display: block;
              width: 12px;
              height: 2px;
              background: #1a1a1a;
            }
            .receiver-name {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .address-line {
              font-size: 14px;
              line-height: 1.5;
              color: #333;
            }
            .phone-line {
              font-size: 14px;
              margin-top: 8px;
              color: #333;
            }
            .additional-info {
              background: #fff9e6;
              border: 1px solid #f0e6c0;
              border-radius: 4px;
              padding: 10px;
              font-size: 12px;
              color: #665c3a;
              margin-top: 12px;
            }
            .additional-info-title {
              font-weight: 600;
              margin-bottom: 4px;
            }
            .label-footer {
              border-top: 1px dashed #ddd;
              padding: 12px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #666;
            }
            .tracking {
              font-family: monospace;
              font-weight: 600;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .labels-container { padding: 0; }
              .label { margin: 10px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const selectedShipmentsForPrint = shipments.filter(s => selectedForPrint.has(s.id))

  const filteredShipments = shipments.filter((shipment) => {
    const orderNumber = shipment.order?.order_number || ''
    const customerName = shipment.order?.user?.name || ''
    const city = shipment.shipping_address?.city || ''
    const trackingNum = shipment.tracking_number || ''

    const matchesSearch =
      orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trackingNum.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Contadores por estado
  const pendingCount = shipments.filter(s => s.status === 'pending' || s.status === 'preparing').length
  const shippedCount = shipments.filter(s => s.status === 'shipped' || s.status === 'in_transit').length
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Envios</h1>
          <p className="text-muted-foreground">
            Gestiona los envios de tu tienda
          </p>
        </div>
        {selectedForPrint.size > 0 && (
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir etiquetas ({selectedForPrint.size})
          </Button>
        )}
      </div>

      {/* Quick Status Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          size="sm"
        >
          Todos
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {shipments.length}
          </span>
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
          size="sm"
          className="gap-2"
        >
          <Clock className="h-3 w-3" />
          Pendientes
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {pendingCount}
          </span>
        </Button>
        <Button
          variant={statusFilter === "shipped" ? "default" : "outline"}
          onClick={() => setStatusFilter("shipped")}
          size="sm"
          className="gap-2"
        >
          <Truck className="h-3 w-3" />
          En camino
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {shippedCount}
          </span>
        </Button>
        <Button
          variant={statusFilter === "delivered" ? "default" : "outline"}
          onClick={() => setStatusFilter("delivered")}
          size="sm"
          className="gap-2"
        >
          <Package className="h-3 w-3" />
          Entregados
          <span className="ml-1 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {deliveredCount}
          </span>
        </Button>
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
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedForPrint.size === filteredShipments.length && filteredShipments.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Seleccionar todos"
                        />
                      </TableHead>
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
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron envios con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <TableRow key={shipment.id} className={selectedForPrint.has(shipment.id) ? "bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedForPrint.has(shipment.id)}
                              onCheckedChange={() => toggleSelectForPrint(shipment.id)}
                              aria-label={`Seleccionar envio ${shipment.order?.order_number}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {shipment.order?.order_number || shipment.order_id.slice(0, 8)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {shipment.shipping_address?.receiver_name || shipment.order?.user?.name || 'Sin nombre'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {shipment.shipping_address?.city || 'Sin ciudad'}
                                {shipment.shipping_address?.neighborhood && `, ${shipment.shipping_address.neighborhood}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <ShipmentStatusBadge status={shipment.status as ShipmentStatus} />
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedShipmentId(shipment.id)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver envio</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Mostrando {filteredShipments.length} de {shipments.length} envios</span>
                {selectedForPrint.size > 0 && (
                  <span className="font-medium text-foreground">
                    {selectedForPrint.size} seleccionado(s) para imprimir
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Shipment Detail Sheet */}
      <Sheet open={!!selectedShipmentId} onOpenChange={(open) => !open && setSelectedShipmentId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                Envio - {selectedShipment?.order?.order_number || selectedShipment?.order_id.slice(0, 8)}
                {selectedShipment && <ShipmentStatusBadge status={currentStatus} />}
              </SheetTitle>
            </div>
            {selectedShipment && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedShipment.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p>
            )}
          </SheetHeader>

          {selectedShipment && (
            <div className="space-y-6">
              {/* Estado del envio */}
              <div className="space-y-2">
                <Label>Cambiar estado</Label>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => setCurrentStatus(value as ShipmentStatus)}
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

              {/* Informacion de envio */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Informacion de envio
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Transportadora</Label>
                    <Select
                      value={carrier}
                      onValueChange={setCarrier}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar transportadora" />
                      </SelectTrigger>
                      <SelectContent>
                        {carrierOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Numero de guia / Tracking</Label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ej: 1234567890"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Direccion de envio */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Direccion de envio
                </h3>
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <p className="font-medium">
                    {selectedShipment.shipping_address?.receiver_name || selectedShipment.order?.user?.name || 'Sin nombre'}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedShipment.shipping_address?.street || 'Sin direccion'}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedShipment.shipping_address?.city || 'Sin ciudad'}
                    {selectedShipment.shipping_address?.neighborhood && `, ${selectedShipment.shipping_address.neighborhood}`}
                  </p>
                  {selectedShipment.shipping_address?.additional_info && (
                    <p className="text-muted-foreground italic">
                      Info: {selectedShipment.shipping_address.additional_info}
                    </p>
                  )}
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
                  <p className="font-medium">{selectedShipment.order?.user?.name || 'Sin nombre'}</p>
                  {selectedShipment.order?.user?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${selectedShipment.order.user.phone}`} className="hover:underline">
                        {selectedShipment.order.user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Orden relacionada */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Orden relacionada
                </h3>
                <Link
                  href={`/admin/orders/${selectedShipment.order_id}`}
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  Ver orden {selectedShipment.order?.order_number || selectedShipment.order_id.slice(0, 8)}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <Separator />

              {/* Fechas */}
              {(selectedShipment.estimated_delivery || selectedShipment.actual_delivery) && (
                <>
                  <div className="space-y-2 text-sm">
                    {selectedShipment.estimated_delivery && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entrega estimada</span>
                        <span>{format(new Date(selectedShipment.estimated_delivery), "dd MMM yyyy", { locale: es })}</span>
                      </div>
                    )}
                    {selectedShipment.actual_delivery && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entregado el</span>
                        <span className="text-green-600 font-medium">
                          {format(new Date(selectedShipment.actual_delivery), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Boton guardar */}
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Print Labels Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Vista previa de etiquetas ({selectedShipmentsForPrint.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview */}
            <div ref={printRef} className="labels-container">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {selectedShipmentsForPrint.map((shipment) => (
                  <div 
                    key={shipment.id} 
                    className="label"
                    style={{
                      width: '380px',
                      border: '2px solid #1a1a1a',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'white'
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      background: '#1a1a1a',
                      color: 'white',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}>
                        {COMPANY_NAME}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: '0.8',
                        marginTop: '4px'
                      }}>
                        {COMPANY_TAGLINE}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '20px' }}>
                      {/* Order Number */}
                      <div style={{
                        background: '#f5f5f5',
                        border: '1px dashed #ccc',
                        borderRadius: '6px',
                        padding: '12px',
                        textAlign: 'center',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          color: '#666',
                          letterSpacing: '1px'
                        }}>
                          Orden No.
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          fontFamily: 'monospace',
                          marginTop: '4px'
                        }}>
                          {shipment.order?.order_number || shipment.order_id.slice(0, 8)}
                        </div>
                      </div>

                      {/* Destinatario */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          color: '#666',
                          letterSpacing: '1px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ display: 'block', width: '12px', height: '2px', background: '#1a1a1a' }}></span>
                          Destinatario
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {shipment.shipping_address?.receiver_name || shipment.order?.user?.name || 'Sin nombre'}
                        </div>
                        {shipment.order?.user?.phone && (
                          <div style={{
                            fontSize: '14px',
                            color: '#333'
                          }}>
                            Tel: {shipment.order.user.phone}
                          </div>
                        )}
                      </div>

                      {/* Direccion */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          color: '#666',
                          letterSpacing: '1px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ display: 'block', width: '12px', height: '2px', background: '#1a1a1a' }}></span>
                          Direccion de entrega
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
                          {shipment.shipping_address?.street || 'Sin direccion'}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
                          {shipment.shipping_address?.neighborhood && `${shipment.shipping_address.neighborhood}, `}
                          {shipment.shipping_address?.city || 'Sin ciudad'}
                        </div>
                      </div>

                      {/* Info adicional */}
                      {shipment.shipping_address?.additional_info && (
                        <div style={{
                          background: '#fff9e6',
                          border: '1px solid #f0e6c0',
                          borderRadius: '4px',
                          padding: '10px',
                          fontSize: '12px',
                          color: '#665c3a'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Nota:</div>
                          {shipment.shipping_address.additional_info}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{
                      borderTop: '1px dashed #ddd',
                      padding: '12px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: '#666'
                    }}>
                      <span>{format(new Date(shipment.created_at), "dd/MM/yyyy", { locale: es })}</span>
                      {shipment.tracking_number && (
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                          Guia: {shipment.tracking_number}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={executePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
