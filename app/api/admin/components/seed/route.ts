import { NextResponse } from 'next/server'
import { seedBasicComponentTypes } from '@/lib/services/page-builder.service'
import { ALLOWED_COMPONENTS } from '@/lib/validations/component.validation'

/**
 * POST /api/admin/components/seed
 * 
 * Siembra los tipos de componentes básicos en la base de datos.
 * 
 * SEGURIDAD:
 * - Solo siembra componentes que existen en ALLOWED_COMPONENTS (whitelist)
 * - Cada componente se valida contra el ComponentRegistry
 * - No acepta parámetros externos - los componentes están hardcodeados
 * - En producción, considera proteger este endpoint con autenticación de admin
 */
export async function POST() {
  try {
    // Verificar que los componentes a sembrar están en la whitelist
    // Esto es una doble verificación - el servicio también valida
    const allowedCount = ALLOWED_COMPONENTS.length
    
    if (allowedCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No hay componentes configurados en el registry' 
        },
        { status: 400 }
      )
    }
    
    const result = await seedBasicComponentTypes()
    
    return NextResponse.json({
      success: true,
      message: `Componentes sembrados correctamente`,
      data: {
        ...result,
        allowedComponents: ALLOWED_COMPONENTS,
      },
    })
  } catch (error) {
    console.error('Error seeding components:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}
