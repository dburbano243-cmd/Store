import { NextResponse } from 'next/server'
import { getComponentTypes } from '@/lib/services/page-builder.service'
import { 
  getAllAllowedComponents, 
  isComponentAllowed 
} from '@/lib/validations/component.validation'

/**
 * GET /api/admin/components
 * 
 * Obtiene todos los tipos de componentes.
 * 
 * Incluye:
 * - registered: Componentes registrados en la DB
 * - allowed: Componentes permitidos según el ComponentRegistry (whitelist)
 * - syncStatus: Estado de sincronización entre DB y registry
 */
export async function GET() {
  try {
    // Obtener componentes de la DB
    const dbComponents = await getComponentTypes()
    
    // Obtener componentes permitidos del registry
    const allowedComponents = getAllAllowedComponents()
    
    // Calcular estado de sincronización
    const dbComponentNames = new Set(dbComponents.map(c => c.name))
    const allowedNames = new Set(allowedComponents.map(c => c.name))
    
    const syncStatus = {
      // Componentes en registry pero no en DB
      missingInDb: allowedComponents.filter(c => !dbComponentNames.has(c.name)),
      // Componentes en DB pero no en registry (huérfanos - potencialmente peligrosos)
      orphanedInDb: dbComponents.filter(c => !allowedNames.has(c.name)),
      // Componentes sincronizados
      synced: dbComponents.filter(c => allowedNames.has(c.name)),
    }
    
    return NextResponse.json({
      success: true,
      data: {
        registered: dbComponents,
        allowed: allowedComponents,
        syncStatus,
      },
    })
  } catch (error) {
    console.error('Error fetching component types:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/components
 * 
 * DESHABILITADO: No se permite crear componentes manualmente.
 * 
 * Los componentes deben:
 * 1. Existir en el ComponentRegistry (código)
 * 2. Ser sembrados vía /api/admin/components/seed
 * 
 * Esto previene la creación de componentes arbitrarios que podrían
 * contener código malicioso o configuraciones inseguras.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Verificar que el componente está en la whitelist
    if (!body.name || !isComponentAllowed(body.name)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La creación manual de componentes está deshabilitada por seguridad. Use el endpoint /seed para sincronizar componentes del registry.',
          hint: 'Los componentes deben existir primero en el código (ComponentRegistry) antes de poder ser registrados en la base de datos.'
        },
        { status: 403 }
      )
    }
    
    // Si el componente está en la whitelist, redirigir al seed
    return NextResponse.json(
      { 
        success: false, 
        error: 'Use el endpoint POST /api/admin/components/seed para sincronizar componentes.',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in components POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}
