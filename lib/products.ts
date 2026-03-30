import { supabase } from "./supabase"
import type { ProductMedia } from "./types"
import type { Product } from "./types/product.types"
import type { CachedProducts } from "./types/cache.types"
import type {
  SupabaseProduct,
  SupabaseProductMedia,
  SupabaseProductPrice,
} from "./types/supabase.types"
import type {
  ProductPayload,
  ProductPricePayload,
} from "./types/product.types"

// Re-export payload types for backward compatibility
export type { ProductPayload, ProductPricePayload }

/* ------------------------------------------------------------------ */
/*  LocalStorage cache for products (2 horas)                         */
/* ------------------------------------------------------------------ */

const PRODUCTS_CACHE_KEY = "products_cache"
const PRODUCTS_CACHE_TTL = 2 * 60 * 60 * 1000 // 2 horas en milisegundos

function getCachedProducts(): Product[] | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(PRODUCTS_CACHE_KEY)
    if (!cached) return null

    const parsed: CachedProducts = JSON.parse(cached)
    const now = Date.now()

    // Verificar si no ha expirado (2 horas)
    if (now - parsed.timestamp < PRODUCTS_CACHE_TTL) {
      return parsed.products as Product[]
    }

    // Expirado, eliminar
    localStorage.removeItem(PRODUCTS_CACHE_KEY)
    return null
  } catch {
    return null
  }
}

function setCachedProducts(products: Product[]): void {
  if (typeof window === 'undefined') return

  try {
    const cached: CachedProducts = {
      products,
      timestamp: Date.now(),
    }
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage lleno o no disponible, ignorar
  }
}

export function clearProductsCache(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(PRODUCTS_CACHE_KEY)
  } catch {
    // Ignorar
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: build a full public URL from a storage_path               */
/* ------------------------------------------------------------------ */

function storageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return storagePath
  // storage_path is like "products/uuid/1.webp"
  // Full URL: {base}/storage/v1/object/public/storage/{path}
  return `${base}/storage/v1/object/public/storage/${storagePath}`
}

/* ------------------------------------------------------------------ */
/*  Map Supabase row -> App Product                                   */
/* ------------------------------------------------------------------ */

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
  // Sort media by position (nulls last), then primary first
  let sortedMedia = [...(row.product_media ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.position ?? 999) - (b.position ?? 999)
    })
    .map(mapMedia)

  // For listing pages, limit to 1 video and 3 images max, video first
  if (limitMedia) {
    const videos = sortedMedia.filter(m => m.media_type === 'video').slice(0, 1)
    const images = sortedMedia.filter(m => m.media_type === 'image').slice(0, 3)
    sortedMedia = [...videos, ...images]
  }

  // Get COP price from product_prices
  const activePrices = (row.product_prices ?? []).filter((p) => p.is_active)
  const copPrice = activePrices.length > 0 ? activePrices[0].amount : 0

  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: row.name,
    description: row.description,
    short_description: row.short_description ?? undefined,
    sku: row.sku ?? undefined,
    weight: row.weight ?? undefined,
    dimensions: row.dimensions ?? undefined,
    is_active: row.is_active ?? true,
    is_featured: row.is_featured ?? false,
    category_id: row.category_id ?? undefined,
    price: copPrice,
    priceCOP: copPrice,
    stock: row.stock ?? 0,
    stars: row.stars ?? 0,
    reviews: row.reviews ?? 0,
    media: sortedMedia,
    attributes: (row.product_attributes ?? []).map(mapAttribute),
  }
}

/* ------------------------------------------------------------------ */
/*  Select fragment used in every query                               */
/* ------------------------------------------------------------------ */

const PRODUCT_SELECT = `
  *,
  product_attributes ( id, product_id, attribute_type_id, values, created_at ),
  product_media ( id, storage_path, url, media_type, content_type, file_name, file_size, position, alt_text, is_primary ),
  product_prices ( id, amount, is_active)
`

/* ------------------------------------------------------------------ */
/*  READ helpers                                                      */
/* ------------------------------------------------------------------ */

export async function fetchProducts(): Promise<Product[]> {
  // Primero intentar obtener del cache de localStorage
  const cached = getCachedProducts()
  if (cached && cached.length > 0) {
    return cached
  }

  // Si no hay cache, obtener de la base de datos
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error, {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
      })
      return []
    }

    const products = (data as unknown as SupabaseProduct[]).map(row => mapProduct(row, false))

    // Guardar en cache
    setCachedProducts(products)

    return products
  } catch (err) {
    console.error("Exception fetching products:", err)
    return []
  }
}

/**
 * Fetch products for listing/catalog pages with limited media
 * Only returns max 1 video and 2 images per product to save bandwidth
 */
export async function fetchProductsForListing(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products for listing:", error)
      return []
    }

    // Map products with limited media (1 video, 2 images max)
    return (data as unknown as SupabaseProduct[]).map(row => mapProduct(row, true))
  } catch (err) {
    console.error("Exception fetching products for listing:", err)
    return []
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .single()

    if (error) {
      console.error("Error fetching product by slug:", error, {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
      })
      return null
    }

    return mapProduct(data as unknown as SupabaseProduct)
  } catch (err) {
    console.error("Exception fetching product by slug:", err)
    return null
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching product by id:", error, {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
      })
      return null
    }

    return mapProduct(data as unknown as SupabaseProduct)
  } catch (err) {
    console.error("Exception fetching product by id:", err)
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  CRUD helpers used by the admin panel                              */
/* ------------------------------------------------------------------ */

export async function createProduct(payload: ProductPayload): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      slug: payload.slug ?? payload.name.toLowerCase().replace(/\s+/g, "-"),
      description: payload.description,
      stock: payload.stock,
      stars: payload.stars ?? 0,
      reviews: payload.reviews ?? 0,
    })
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return mapProduct(data as unknown as SupabaseProduct)
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductPayload>
): Promise<Product | null> {
  const updateData: Record<string, unknown> = {}
  if (payload.name !== undefined) updateData.name = payload.name
  if (payload.slug !== undefined) updateData.slug = payload.slug
  if (payload.description !== undefined) updateData.description = payload.description
  if (payload.stock !== undefined) {
    updateData.stock = payload.stock
    updateData.stock = payload.stock
  }
  if (payload.stars !== undefined) updateData.stars = payload.stars
  if (payload.reviews !== undefined) updateData.reviews = payload.reviews

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single()

  if (error) {
    console.error("Error updating product:", error)
    return null
  }

  return mapProduct(data as unknown as SupabaseProduct)
}

export async function deleteProduct(id: string): Promise<boolean> {
  // Remove related records first (FK constraints)
  await supabase.from("product_media").delete().eq("product_id", id)
  await supabase.from("product_attributes").delete().eq("product_id", id)
  await supabase.from("product_variants").delete().eq("product_id", id)
  await supabase.from("product_prices").delete().eq("product_id", id)

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}

/* ------------------------------------------------------------------ */
/*  Price helpers                                                    */
/* ------------------------------------------------------------------ */

export async function createProductPrice(
  payload: Omit<ProductPricePayload, "product_id"> & { product_id: string }
): Promise<SupabaseProductPrice | null> {
  const insertRow = {
    product_id: payload.product_id,
    amount: payload.amount,
    is_active: payload.is_active ?? true,
  }

  const { data, error } = await supabase
    .from("product_prices")
    .insert([insertRow])
    .select()
    .single()

  if (error) {
    console.error("Error creating product price:", error)
    return null
  }

  return data as unknown as SupabaseProductPrice
}


