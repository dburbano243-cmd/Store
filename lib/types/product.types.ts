/**
 * Product-related type definitions
 * These are the public interfaces used throughout the application
 */

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
  is_active: boolean
  source: string | null
  effective_at: string | null
  expires_at: string | null
}

export interface ProductDiscount {
  id: string
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
  /** Price in COP */
  priceCOP: number
  stock: number
  stars: number
  reviews: number
  features: string[]
  media: ProductMedia[]
  discounts?: Array<{
    id: string
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

/**
 * Payload for creating/updating products via API
 */
export interface ProductPayload {
  name: string
  slug?: string
  description: string
  stock: number
  stars?: number
  reviews?: number
}

/**
 * Payload for creating product prices
 */
export interface ProductPricePayload {
  product_id: string
  amount: number
  is_active?: boolean
}

/**
 * Payload for creating product discounts
 */
export interface ProductPriceDiscountPayload {
  product_id: string
  discount_amount?: number | null
  discount_percent?: number | null
  start_at?: string | null
  end_at?: string | null
  metadata?: any
  is_active?: boolean
}
