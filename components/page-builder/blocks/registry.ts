/**
 * Auto-discovery registry para componentes del page builder
 * 
 * Este archivo importa todos los componentes desde sus carpetas
 * y exporta los registros agregados para uso en el sistema.
 * 
 * Para agregar un nuevo componente:
 * 1. Crear carpeta en /components/page-builder/blocks/[nombre]/
 * 2. Crear index.tsx con el componente
 * 3. Crear config.ts con la configuracion BlockConfig
 * 4. Importar aqui y agregar a los registros
 */

import type { ComponentType } from "react"
import type { BlockConfig, BlockComponentProps } from "./types"
import type { ComponentStyles } from "@/lib/types/page-builder.types"
import { z } from "zod"

// ============================================
// IMPORTACIONES DE COMPONENTES
// ============================================

// Heroes / Banners
import { HeroSlider } from "./hero-slider"
import { heroSliderConfig } from "./hero-slider/config"

import { HeroBannerLeft } from "./hero-banner-left"
import { heroBannerLeftConfig } from "./hero-banner-left/config"

import { HeroBannerRight } from "./hero-banner-right"
import { heroBannerRightConfig } from "./hero-banner-right/config"

import { HeaderEteris } from "./header-eteris"
import { headerEterisConfig } from "./header-eteris/config"

// Content
import { TitleText } from "./title-text"
import { titleTextConfig } from "./title-text/config"

import { ImageText } from "./image-text"
import { imageTextConfig } from "./image-text/config"

import { ImageTextLeft } from "./image-text-left"
import { imageTextLeftConfig } from "./image-text-left/config"

import { ImageTextRight } from "./image-text-right"
import { imageTextRightConfig } from "./image-text-right/config"

import { CarouselCards } from "./carousel-cards"
import { carouselCardsConfig } from "./carousel-cards/config"

// Products
import { ProductGridBlock } from "./product-grid"
import { productGridConfig } from "./product-grid/config"

// Media
import { VideoGalleryBlock } from "./video-gallery"
import { videoGalleryConfig } from "./video-gallery/config"

// Contact
import { ContactSection } from "./contact-section"
import { contactSectionConfig } from "./contact-section/config"

// ============================================
// REGISTRO DE COMPONENTES
// ============================================

/** Lista de todas las configuraciones */
const allConfigs: BlockConfig[] = [
  heroSliderConfig,
  heroBannerLeftConfig,
  heroBannerRightConfig,
  headerEterisConfig,
  titleTextConfig,
  imageTextConfig,
  imageTextLeftConfig,
  imageTextRightConfig,
  carouselCardsConfig,
  productGridConfig,
  videoGalleryConfig,
  contactSectionConfig,
]

/** Mapa de componentes React por nombre */
export const blockComponents: Record<string, ComponentType<BlockComponentProps>> = {
  hero_slider: HeroSlider,
  hero_banner_left: HeroBannerLeft,
  hero_banner_right: HeroBannerRight,
  header_eteris: HeaderEteris,
  title_text: TitleText,
  image_text: ImageText,
  image_text_left: ImageTextLeft,
  image_text_right: ImageTextRight,
  carousel_cards: CarouselCards,
  product_grid: ProductGridBlock,
  video_gallery: VideoGalleryBlock,
  contact_section: ContactSection,
}

// ============================================
// REGISTROS AGREGADOS (generados desde configs)
// ============================================

/** Categorias de componentes para la UI */
export const blockCategories: Record<string, { label: string; components: string[] }> = {
  heroes: {
    label: "Heroes / Banners",
    components: allConfigs.filter(c => c.meta.category === 'heroes').map(c => c.meta.name),
  },
  content: {
    label: "Contenido",
    components: allConfigs.filter(c => c.meta.category === 'content').map(c => c.meta.name),
  },
  products: {
    label: "Productos",
    components: allConfigs.filter(c => c.meta.category === 'products').map(c => c.meta.name),
  },
  media: {
    label: "Media",
    components: allConfigs.filter(c => c.meta.category === 'media').map(c => c.meta.name),
  },
  contact: {
    label: "Contacto",
    components: allConfigs.filter(c => c.meta.category === 'contact').map(c => c.meta.name),
  },
}

/** Metadata de componentes para la UI */
export const blockMetadata: Record<string, { label: string; icon: string; description: string }> = 
  Object.fromEntries(
    allConfigs.map(c => [c.meta.name, { 
      label: c.meta.label, 
      icon: c.meta.icon, 
      description: c.meta.description 
    }])
  )

/** Campos editables por tipo de componente */
export const blockFieldConfigs: Record<string, BlockConfig['fields']> = 
  Object.fromEntries(allConfigs.map(c => [c.meta.name, c.fields]))

/** Contenido por defecto por tipo de componente */
export const blockDefaultContent: Record<string, Record<string, unknown>> = 
  Object.fromEntries(allConfigs.map(c => [c.meta.name, c.defaultContent]))

/** Estilos por defecto por tipo de componente */
export const blockDefaultStyles: Record<string, ComponentStyles> = 
  Object.fromEntries(allConfigs.map(c => [c.meta.name, c.defaultStyles]))

/** Schemas de validacion por tipo de componente */
export const blockContentSchemas: Record<string, z.ZodObject<z.ZodRawShape>> = 
  Object.fromEntries(allConfigs.map(c => [c.meta.name, c.contentSchema]))

/** Lista de nombres de componentes permitidos */
export const allowedBlockTypes: string[] = allConfigs.map(c => c.meta.name)
