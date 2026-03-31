/**
 * ============================================
 * ARCHIVO GENERADO AUTOMÁTICAMENTE
 * ============================================
 * NO EDITAR MANUALMENTE
 * 
 * Este archivo es generado por: scripts/generate-block-registry.js
 * Se regenera automáticamente al ejecutar npm run dev o npm run build
 * 
 * Para agregar un nuevo componente:
 * 1. Crea una carpeta en components/page-builder/blocks/nombre-componente/
 * 2. Agrega index.tsx (componente) y config.ts (configuración)
 * 3. Ejecuta npm run dev o npm run generate:blocks
 * ============================================
 */

import type { ComponentType } from "react"
import type { BlockConfig, BlockComponentProps } from "./types"

// ============================================
// IMPORTS AUTO-GENERADOS
// ============================================
import { HeroSlider } from "./hero-slider"
import { heroSliderConfig } from "./hero-slider/config"
import { HeroBannerLeft } from "./hero-banner-left"
import { heroBannerLeftConfig } from "./hero-banner-left/config"
import { HeroBannerRight } from "./hero-banner-right"
import { heroBannerRightConfig } from "./hero-banner-right/config"
import { HeaderEteris } from "./header-eteris"
import { headerEterisConfig } from "./header-eteris/config"
import { FullCardsSlider } from "./full-cards-slider"
import { fullCardsSliderConfig } from "./full-cards-slider/config"
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
import { ProductGridBlock } from "./product-grid"
import { productGridConfig } from "./product-grid/config"
import { VideoGalleryBlock } from "./video-gallery"
import { videoGalleryConfig } from "./video-gallery/config"
import { ContactSection } from "./contact-section"
import { contactSectionConfig } from "./contact-section/config"
import { MasonryEteris } from "./masonry-eteris"
import { masonryEterisConfig } from "./masonry-eteris/config"

// ============================================
// REGISTRY AUTO-GENERADO
// ============================================
interface BlockRegistryEntry {
  component: ComponentType<BlockComponentProps>
  config: BlockConfig
}

const blockRegistry: Record<string, BlockRegistryEntry> = {
  "hero_slider": { component: HeroSlider, config: heroSliderConfig },
  "hero_banner_left": { component: HeroBannerLeft, config: heroBannerLeftConfig },
  "hero_banner_right": { component: HeroBannerRight, config: heroBannerRightConfig },
  "header_eteris": { component: HeaderEteris, config: headerEterisConfig },
  "full_cards_slider": { component: FullCardsSlider, config: fullCardsSliderConfig },
  "title_text": { component: TitleText, config: titleTextConfig },
  "image_text": { component: ImageText, config: imageTextConfig },
  "image_text_left": { component: ImageTextLeft, config: imageTextLeftConfig },
  "image_text_right": { component: ImageTextRight, config: imageTextRightConfig },
  "carousel_cards": { component: CarouselCards, config: carouselCardsConfig },
  "product_grid": { component: ProductGridBlock, config: productGridConfig },
  "video_gallery": { component: VideoGalleryBlock, config: videoGalleryConfig },
  "contact_section": { component: ContactSection, config: contactSectionConfig },
  "masonry_eteris": { component: MasonryEteris, config: masonryEterisConfig },
}

// ============================================
// EXPORTS DERIVADOS
// ============================================

/** Lista de nombres de bloques permitidos */
export const allowedBlockTypes = Object.keys(blockRegistry)

/** Mapa de componentes React por nombre */
export const blockComponents: Record<string, ComponentType<BlockComponentProps>> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.component])
  )

/** Mapa de configuraciones por nombre */
export const blockConfigs: Record<string, BlockConfig> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config])
  )

/** Metadata de bloques (label, icon, category) */
export const blockMetadata: Record<string, { label: string; icon: string; category: string }> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [
      name, 
      { label: entry.config.meta.label, icon: entry.config.meta.icon, category: entry.config.meta.category }
    ])
  )

/** Campos configurables por tipo de bloque */
export const blockFieldConfigs: Record<string, BlockConfig['fields']> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.fields])
  )

/** Contenido por defecto de cada bloque */
export const blockDefaultContent: Record<string, BlockConfig['defaultContent']> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.defaultContent])
  )

/** Estilos por defecto de cada bloque */
export const blockDefaultStyles: Record<string, BlockConfig['defaultStyles']> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.defaultStyles])
  )

/** Schemas de validación de contenido */
export const blockContentSchemas: Record<string, BlockConfig['contentSchema']> = 
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.contentSchema])
  )

/** Configuración de editores de arrays (slides, cards, etc) */
export const blockArrayEditorConfigs: Record<string, BlockConfig['arrayEditor']> = 
  Object.fromEntries(
    Object.entries(blockRegistry)
      .filter(([, entry]) => entry.config.arrayEditor)
      .map(([name, entry]) => [name, entry.config.arrayEditor])
  )

/** Categorías disponibles */
export const blockCategories = [
  { key: "layout", label: "Layout" },
  { key: "content", label: "Contenido" },
  { key: "media", label: "Media" },
  { key: "ecommerce", label: "E-commerce" },
  { key: "interactive", label: "Interactivo" },
]

// ============================================
// FUNCIONES HELPER
// ============================================

/** Obtiene la configuración completa de un bloque */
export function getBlockConfig(blockName: string): BlockConfig | undefined {
  return blockRegistry[blockName]?.config
}

/** Obtiene el componente de un bloque */
export function getBlockComponent(blockName: string): ComponentType<BlockComponentProps> | undefined {
  return blockRegistry[blockName]?.component
}

/** Verifica si un tipo de bloque es válido */
export function isValidBlockType(blockName: string): boolean {
  return blockName in blockRegistry
}

/** Obtiene el contenido por defecto de un bloque */
export function getDefaultContent(blockName: string): Record<string, unknown> {
  return blockRegistry[blockName]?.config.defaultContent ?? {}
}

/** Obtiene los estilos por defecto de un bloque */
export function getDefaultStyles(blockName: string): Record<string, unknown> {
  return blockRegistry[blockName]?.config.defaultStyles ?? {}
}
