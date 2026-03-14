import { z } from 'zod'
import { componentRegistry, componentMetadata, componentDefaultContent, componentDefaultStyles } from '@/components/admin/page-builder/ComponentRegistry'

/**
 * Lista de componentes permitidos (whitelist)
 * Solo los componentes que existen en el registry pueden ser creados en la DB
 */
export const ALLOWED_COMPONENTS = Object.keys(componentRegistry) as [string, ...string[]]

/**
 * Schema para validar URLs seguras
 * Solo permite URLs relativas o de dominios específicos
 */
const safeUrlSchema = z.string().refine((url) => {
  // Permitir URLs relativas
  if (url.startsWith('/') || url.startsWith('#') || url === '') {
    return true
  }
  
  // Lista de dominios permitidos
  const allowedDomains = [
    'supabase.co',
    'vercel.app',
    'localhost',
    // Agregar más dominios según sea necesario
  ]
  
  try {
    const parsed = new URL(url)
    return allowedDomains.some(domain => parsed.hostname.endsWith(domain))
  } catch {
    return false
  }
}, {
  message: 'URL no permitida. Solo se permiten URLs relativas o de dominios autorizados.'
})

/**
 * Schema para sanitizar texto (prevenir XSS)
 */
const safeTextSchema = z.string().transform((text) => {
  // Eliminar tags HTML potencialmente peligrosos
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
})

/**
 * Schema base para un slide del hero slider
 */
const slideSchema = z.object({
  id: z.string(),
  title: safeTextSchema.optional(),
  subtitle: safeTextSchema.optional(),
  image: z.string().optional(),
  buttonText: safeTextSchema.optional(),
  buttonUrl: safeUrlSchema.optional(),
})

/**
 * Schema base para una card del carrusel
 */
const cardSchema = z.object({
  id: z.string(),
  title: safeTextSchema.optional(),
  description: safeTextSchema.optional(),
  image: z.string().optional(),
  link: safeUrlSchema.optional(),
})

/**
 * Schema para información de contacto
 */
const contactInfoSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phone: safeTextSchema.optional(),
  address: safeTextSchema.optional(),
})

/**
 * Schemas de contenido por tipo de componente
 */
export const componentContentSchemas: Record<string, z.ZodSchema> = {
  hero_slider: z.object({
    slides: z.array(slideSchema).optional(),
    autoplay: z.boolean().optional(),
    autoplaySpeed: z.number().min(1000).max(30000).optional(),
    showArrows: z.boolean().optional(),
    showDots: z.boolean().optional(),
  }),
  
  carousel_cards: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    cards: z.array(cardSchema).optional(),
    cardsPerView: z.number().min(1).max(6).optional(),
  }),
  
  contact_section: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    contactInfo: contactInfoSchema.optional(),
    formTitle: safeTextSchema.optional(),
    submitButtonText: safeTextSchema.optional(),
    showMap: z.boolean().optional(),
    mapEmbedUrl: safeUrlSchema.optional(),
  }),
  
  image_text: z.object({
    title: safeTextSchema.optional(),
    text: safeTextSchema.optional(),
    image: z.string().optional(),
    imageAlt: safeTextSchema.optional(),
    imagePosition: z.enum(['left', 'right']).optional(),
    showButton: z.boolean().optional(),
    buttonText: safeTextSchema.optional(),
    buttonUrl: safeUrlSchema.optional(),
  }),
  
  title_text: z.object({
    title: safeTextSchema.optional(),
    text: safeTextSchema.optional(),
    alignment: z.enum(['left', 'center', 'right']).optional(),
    titleSize: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  }),
}

/**
 * Schema para validar estilos de componentes
 */
export const componentStylesSchema = z.object({
  padding: z.string().optional(),
  margin: z.string().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^$/).optional(),
  borderRadius: z.string().optional(),
  customClasses: z.string().optional(),
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
 * Valida el contenido de un componente según su tipo
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
 * Verifica si un componente está en la whitelist
 */
export function isComponentAllowed(componentName: string): boolean {
  return componentName in componentRegistry
}

/**
 * Obtiene la configuración segura de un componente
 * Solo devuelve datos de componentes que existen en el registry
 */
export function getSecureComponentConfig(componentName: string): {
  metadata: typeof componentMetadata[string]
  defaultContent: Record<string, unknown>
  defaultStyles: Record<string, unknown>
} | null {
  if (!isComponentAllowed(componentName)) {
    return null
  }
  
  return {
    metadata: componentMetadata[componentName],
    defaultContent: componentDefaultContent[componentName] || {},
    defaultStyles: componentDefaultStyles[componentName] || {},
  }
}

/**
 * Obtiene todos los componentes permitidos con su configuración
 */
export function getAllAllowedComponents(): Array<{
  name: string
  label: string
  icon: string
  description: string
}> {
  return ALLOWED_COMPONENTS.map(name => ({
    name,
    label: componentMetadata[name]?.label || name,
    icon: componentMetadata[name]?.icon || 'Box',
    description: componentMetadata[name]?.description || '',
  }))
}
