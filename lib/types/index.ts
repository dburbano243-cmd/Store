/**
 * Central export for all type definitions
 * Import from '@/lib/types' to get all public types
 */

// Product types (public)
export type {
  ProductMedia,
  ProductPrice,
  ProductAttribute,
  ProductVariant,
  Product,
  CartItem,
  MediaFile,
  ProductPayload,
  ProductPricePayload,
} from "./product.types"

// Order types (public)
export type {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  ShippingAddress,
  OrderItem,
  Order,
  Shipment,
} from "./order.types"

// Supabase types (internal - for data layer only)
export type {
  SupabaseProductMedia,
  SupabaseProductPrice,
  SupabaseProductAttribute,
  SupabaseProductVariant,
  SupabaseProduct,
} from "./supabase.types"

// Cache types (internal)
export type { CachedProducts } from "./cache.types"
