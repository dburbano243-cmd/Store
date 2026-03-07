import { Badge } from "@/components/ui/badge"
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/lib/types"

const orderStatusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  paid: { label: "Pagado", variant: "default" },
  shipped: { label: "Enviado", variant: "default" },
  delivered: { label: "Entregado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
}

const orderStatusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  paid: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  shipped: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  delivered: "bg-green-100 text-green-800 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status]
  return (
    <Badge className={orderStatusColors[status]}>
      {config.label}
    </Badge>
  )
}

const paymentStatusConfig: Record<PaymentStatus, { label: string }> = {
  pending: { label: "Pendiente" },
  approved: { label: "Aprobado" },
  rejected: { label: "Rechazado" },
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  approved: "bg-green-100 text-green-800 hover:bg-green-100",
  rejected: "bg-red-100 text-red-800 hover:bg-red-100",
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status]
  return (
    <Badge className={paymentStatusColors[status]}>
      {config.label}
    </Badge>
  )
}

const shipmentStatusConfig: Record<ShipmentStatus, { label: string }> = {
  pending: { label: "Pendiente" },
  preparing: { label: "Preparando" },
  shipped: { label: "Enviado" },
  delivered: { label: "Entregado" },
  failed: { label: "Fallido" },
}

const shipmentStatusColors: Record<ShipmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  preparing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  shipped: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  delivered: "bg-green-100 text-green-800 hover:bg-green-100",
  failed: "bg-red-100 text-red-800 hover:bg-red-100",
}

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const config = shipmentStatusConfig[status]
  return (
    <Badge className={shipmentStatusColors[status]}>
      {config.label}
    </Badge>
  )
}
