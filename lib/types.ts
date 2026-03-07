export interface ProductMedia {
  id: string
  storage_path: string
  url: string | null
  media_type: string
  content_type: string | null
  file_name: string | null
  file_size: number | null
  position: number | null
  alt_text: string | null
  is_primary: boolean | null
}

export interface ProductPrice {
  id: string
  amount: number
  currency_code: string
  is_active: boolean
  source: string | null
  effective_at: string | null
  expires_at: string | null
}

export interface ProductDiscount {
  id: string
  currency_code: string
  discount_amount_in_cents: number | null
  discount_percent: number | null
  start_at: string | null
  end_at: string | null
  is_active: boolean
}

export interface Product {
  id: string
  slug?: string
  name: string
  description: string
  /** Active COP price (from product_prices) */
  price: number
  /** Original price before discount (from product_price_discounts or product_prices) */
  priceWithDiscount: number
  /** All active prices keyed by currency */
  prices_by_currency: Record<string, number>
  stock: number
  units_in_stock: number
  stars: number
  reviews: number
  features: string[]
  media: ProductMedia[]
  discounts?: Array<{
    id: string
    currency_code: string
    discount_amount?: number
    discount_percent?: number
    metadata?: any
    is_active: boolean
  }>
}

export interface CartItem extends Product {
  quantity: number
}

export interface MediaFile {
  src: string
  type: "image" | "video"
  name: string
}

// Order & Shipment Types
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
