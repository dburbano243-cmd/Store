import { z } from "zod"
import type { ComponentStyles, EditableComponentProps } from "@/lib/types/page-builder.types"

/**
 * Props base para todos los componentes del page builder
 */
export interface BlockComponentProps extends EditableComponentProps {
  content: Record<string, unknown>
  styles: ComponentStyles
  /** ID del page_component en la DB - necesario para cargar media asociado */
  componentId?: string
}

/**
 * Configuracion de un campo editable en el sidebar
 */
export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'color' | 'select' | 'number' | 'boolean' | 'array'
  defaultValue?: unknown
  options?: { label: string; value: string }[]
}

/**
 * Metadata del componente para la UI del builder
 */
export interface ComponentMeta {
  name: string
  label: string
  category: 'heroes' | 'content' | 'products' | 'media' | 'contact' | 'interactive'
  icon: string
  description: string
}

/**
 * Configuracion del editor de arrays (slides/cards)
 * Define que campos tiene cada item del array y como se muestra en el editor
 */
export interface ArrayEditorConfig {
  /** Nombre del campo array en el content (ej: "slides", "cards", "items") */
  arrayFieldName: string
  /** Labels para la UI */
  labels: {
    title: string
    addButton: string
    itemLabel: string
  }
  /** Campos que tiene cada item del array */
  itemFields: {
    image?: boolean
    title?: boolean
    subtitle?: boolean
    description?: boolean
    buttonText?: boolean
    buttonUrl?: boolean
    pageUrl?: boolean  // URL selector de paginas internas
    link?: boolean
  }
  /** Template para un nuevo item (opcional, se genera automatico si no se provee) */
  newItemTemplate?: Record<string, unknown>
}

/**
 * Configuracion completa de un componente block
 */
export interface BlockConfig {
  /** Metadata para la UI */
  meta: ComponentMeta
  /** Campos editables en el sidebar */
  fields: FieldConfig[]
  /** Contenido por defecto al crear el componente */
  defaultContent: Record<string, unknown>
  /** Estilos por defecto */
  defaultStyles: ComponentStyles
  /** Schema de validacion Zod para el contenido */
  contentSchema: z.ZodObject<z.ZodRawShape>
  /** Configuracion del editor de arrays (slides/cards) - opcional */
  arrayEditor?: ArrayEditorConfig
}

/**
 * Campos de estilo comunes reutilizables
 */
export const commonStyleFields = {
  backgroundColor: { name: 'styles.backgroundColor', label: 'Color de fondo', type: 'color' as const, defaultValue: '#ffffff' },
  textColor: { name: 'styles.textColor', label: 'Color de texto', type: 'color' as const, defaultValue: '#111827' },
  accentColor: { name: 'styles.accentColor', label: 'Color de acento', type: 'color' as const, defaultValue: '#3b82f6' },
  overlayColor: { name: 'styles.overlayColor', label: 'Color del overlay', type: 'color' as const, defaultValue: '#000000' },
  buttonColor: { name: 'styles.buttonColor', label: 'Color del boton', type: 'color' as const, defaultValue: '#111827' },
  buttonTextColor: { name: 'styles.buttonTextColor', label: 'Color texto boton', type: 'color' as const, defaultValue: '#ffffff' },
}

/**
 * Schema base para texto seguro (previene XSS)
 */
export const safeTextSchema = z.string().max(10000).refine(
  (val) => !/<script|javascript:|on\w+=/i.test(val),
  { message: "Contenido no permitido" }
)
