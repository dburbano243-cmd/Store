import { supabase } from '@/lib/supabase'
import type {
  Page,
  PageComponent,
  PageWithComponents,
  CreatePageInput,
  UpdatePageInput,
  CreateComponentInput,
  UpdateComponentInput,
  ComponentType,
  MediaAsset,
} from '@/lib/types/page-builder.types'
import { 
  isComponentAllowed, 
  validateComponentContent,
  getSecureComponentConfig,
  ALLOWED_COMPONENTS
} from '@/lib/validations/component.validation'

// =============================================
// PAGES SERVICE
// =============================================

/**
 * Obtener todas las páginas
 */
export async function getPages(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pages:', error)
    throw new Error(`Error fetching pages: ${error.message}`)
  }

  return data || []
}

/**
 * Obtener una página por ID
 */
export async function getPageById(id: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('Error fetching page:', error)
    throw new Error(`Error fetching page: ${error.message}`)
  }

  return data
}

/**
 * Obtener una página por slug
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching page by slug:', error)
    throw new Error(`Error fetching page by slug: ${error.message}`)
  }

  return data
}

/**
 * Obtener página con todos sus componentes
 */
export async function getPageWithComponents(id: string): Promise<PageWithComponents | null> {
  // Obtener la página
  const page = await getPageById(id)
  if (!page) return null

  // Obtener los componentes de la página
  const { data: components, error } = await supabase
    .from('page_components')
    .select('*')
    .eq('page_id', id)
    .eq('is_global', false)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching page components:', error)
    throw new Error(`Error fetching page components: ${error.message}`)
  }

  return {
    ...page,
    components: components || [],
  }
}

/**
 * Crear una nueva página
 */
export async function createPage(input: CreatePageInput): Promise<Page> {
  const { data, error } = await supabase
    .from('pages')
    .insert({
      title: input.title,
      slug: input.slug,
      status: input.status || 'draft',
      parent_id: input.parent_id || null,
      is_home: input.is_home || false,
      seo_metadata: input.seo_metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating page:', error)
    throw new Error(`Error creating page: ${error.message}`)
  }

  return data
}

/**
 * Actualizar una página
 */
export async function updatePage(id: string, input: UpdatePageInput): Promise<Page> {
  const { data, error } = await supabase
    .from('pages')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating page:', error)
    throw new Error(`Error updating page: ${error.message}`)
  }

  return data
}

/**
 * Eliminar una página
 */
export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting page:', error)
    throw new Error(`Error deleting page: ${error.message}`)
  }
}

// =============================================
// PAGE COMPONENTS SERVICE
// =============================================

/**
 * Obtener componentes globales
 */
export async function getGlobalComponents(): Promise<PageComponent[]> {
  const { data, error } = await supabase
    .from('page_components')
    .select('*')
    .eq('is_global', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching global components:', error)
    throw new Error(`Error fetching global components: ${error.message}`)
  }

  return data || []
}

/**
 * Obtener componentes de una página
 */
export async function getPageComponents(pageId: string): Promise<PageComponent[]> {
  const { data, error } = await supabase
    .from('page_components')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching page components:', error)
    throw new Error(`Error fetching page components: ${error.message}`)
  }

  return data || []
}

/**
 * Crear un componente
 * 
 * SEGURIDAD: Valida que el tipo de componente esté en la whitelist
 * y que el contenido cumpla con el schema definido.
 */
export async function createComponent(input: CreateComponentInput): Promise<PageComponent> {
  // Validar que el tipo de componente esté permitido
  if (!isComponentAllowed(input.component_type)) {
    throw new Error(`Tipo de componente no permitido: ${input.component_type}`)
  }
  
  // Validar el contenido si se proporciona
  if (input.draft_content && Object.keys(input.draft_content).length > 0) {
    const validation = validateComponentContent(input.component_type, input.draft_content)
    if (!validation.success) {
      throw new Error(`Contenido inválido: ${validation.error}`)
    }
  }
  
  const { data, error } = await supabase
    .from('page_components')
    .insert({
      page_id: input.page_id,
      component_type: input.component_type,
      draft_content: input.draft_content || {},
      published_content: {},
      styles: input.styles || {},
      sort_order: input.sort_order,
      is_active: input.is_active ?? true,
      is_global: input.is_global ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating component:', error)
    throw new Error(`Error creating component: ${error.message}`)
  }

  return data
}

/**
 * Actualizar un componente
 * 
 * SEGURIDAD: Valida el contenido antes de actualizar.
 */
export async function updateComponent(id: string, input: UpdateComponentInput): Promise<PageComponent> {
  // Si se actualiza draft_content, necesitamos validar
  if (input.draft_content) {
    // Primero obtenemos el componente para saber su tipo
    const { data: existing, error: fetchError } = await supabase
      .from('page_components')
      .select('component_type')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      throw new Error(`Error fetching component: ${fetchError.message}`)
    }
    
    // Validar el nuevo contenido
    const validation = validateComponentContent(existing.component_type, input.draft_content)
    if (!validation.success) {
      throw new Error(`Contenido inválido: ${validation.error}`)
    }
  }
  
  const { data, error } = await supabase
    .from('page_components')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating component:', error)
    throw new Error(`Error updating component: ${error.message}`)
  }

  return data
}

