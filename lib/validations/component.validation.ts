import { z } from 'zod'
import { 
  blockComponents, 
  blockMetadata, 
  blockDefaultContent, 
  blockDefaultStyles,
  blockContentSchemas,
  allowedBlockTypes 
} from '@/components/page-builder/blocks/registry'

// Re-exportar nombres legacy para compatibilidad
export { blockComponents as componentRegistry } from '@/components/page-builder/blocks/registry'
export { blockMetadata as componentMetadata } from '@/components/page-builder/blocks/registry'
export { blockDefaultContent as componentDefaultContent } from '@/components/page-builder/blocks/registry'
export { blockDefaultStyles as componentDefaultStyles } from '@/components/page-builder/blocks/registry'

/**
 * Lista de componentes permitidos (whitelist)
 * Ahora se genera automaticamente desde el registry modular
 */
export const ALLOWED_COMPONENTS = allowedBlockTypes as [string, ...string[]]

/**
 * Schemas de contenido por tipo de componente
 * Ahora importados directamente desde los configs de cada componente
 */
export const componentContentSchemas: Record<string, z.ZodSchema> = blockContentSchemas

/**
 * Schema para validar estilos de componentes
 */
export const componentStylesSchema = z.object({
  padding: z.string().optional(),
  margin: z.string().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  overlayColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  buttonTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  borderRadius: z.string().optional(),
  customClasses: z.string().optional(),
  className: z.string().optional(),
})

/**
 * Schema para crear un tipo de componente
 */
export const createComponentTypeSchema = z.object({
  name: z.enum(ALLOWED_COMPONENTS, {
    errorMap: () => ({ message: `Componente no permitido. Solo se permiten: ${ALLOWED_COMPONENTS.join(', ')}` })
  }),
  label: z.string().min(2).max(100),
  icon: z.string().optional(),
  default_content: z.record(z.unknown()).optional(),
})

/**
 * Valida el contenido de un componente segun su tipo
 */
export function validateComponentContent(
  componentType: string, 
  content: Record<string, unknown>
): { success: true; data: Record<string, unknown> } | { success: false; error: string } {
  const schema = componentContentSchemas[componentType]
  
  if (!schema) {
    return { success: false, error: `Tipo de componente desconocido: ${componentType}` }
  }
  
  const result = schema.safeParse(content)
  
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    }
  }
  
  return { success: true, data: result.data as Record<string, unknown> }
}

/**
 * Verifica si un componente esta en la whitelist
 */
export function isComponentAllowed(componentName: string): boolean {
  return componentName in blockComponents
}

/**
 * Obtiene la configuracion segura de un componente
 * Solo devuelve datos de componentes que existen en el registry
 */
export function getSecureComponentConfig(componentName: string): {
  metadata: typeof blockMetadata[string]
  defaultContent: Record<string, unknown>
  defaultStyles: Record<string, unknown>
} | null {
  if (!isComponentAllowed(componentName)) {
    return null
  }
  
  return {
    metadata: blockMetadata[componentName],
    defaultContent: blockDefaultContent[componentName] || {},
    defaultStyles: blockDefaultStyles[componentName] || {},
  }
}

/**
 * Obtiene todos los componentes permitidos con su configuracion
 */
export function getAllAllowedComponents(): Array<{
  name: string
  label: string
  icon: string
  description: string
}> {
  return ALLOWED_COMPONENTS.map(name => ({
    name,
    label: blockMetadata[name]?.label || name,
    icon: blockMetadata[name]?.icon || 'Box',
    description: blockMetadata[name]?.description || '',
  }))
}
