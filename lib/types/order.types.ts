/**
 * Order and Shipment type definitions
 */

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'
export type ShipmentStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'failed'

export interface ShippingAddress {
  street: string
  city: string
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  total: number
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string
  payment_reference?: string
  shipping_address: ShippingAddress
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  order_id: string
  order_number: string
  tracking_number?: string
  carrier?: string
  status: ShipmentStatus
  estimated_delivery?: string
  actual_delivery?: string
  shipping_address: ShippingAddress
  customer_name: string
  customer_phone: string
  created_at: string
  updated_at: string
}
