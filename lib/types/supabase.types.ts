/**
 * Supabase row shapes (raw query results)
 * These interfaces match the exact structure returned by Supabase queries
 * Used internally for data mapping, not exposed to UI components
 */

export interface SupabaseProductMedia {
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

export interface SupabaseProductPrice {
  id: string
  amount: number
  is_active: boolean
}

export interface SupabaseProductAttribute {
  id: string
  attribute_type_id: string
  values: string[]
}

export interface SupabaseProductVariant {
  id: string
  sku: string | null
  attributes: Record<string, string>
  price_adjustment: number
  stock: number
  is_active: boolean
}

export interface SupabaseProduct {
  id: string
  slug: string | null
  name: string
  description: string
  short_description: string | null
  sku: string | null
  stock: number
  stars: number
  reviews: number
  weight: number | null
  dimensions: Record<string, number> | null
  is_active: boolean
  is_featured: boolean
  category_id: string | null
  created_at: string
  product_attributes: SupabaseProductAttribute[]
  product_media: SupabaseProductMedia[]
  product_prices: SupabaseProductPrice[]
  product_variants?: SupabaseProductVariant[]
}
