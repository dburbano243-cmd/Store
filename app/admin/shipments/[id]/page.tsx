"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Clock,
  Phone,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShipmentStatusBadge } from "@/components/admin/StatusBadges"
import type { Shipment, ShipmentStatus } from "@/lib/types"

const carriers = [
  "Servientrega",
  "Interrapidisimo",
  "Envia",
  "Coordinadora",
  "TCC",
  "Deprisa",
  "472",
]

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "failed", label: "Fallido" },
]

export default function ShipmentDetailPage() {
  const params = useParams()
  const shipmentId = params.id as string

  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ShipmentStatus>("pending")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("")

  useEffect(() => {
    // TODO: Fetch shipment from Supabase
    // const fetchShipment = async () => {
    //   const { data, error } = await supabase
    //     .from('shipments')
    //     .select('*, shipping_addresses(*)')
    //     .eq('id', shipmentId)
    //     .single()
    //   if (data) {
    //     setShipment(data)
    //     setCurrentStatus(data.status)
    //     setTrackingNumber(data.tracking_number || '')
    //     setCarrier(data.carrier || '')
    //   }
    // }
    // fetchShipment()
    setLoading(false)
  }, [shipmentId])

  const handleSave = async () => {
    setSaving(true)
    // TODO: Update shipment in Supabase
    // await supabase
    //   .from('shipments')
    //   .update({
    //     status: currentStatus,
    //     tracking_number: trackingNumber || null,
    //     carrier: carrier || null,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', shipmentId)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Envio no encontrado</h2>
        <p className="text-muted-foreground mt-2">
          El envio que buscas no existe o fue eliminado.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/shipments">Volver a envios</Link>
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
            <Link href="/admin/shipments">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Envio - {shipment.order_number}
              </h1>
              <ShipmentStatusBadge status={currentStatus} />
            </div>
            <p className="text-muted-foreground">
              Creado el{" "}
              {format(new Date(shipment.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/orders/${shipment.order_id}`}>
              <Package className="h-4 w-4 mr-2" />
              Ver orden
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informacion de envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5" />
                Informacion de envio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Transportadora</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger id="carrier">
                      <SelectValue placeholder="Seleccionar transportadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking">Numero de tracking</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ej: COL123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado del envio</Label>
                <Select
                  value={currentStatus}
                  onValueChange={(value) => setCurrentStatus(value as ShipmentStatus)}
                >
                  <SelectTrigger id="status">
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

              {trackingNumber && carrier && (
                <div className="pt-2">
                  <Button variant="outline" className="gap-2" asChild>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        `${carrier} tracking ${trackingNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Rastrear envio
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Direccion de entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Direccion de entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{shipment.customer_name}</p>
                <p className="text-muted-foreground">{shipment.shipping_address.street}</p>
                <p className="text-muted-foreground">
                  {shipment.shipping_address.city}, {shipment.shipping_address.state}{" "}
                  {shipment.shipping_address.postal_code}
                </p>
                <p className="text-muted-foreground">{shipment.shipping_address.country}</p>
                {shipment.shipping_address.notes && (
                  <p className="text-sm text-muted-foreground italic mt-2">
                    Notas: {shipment.shipping_address.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Informacion del destinatario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Destinatario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{shipment.customer_name}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href={`tel:${shipment.customer_phone}`} className="hover:underline">
                  {shipment.customer_phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creado</span>
                <span>
                  {format(new Date(shipment.created_at), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actualizado</span>
                <span>
                  {format(new Date(shipment.updated_at), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              {shipment.estimated_delivery && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega estimada</span>
                    <span>
                      {format(new Date(shipment.estimated_delivery), "dd/MM/yyyy")}
                    </span>
                  </div>
                </>
              )}
              {shipment.actual_delivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrega real</span>
                  <span className="text-green-600 font-medium">
                    {format(new Date(shipment.actual_delivery), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orden relacionada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Orden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/admin/orders/${shipment.order_id}`}
                className="text-primary hover:underline font-medium"
              >
                {shipment.order_number}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Ver detalles de la orden
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
