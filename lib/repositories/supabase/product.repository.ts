/**
 * Supabase Product Repository Implementation
 * 
 * Implementación del ProductRepository usando Supabase.
 * Para cambiar de proveedor, crea una nueva implementación con la misma interfaz.
 */

import { supabase } from "@/lib/supabase"
import type { Product, ProductMedia } from "@/lib/types"
import type { ProductRepository } from "../types"
import type {
  SupabaseProduct,
  SupabaseProductMedia,
} from "@/lib/types/supabase.types"

// =============================================
// HELPERS
// =============================================

function storageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return storagePath
  return `${base}/storage/v1/object/public/storage/${storagePath}`
}

function mapMedia(row: SupabaseProductMedia): ProductMedia {
  return {
    id: row.id,
    storage_path: row.storage_path,
    url: row.url ?? storageUrl(row.storage_path),
    media_type: row.media_type,
    content_type: row.content_type,
    file_name: row.file_name,
    file_size: row.file_size,
    position: row.position,
    alt_text: row.alt_text,
    is_primary: row.is_primary,
  }
}

function mapAttribute(row: any): any {
  return {
    id: row.id,
    product_id: row.product_id,
    attribute_type_id: row.attribute_type_id,
    values: row.values,
    created_at: row.created_at,
  }
}

function mapProduct(row: SupabaseProduct, limitMedia: boolean = false): Product {
  let sortedMedia = [...(row.product_media ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.position ?? 999) - (b.position ?? 999)
    })
    .map(mapMedia)

  if (limitMedia) {
    const videos = sortedMedia.filter(m => m.media_type === 'video').slice(0, 1)
    const images = sortedMedia.filter(m => m.media_type === 'image').slice(0, 3)
    sortedMedia = [...videos, ...images]
  }

  const activePrices = (row.product_prices ?? []).filter((p) => p.is_active)
  const copPrice = activePrices.length > 0 ? activePrices[0].amount : 0

  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: row.name,
    description: row.description,
    short_description: (row as any).short_description ?? undefined,
    sku: (row as any).sku ?? undefined,
    weight: (row as any).weight ?? undefined,
    dimensions: (row as any).dimensions ?? undefined,
    is_active: (row as any).is_active ?? true,
    is_featured: (row as any).is_featured ?? false,
    category_id: (row as any).category_id ?? undefined,
    price: copPrice,
    priceCOP: copPrice,
    stock: row.stock ?? 0,
    stars: row.stars ?? 0,
    reviews: row.reviews ?? 0,
    media: sortedMedia,
    attributes: (row.product_attributes ?? []).map(mapAttribute),
  }
}

const PRODUCT_SELECT = `
  *,
  product_attributes ( id, attribute_type_id, values ),
  product_media ( id, storage_path, url, media_type, content_type, file_name, file_size, position, alt_text, is_primary ),
  product_prices ( id, amount, is_active)
`

// =============================================
// SUPABASE PRODUCT REPOSITORY
// =============================================

export const supabaseProductRepository: ProductRepository = {
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products:", error)
        return []
      }

      return (data as unknown as SupabaseProduct[]).map(row => mapProduct(row, false))
    } catch (err) {
      console.error("Exception fetching products:", err)
      return []
    }
  },

  async getAllForListing(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching products for listing:", error)
        return []
      }

      return (data as unknown as SupabaseProduct[]).map(row => mapProduct(row, true))
    } catch (err) {
      console.error("Exception fetching products for listing:", err)
      return []
    }
  },

  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .single()

      if (error) {
        console.error("Error fetching product by slug:", error)
        return null
      }

      return mapProduct(data as unknown as SupabaseProduct)
    } catch (err) {
      console.error("Exception fetching product by slug:", err)
      return null
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching product by id:", error)
        return null
      }

      return mapProduct(data as unknown as SupabaseProduct)
    } catch (err) {
      console.error("Exception fetching product by id:", err)
      return null
    }
  },

  async getFeatured(limit: number = 8): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .order("stars", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching featured products:", error)
        return []
      }

      return (data as unknown as SupabaseProduct[]).map(row => mapProduct(row, true))
    } catch (err) {
      console.error("Exception fetching featured products:", err)
      return []
    }
  },

  async getByCategory(categorySlug: string): Promise<Product[]> {
    // TODO: Implementar cuando existan categorías en la BD
    console.warn("getByCategory not implemented yet, returning all products")
    return this.getAllForListing()
  },

  async search(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error searching products:", error)
        return []
      }

      return (data as unknown as SupabaseProduct[]).map(row => mapProduct(row, true))
    } catch (err) {
      console.error("Exception searching products:", err)
      return []
    }
  },
}
