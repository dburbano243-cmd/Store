import { supabase } from "./supabase"
import type { Product, ProductMedia } from "./types"

/* ------------------------------------------------------------------ */
/*  Supabase row shape (raw query result)                             */
/* ------------------------------------------------------------------ */

interface SupabaseProductMedia {
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

interface SupabaseProductPrice {
  id: string
  amount: number
  currency_code: string
  is_active: boolean
  source: string | null
  effective_at: string | null
  expires_at: string | null
}

interface SupabaseProductDiscount {
  id: string
  currency_code: string
  discount_amount: number | null
  discount_amount_in_cents: number | null
  discount_percent: number | null
  is_active: boolean
}

interface SupabaseProduct {
  id: string
  slug: string | null
  name: string
  description: string
  units_in_stock: number
  stock: number
  stars: number
  reviews: number
  created_at: string
  product_features: { id: string; name: string }[]
  product_media: SupabaseProductMedia[]
  product_prices: SupabaseProductPrice[]
  product_price_discounts: SupabaseProductDiscount[]
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

function mapProduct(row: SupabaseProduct): Product {
  // Sort media by position (nulls last), then primary first
  const sortedMedia = [...(row.product_media ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.position ?? 999) - (b.position ?? 999)
    })
    .map(mapMedia)

  // Build prices by currency from the product_prices relation
  const activePrices = (row.product_prices ?? []).filter((p) => p.is_active)
  const pricesByCurrency: Record<string, number> = {}
  for (const p of activePrices) {
    pricesByCurrency[p.currency_code] = p.amount
  }

  // Main COP price
  const copPrice = pricesByCurrency["COP"] ?? 0

  // Calculate price without discount from active discounts
  const activeDiscounts = (row.product_price_discounts ?? []).filter(
    (d) => d.is_active && d.currency_code === "COP"
  )
  let priceWithDiscount = copPrice
  if (activeDiscounts.length > 0) {
    const discount = activeDiscounts[0]
    const discountAmt = discount.discount_amount ?? discount.discount_amount_in_cents
    if (discountAmt) {
      priceWithDiscount = copPrice - discountAmt
    } else if (discount.discount_percent) {
      priceWithDiscount = Math.round(copPrice / (1 - discount.discount_percent / 100))
    }
  }

  // Normalize discounts so UI can use them (support both discount_amount or discount_amount_in_cents)
  const discounts = (row.product_price_discounts ?? []).map((d) => {
    const anyd = d as any
    const discount_amount = anyd.discount_amount ?? anyd.discount_amount_in_cents ?? undefined
    return {
      id: d.id,
      currency_code: d.currency_code,
      discount_amount: discount_amount,
      discount_percent: d.discount_percent ?? undefined,
      metadata: anyd.metadata,
      is_active: d.is_active,
    }
  })

  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: row.name,
    description: row.description,
    price: copPrice,
    priceWithDiscount,
    prices_by_currency: pricesByCurrency,
    stock: row.stock ?? row.units_in_stock ?? 0,
    units_in_stock: row.units_in_stock ?? row.stock ?? 0,
    stars: row.stars ?? 0,
    reviews: row.reviews ?? 0,
    features: row.product_features?.map((f) => f.name) ?? [],
    media: sortedMedia,
    discounts,
  }
}

/* ------------------------------------------------------------------ */
/*  Select fragment used in every query                               */
/* ------------------------------------------------------------------ */

const PRODUCT_SELECT = `
  *,
  product_features ( id, name ),
  product_media ( id, storage_path, url, media_type, content_type, file_name, file_size, position, alt_text, is_primary ),
  product_prices ( id, amount, currency_code, is_active),
  product_price_discounts ( id, currency_code, discount_amount, discount_percent, start_at, end_at, is_active, metadata)
`

/* ------------------------------------------------------------------ */
/*  READ helpers                                                      */
/* ------------------------------------------------------------------ */

export async function fetchProducts(): Promise<Product[]> {
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

    return (data as unknown as SupabaseProduct[]).map(mapProduct)
  } catch (err) {
    console.error("Exception fetching products:", err)
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

export interface ProductPayload {
  name: string
  slug?: string
  description: string
  units_in_stock: number
  stars?: number
  reviews?: number
}

export async function createProduct(payload: ProductPayload): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      slug: payload.slug ?? payload.name.toLowerCase().replace(/\s+/g, "-"),
      description: payload.description,
      units_in_stock: payload.units_in_stock,
      stock: payload.units_in_stock,
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
  if (payload.units_in_stock !== undefined) {
    updateData.units_in_stock = payload.units_in_stock
    updateData.stock = payload.units_in_stock
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
  // Remove media and feature associations first (FK constraints)
  await supabase.from("product_media").delete().eq("product_id", id)
  await supabase.from("product_features").delete().eq("product_id", id)

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

export interface ProductPricePayload {
  product_id: string
  amount: number
  currency_code?: string
  is_active?: boolean
}

export async function createProductPrice(
  payload: Omit<ProductPricePayload, "product_id"> & { product_id: string }
): Promise<SupabaseProductPrice | null> {
  const insertRow = {
    product_id: payload.product_id,
    amount: payload.amount,
    currency_code: payload.currency_code ?? "COP",
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

export interface ProductPriceDiscountPayload {
  product_id: string
  currency_code?: string
  discount_amount?: number | null
  discount_percent?: number | null
  start_at?: string | null
  end_at?: string | null
  metadata?: any
  is_active?: boolean
}

export async function createProductDiscount(
  payload: ProductPriceDiscountPayload
): Promise<SupabaseProductDiscount | null> {
  const insertRow: Record<string, unknown> = {
    product_id: payload.product_id,
    currency_code: payload.currency_code ?? "COP",
    discount_amount: payload.discount_amount ?? null,
    discount_percent: payload.discount_percent ?? null,
    start_at: payload.start_at || new Date().toISOString(),
    end_at: payload.end_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: payload.metadata ?? null,
    is_active: payload.is_active ?? true,
  }

  const { data, error } = await supabase
    .from("product_price_discounts")
    .insert([insertRow])
    .select()
    .single()

  if (error) {
    console.error("Error creating product price discount:", error)
    return null
  }

  return data as unknown as SupabaseProductDiscount
}

export async function updateProductDiscount(
  id: string,
  payload: Partial<ProductPriceDiscountPayload>
): Promise<SupabaseProductDiscount | null> {
  const updateData: Record<string, unknown> = {}

  if (payload.currency_code !== undefined) updateData.currency_code = payload.currency_code
  if (payload.discount_amount !== undefined) updateData.discount_amount = payload.discount_amount
  if (payload.discount_percent !== undefined) updateData.discount_percent = payload.discount_percent
  if (payload.start_at !== undefined) updateData.start_at = payload.start_at
  if (payload.end_at !== undefined) updateData.end_at = payload.end_at
  if (payload.metadata !== undefined) updateData.metadata = payload.metadata
  if (payload.is_active !== undefined) updateData.is_active = payload.is_active

  const { data, error } = await supabase
    .from("product_price_discounts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating product price discount:", error)
    return null
  }

  return data as unknown as SupabaseProductDiscount
}

export async function deleteProductDiscount(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("product_price_discounts")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product price discount:", error)
    return false
  }

  return true
}

export async function deleteAllProductDiscounts(productId: string): Promise<boolean> {
  const { error } = await supabase
    .from("product_price_discounts")
    .delete()
    .eq("product_id", productId)

  if (error) {
    console.error("Error deleting all product discounts:", error)
    return false
  }

  return true
}