/**
 * Actualizar múltiples componentes (para reordenar)
 */
export async function updateComponentsOrder(
  updates: { id: string; sort_order: number }[]
): Promise<void> {
  // Usar upsert para actualizar múltiples registros
  for (const update of updates) {
    const { error } = await supabase
      .from('page_components')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id)

    if (error) {
      console.error('Error updating component order:', error)
      throw new Error(`Error updating component order: ${error.message}`)
    }
  }
}

/**
 * Eliminar un componente
 */
export async function deleteComponent(id: string): Promise<void> {
  const { error } = await supabase
    .from('page_components')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting component:', error)
    throw new Error(`Error deleting component: ${error.message}`)
  }
}

/**
 * Publicar componentes de una página (copiar draft_content a published_content)
 */
export async function publishPageComponents(pageId: string): Promise<void> {
  // Primero obtenemos los componentes
  const components = await getPageComponents(pageId)

  // Luego actualizamos cada uno copiando draft_content a published_content
  for (const component of components) {
    const { error } = await supabase
      .from('page_components')
      .update({ published_content: component.draft_content })
      .eq('id', component.id)

    if (error) {
      console.error('Error publishing component:', error)
      throw new Error(`Error publishing component: ${error.message}`)
    }
  }
}

// =============================================
// COMPONENT TYPES SERVICE
// =============================================

/**
 * Obtener todos los tipos de componentes disponibles
 */
export async function getComponentTypes(): Promise<ComponentType[]> {
  const { data, error } = await supabase
    .from('component_types')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching component types:', error)
    throw new Error(`Error fetching component types: ${error.message}`)
  }

  return data || []
}

/**
 * Crear un tipo de componente
 */
export async function createComponentType(input: {
  name: string
  label: string
  default_content?: Record<string, unknown>
  icon?: string
}): Promise<ComponentType> {
  const { data, error } = await supabase
    .from('component_types')
    .insert({
      name: input.name,
      label: input.label,
      default_content: input.default_content || {},
      icon: input.icon || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating component type:', error)
    throw new Error(`Error creating component type: ${error.message}`)
  }

  return data
}

/**
 * Verificar si un tipo de componente existe
 */
export async function componentTypeExists(name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('component_types')
    .select('id')
    .eq('name', name)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking component type:', error)
    throw new Error(`Error checking component type: ${error.message}`)
  }

  return !!data
}

/**
 * Sembrar tipos de componentes básicos
 * 
 * SEGURIDAD: Esta función SOLO crea componentes que:
 * 1. Existen en ALLOWED_COMPONENTS (whitelist del ComponentRegistry)
 * 2. Tienen configuración segura en getSecureComponentConfig
 * 
 * No acepta input externo - los componentes se obtienen del registry.
 */
export async function seedBasicComponentTypes(): Promise<{ 
  created: string[]
  existing: string[]
  skipped: string[] 
}> {
  const created: string[] = []
  const existing: string[] = []
  const skipped: string[] = []

  // Iterar SOLO sobre componentes en la whitelist
  for (const componentName of ALLOWED_COMPONENTS) {
    // Obtener configuración segura del registry
    const config = getSecureComponentConfig(componentName)
    
    if (!config) {
      skipped.push(componentName)
      continue
    }
    
    // Verificar si ya existe en la DB
    const exists = await componentTypeExists(componentName)
    
    if (exists) {
      existing.push(componentName)
    } else {
      // Crear el tipo de componente con datos del registry (no input externo)
      await createComponentType({
        name: componentName,
        label: config.metadata.label,
        icon: config.metadata.icon,
        default_content: config.defaultContent,
      })
      created.push(componentName)
    }
  }

  return { created, existing, skipped }
}

// =============================================
// MEDIA ASSETS SERVICE
// =============================================

/**
 * Obtener todos los media assets
 */
export async function getMediaAssets(): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching media assets:', error)
    throw new Error(`Error fetching media assets: ${error.message}`)
  }

  return data || []
}

/**
 * Crear un media asset
 */
export async function createMediaAsset(
  url: string,
  altText?: string,
  metadata?: Record<string, unknown>
): Promise<MediaAsset> {
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      url,
      alt_text: altText || null,
      file_metadata: metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating media asset:', error)
    throw new Error(`Error creating media asset: ${error.message}`)
  }

  return data
}

/**
 * Soft delete de un media asset
 */
export async function deleteMediaAsset(id: string): Promise<void> {
  const { error } = await supabase
    .from('media_assets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting media asset:', error)
    throw new Error(`Error deleting media asset: ${error.message}`)
  }
}
