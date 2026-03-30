/**
 * Repository Types - Interfaces abstractas para acceso a datos
 * 
 * Esta capa de abstracción permite cambiar el proveedor de base de datos
 * (Supabase, PostgreSQL directo, Firebase, etc.) sin modificar los componentes.
 * Solo necesitas implementar estas interfaces con el nuevo proveedor.
 */

import type { Product } from "@/lib/types"

// =============================================
// PRODUCT REPOSITORY
// =============================================

export interface ProductRepository {
  /** Obtener todos los productos */
  getAll(): Promise<Product[]>
  
  /** Obtener productos para listado (con media limitada para mejor rendimiento) */
  getAllForListing(): Promise<Product[]>
  
  /** Obtener un producto por su slug */
  getBySlug(slug: string): Promise<Product | null>
  
  /** Obtener un producto por su ID */
  getById(id: string): Promise<Product | null>
  
  /** Obtener productos destacados */
  getFeatured(limit?: number): Promise<Product[]>
  
  /** Obtener productos por categoría */
  getByCategory(categorySlug: string): Promise<Product[]>
  
  /** Buscar productos */
  search(query: string): Promise<Product[]>
}

// =============================================
// SLIDER/BANNER REPOSITORY
// =============================================

export interface SliderSlide {
  id: string
  src: string
  type: "image" | "video"
  title: string
  subtitle: string
  buttonText?: string
  buttonUrl?: string
  position: number
  isActive: boolean
}

export interface SliderRepository {
  /** Obtener todos los slides activos */
  getActiveSlides(): Promise<SliderSlide[]>
  
  /** Obtener slide por ID */
  getById(id: string): Promise<SliderSlide | null>
}

// =============================================
// VIDEO GALLERY REPOSITORY
// =============================================

export interface GalleryVideo {
  id: string
  src: string
  type: "image" | "video"
  title: string
  description: string
  thumbnail: string
  position: number
  isActive: boolean
}

export interface VideoGalleryRepository {
  /** Obtener todos los videos activos */
  getActiveVideos(): Promise<GalleryVideo[]>
  
  /** Obtener video por ID */
  getById(id: string): Promise<GalleryVideo | null>
}

// =============================================
// CATEGORY REPOSITORY
// =============================================

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  position: number
  isActive: boolean
}

export interface CategoryRepository {
  /** Obtener todas las categorías activas */
  getAll(): Promise<Category[]>
  
  /** Obtener categoría por slug */
  getBySlug(slug: string): Promise<Category | null>
  
  /** Obtener categorías principales (sin padre) */
  getRootCategories(): Promise<Category[]>
  
  /** Obtener subcategorías de una categoría */
  getChildren(parentId: string): Promise<Category[]>
}

// =============================================
// SITE SETTINGS REPOSITORY
// =============================================

export interface SiteSettings {
  siteName: string
  siteDescription: string
  logo?: string
  favicon?: string
  socialLinks: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
    whatsapp?: string
  }
  contactInfo: {
    email?: string
    phone?: string
    address?: string
  }
}

export interface SiteSettingsRepository {
  /** Obtener configuración del sitio */
  get(): Promise<SiteSettings>
  
  /** Actualizar configuración del sitio */
  update(settings: Partial<SiteSettings>): Promise<SiteSettings>
}

// =============================================
// DATA PROVIDER - Factory para repositorios
// =============================================

export interface DataProvider {
  products: ProductRepository
  sliders: SliderRepository
  videoGallery: VideoGalleryRepository
  categories: CategoryRepository
  siteSettings: SiteSettingsRepository
}
