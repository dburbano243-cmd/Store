/**
 * Cache-related type definitions
 */

import type { Product } from "./product.types"

export interface CachedProducts {
  products: Product[]
  timestamp: number
}
