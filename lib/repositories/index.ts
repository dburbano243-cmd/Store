/**
 * Data Repositories - Capa de abstracción para acceso a datos
 * 
 * IMPORTANTE: Esta capa permite cambiar de proveedor de base de datos
 * sin modificar los componentes. Solo necesitas:
 * 
 * 1. Crear una nueva carpeta con las implementaciones (ej: /lib/repositories/postgres/)
 * 2. Implementar las interfaces definidas en types.ts
 * 3. Cambiar el import del dataProvider aquí
 * 
 * Los componentes usan: import { dataProvider } from "@/lib/repositories"
 * Y acceden a los datos con: dataProvider.products.getAll()
 */

// Re-export types
export * from "./types"

// Import Supabase implementations
import { supabaseProductRepository } from "./supabase/product.repository"
import { supabaseSliderRepository, supabaseVideoGalleryRepository } from "./supabase/static.repository"

import type { 
  DataProvider, 
  CategoryRepository, 
  Category,
  SiteSettingsRepository,
  SiteSettings
} from "./types"

// =============================================
// PLACEHOLDER IMPLEMENTATIONS
// =============================================

// Categorías (placeholder hasta que exista la tabla)
const placeholderCategoryRepository: CategoryRepository = {
  async getAll(): Promise<Category[]> {
    return []
  },
  async getBySlug(): Promise<Category | null> {
    return null
  },
  async getRootCategories(): Promise<Category[]> {
    return []
  },
  async getChildren(): Promise<Category[]> {
    return []
  },
}

// Site Settings (placeholder)
const placeholderSiteSettingsRepository: SiteSettingsRepository = {
  async get(): Promise<SiteSettings> {
    return {
      siteName: "Mi Tienda",
      siteDescription: "Tienda online de productos",
      socialLinks: {},
      contactInfo: {},
    }
  },
  async update(settings): Promise<SiteSettings> {
    return this.get()
  },
}

// =============================================
// DATA PROVIDER - Punto de entrada para datos
// =============================================

/**
 * Data Provider principal de la aplicación.
 * 
 * Para cambiar de Supabase a otro proveedor:
 * 1. Crea las implementaciones en /lib/repositories/[nuevo-proveedor]/
 * 2. Importa las nuevas implementaciones
 * 3. Reemplaza los repositorios aquí
 * 
 * Ejemplo para PostgreSQL directo:
 * ```
 * import { pgProductRepository } from "./postgres/product.repository"
 * 
 * export const dataProvider: DataProvider = {
 *   products: pgProductRepository,
 *   // ...
 * }
 * ```
 */
export const dataProvider: DataProvider = {
  products: supabaseProductRepository,
  sliders: supabaseSliderRepository,
  videoGallery: supabaseVideoGalleryRepository,
  categories: placeholderCategoryRepository,
  siteSettings: placeholderSiteSettingsRepository,
}

// =============================================
// CONVENIENCE EXPORTS
// =============================================

// Funciones de conveniencia para acceso rápido
export const getProducts = () => dataProvider.products.getAllForListing()
export const getProductBySlug = (slug: string) => dataProvider.products.getBySlug(slug)
export const getFeaturedProducts = (limit?: number) => dataProvider.products.getFeatured(limit)
export const getSlides = () => dataProvider.sliders.getActiveSlides()
export const getVideos = () => dataProvider.videoGallery.getActiveVideos()
