/**
 * Product-related type definitions
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
}

export interface AttributeType {
  id: string
  name: string
  display_name: string
  type: 'select' | 'color' | 'text' | 'number'
  created_at: string
}

export interface ProductAttribute {
  id: string
  product_id: string
  attribute_type_id: string
  attribute_type?: AttributeType
  values: string[] | { value: string; hex?: string }[]
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string | null
  attributes: Record<string, string>
  price_adjustment: number
  stock: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  slug?: string
  name: string
  description: string
  short_description?: string
  sku?: string
  weight?: number
  dimensions?: { largo?: number; ancho?: number; alto?: number }
  is_active: boolean
  is_featured: boolean
  category_id?: string
  price: number
  priceCOP: number
  stock: number
  stars: number
  reviews: number
  media: ProductMedia[]
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
}

export interface CartItem extends Product {
  quantity: number
  selectedVariant?: ProductVariant
  selectedAttributes?: Record<string, string>
}

export interface MediaFile {
  src: string
  type: "image" | "video"
  name: string
}

export interface ProductPayload {
  name: string
  slug?: string
  description: string
  short_description?: string
  sku?: string
  weight?: number
  dimensions?: { largo?: number; ancho?: number; alto?: number }
  stock: number
  stars?: number
  reviews?: number
  is_active?: boolean
  is_featured?: boolean
  category_id?: string
}

export interface ProductPricePayload {
  product_id: string
  amount: number
  is_active?: boolean
}
