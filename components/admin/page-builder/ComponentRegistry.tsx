/**
 * ComponentRegistry - Re-exporta desde el nuevo sistema de componentes modular
 * 
 * DEPRECADO: Este archivo se mantiene para compatibilidad con código existente.
 * Para nuevos componentes, agregar directamente en /components/page-builder/blocks/[nombre]/
 * 
 * El nuevo sistema auto-detecta componentes basándose en sus carpetas.
 * Cada componente tiene:
 * - index.tsx: El componente React
 * - config.ts: Metadata, campos, defaults y schema de validación
 */

import type { ComponentStyles, EditableComponentProps } from "@/lib/types/page-builder.types"

// Re-exportar todo desde el nuevo registry modular
export {
  blockComponents as componentRegistry,
  blockCategories as componentCategories,
  blockMetadata as componentMetadata,
  blockFieldConfigs as componentFieldConfigs,
  blockDefaultContent as componentDefaultContent,
  blockDefaultStyles as componentDefaultStyles,
} from "@/components/page-builder/blocks/registry"

// También exportamos para nuevos consumidores con nombres más claros
export {
  blockComponents,
  blockCategories,
  blockMetadata,
  blockFieldConfigs,
  blockDefaultContent,
  blockDefaultStyles,
  blockContentSchemas,
  allowedBlockTypes,
} from "@/components/page-builder/blocks/registry"

/**
 * Props para componentes registrados en el editor visual
 * @deprecated Usar BlockComponentProps de @/components/page-builder/blocks/types
 */
export interface RegisteredComponentProps extends EditableComponentProps {
  /** Contenido del componente (draft_content) */
  content: Record<string, unknown>
  /** Estilos del componente */
  styles: ComponentStyles
}

/**
 * Tipo para un componente registrado
 * @deprecated Usar BlockComponentProps de @/components/page-builder/blocks/types
 */
export type RegisteredComponent = React.ComponentType<RegisteredComponentProps>
