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
  source: string | null
  effective_at: string | null
  expires_at: string | null
}

export interface SupabaseProductDiscount {
  id: string
  discount_amount: number | null
  discount_amount_in_cents: number | null
  discount_percent: number | null
  is_active: boolean
}

export interface SupabaseProduct {
  id: string
  slug: string | null
  name: string
  description: string
  stock: number
  stars: number
  reviews: number
  created_at: string
  product_features: { id: string; name: string }[]
  product_media: SupabaseProductMedia[]
  product_prices: SupabaseProductPrice[]
  product_price_discounts: SupabaseProductDiscount[]
}
