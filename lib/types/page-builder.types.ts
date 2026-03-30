// =============================================
// PAGE BUILDER TYPES
// =============================================

/**
 * Status de una página
 */
export type PageStatus = 'draft' | 'published' | 'archived'

/**
 * Página del sitio
 */
export interface Page {
  id: string
  title: string
  slug: string
  status: PageStatus
  parent_id: string | null
  is_home: boolean
  is_deletable: boolean
  seo_metadata: SEOMetadata
  created_at: string
  updated_at: string
}

/**
 * SEO Metadata para páginas
 */
export interface SEOMetadata {
  meta_title?: string
  meta_description?: string
  og_image?: string
  keywords?: string[]
}

/**
 * Tipo de componente (catálogo)
 */
export interface ComponentType {
  id: string
  name: string
  label: string
  default_content: Record<string, unknown>
  icon: string | null
  created_at: string
}

/**
 * Asset de medios
 */
export interface MediaAsset {
  id: string
  url: string
  alt_text: string | null
  file_metadata: MediaFileMetadata
  deleted_at: string | null
  created_at: string
}

/**
 * Metadata de archivo de medios
 */
export interface MediaFileMetadata {
  file_name?: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
}

/**
 * Componente de página
 */
export interface PageComponent {
  id: string
  page_id: string | null
  component_type: string
  draft_content: Record<string, unknown>
  published_content: Record<string, unknown>
  styles: ComponentStyles
  sort_order: number
  is_active: boolean
  is_global: boolean
  created_at: string
  updated_at: string
}

/**
 * Estilos de componente
 */
export interface ComponentStyles {
  className?: string
  padding?: string
  margin?: string
  backgroundColor?: string
  textColor?: string
  [key: string]: unknown
}

/**
 * Página con sus componentes (para el editor)
 */
export interface PageWithComponents extends Page {
  components: PageComponent[]
}

/**
 * Input para crear una página
 */
export interface CreatePageInput {
  title: string
  slug: string
  status?: PageStatus
  parent_id?: string | null
  is_home?: boolean
  seo_metadata?: SEOMetadata
}

/**
 * Input para actualizar una página
 */
export interface UpdatePageInput {
  title?: string
  slug?: string
  status?: PageStatus
  parent_id?: string | null
  is_home?: boolean
  seo_metadata?: SEOMetadata
}

/**
 * Input para crear un componente
 */
export interface CreateComponentInput {
  page_id: string | null
  component_type: string
  draft_content?: Record<string, unknown>
  styles?: ComponentStyles
  sort_order: number
  is_active?: boolean
  is_global?: boolean
}

/**
 * Input para actualizar un componente
 */
export interface UpdateComponentInput {
  draft_content?: Record<string, unknown>
  styles?: ComponentStyles
  sort_order?: number
  is_active?: boolean
}

/**
 * Props base para componentes editables
 */
export interface EditableComponentProps {
  /** Modo de edición activo */
  isEditable?: boolean
  /** Componente seleccionado actualmente */
  isSelected?: boolean
  /** Callback cuando se selecciona el componente */
  onSelect?: () => void
  /** Callback cuando cambia el contenido */
  onContentChange?: (content: Record<string, unknown>) => void
  /** Callback cuando cambian los estilos */
  onStylesChange?: (styles: ComponentStyles) => void
}

/**
 * Configuración del componente para el editor
 */
export interface ComponentConfig {
  /** Nombre único del componente */
  name: string
  /** Etiqueta para mostrar en UI */
  label: string
  /** Icono del componente */
  icon: string
  /** Contenido por defecto */
  defaultContent: Record<string, unknown>
  /** Estilos por defecto */
  defaultStyles: ComponentStyles
  /** Campos editables del componente */
  editableFields: EditableField[]
}

/**
 * Campo editable de un componente
 */
export interface EditableField {
  /** Nombre del campo */
  name: string
  /** Etiqueta para mostrar */
  label: string
  /** Tipo de campo */
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'color' | 'select' | 'number' | 'boolean'
  /** Opciones para campos select */
  options?: { label: string; value: string }[]
  /** Valor por defecto */
  defaultValue?: unknown
}

/**
 * Estado del Visual Editor
 */
export interface VisualEditorState {
  /** Página actual */
  page: PageWithComponents | null
  /** Componentes globales */
  globalComponents: PageComponent[]
  /** Componente seleccionado */
  selectedComponentId: string | null
  /** Cambios sin guardar */
  hasUnsavedChanges: boolean
  /** Cargando */
  isLoading: boolean
  /** Error */
  error: string | null
}

/**
 * Acciones del Visual Editor
 */
export interface VisualEditorActions {
  /** Seleccionar un componente */
  selectComponent: (id: string | null) => void
  /** Actualizar contenido de un componente */
  updateComponentContent: (id: string, content: Record<string, unknown>) => void
  /** Actualizar estilos de un componente */
  updateComponentStyles: (id: string, styles: ComponentStyles) => void
  /** Reordenar componentes */
  reorderComponents: (activeId: string, overId: string) => void
  /** Agregar un componente */
  addComponent: (componentType: string, position?: number) => void
  /** Eliminar un componente */
  removeComponent: (id: string) => void
  /** Guardar borrador */
  saveDraft: () => Promise<void>
  /** Publicar página */
  publish: () => Promise<void>
}
