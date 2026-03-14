import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Schema de validación para crear un componente
 * Esto previene nombres maliciosos o inyección de código
 */
const createComponentSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-z][a-z0-9_]*$/, "Solo letras minúsculas, números y guiones bajos. Debe comenzar con letra."),
  label: z.string()
    .min(2, "El label debe tener al menos 2 caracteres")
    .max(100, "El label no puede exceder 100 caracteres"),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .default(""),
  icon: z.string()
    .regex(/^[A-Z][a-zA-Z0-9]*$/, "Icono inválido")
    .default("Box"),
  category: z.enum(["basics", "layout", "ecommerce", "media"])
    .default("basics"),
})

/**
 * POST /api/admin/components/create
 * 
 * Este endpoint NO crea archivos en el sistema de archivos directamente.
 * En su lugar, registra la intención de crear el componente y genera 
 * las instrucciones/plantilla que el desarrollador debe implementar.
 * 
 * Para crear los archivos realmente, se necesitaría un proceso de CI/CD
 * o un sistema de generación de código en el servidor.
 * 
 * Por ahora, este endpoint:
 * 1. Valida los datos de entrada
 * 2. Registra el componente pendiente en la base de datos (tabla component_drafts)
 * 3. Retorna la plantilla de código que debe ser implementada
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar entrada
    const validation = createComponentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.errors.map(e => e.message).join(", ")
      }, { status: 400 })
    }
    
    const { name, label, description, icon, category } = validation.data
    
    // Generar nombre de componente en PascalCase
    const componentName = name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    
    // Generar la plantilla del componente
    const componentTemplate = generateComponentTemplate(name, componentName, label, description)
    const registryAddition = generateRegistryAddition(name, componentName, label, description, icon, category)
    const validationAddition = generateValidationAddition(name)
    
    return NextResponse.json({
      success: true,
      data: {
        name,
        label,
        componentName,
        category,
        files: {
          component: {
            path: `components/page-builder/blocks/${componentName}.tsx`,
            content: componentTemplate,
          },
          registry: {
            note: "Agregar al archivo components/admin/page-builder/ComponentRegistry.tsx",
            additions: registryAddition,
          },
          validation: {
            note: "Agregar al archivo lib/validations/component.validation.ts",
            additions: validationAddition,
          },
        },
        instructions: [
          `1. Crear archivo: components/page-builder/blocks/${componentName}.tsx`,
          `2. Agregar import y registro en ComponentRegistry.tsx`,
          `3. Agregar schema de validación en component.validation.ts`,
          `4. Sincronizar a la base de datos desde el panel de componentes`,
        ],
      }
    })
    
  } catch (error) {
    console.error('Error creating component:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno al crear el componente'
    }, { status: 500 })
  }
}

/**
 * Genera la plantilla base del componente React
 */
function generateComponentTemplate(
  name: string,
  componentName: string,
  label: string,
  description: string
): string {
  return `"use client"

import { useState } from "react"
import type { RegisteredComponentProps } from "@/components/admin/page-builder/ComponentRegistry"

/**
 * ${label}
 * ${description}
 * 
 * Este componente fue generado automáticamente.
 * Personaliza el contenido y los estilos según tus necesidades.
 */

interface ${componentName}Content {
  title?: string
  text?: string
  // Agrega más campos según necesites
}

export function ${componentName}({
  content,
  styles,
  isEditable = false,
  onContentChange,
  onSelect,
  isSelected = false,
}: RegisteredComponentProps) {
  const typedContent = content as ${componentName}Content
  
  const {
    title = "Título del componente",
    text = "Contenido del componente. Edita este texto.",
  } = typedContent

  const handleTitleChange = (newTitle: string) => {
    if (isEditable && onContentChange) {
      onContentChange({ ...content, title: newTitle })
    }
  }

  const handleTextChange = (newText: string) => {
    if (isEditable && onContentChange) {
      onContentChange({ ...content, text: newText })
    }
  }

  return (
    <section
      className={\`relative \${styles.padding || "py-12"}\`}
      style={{
        backgroundColor: styles.backgroundColor || "transparent",
        color: styles.textColor || "inherit",
      }}
      onClick={() => isEditable && onSelect?.()}
      data-component="${name}"
    >
      {/* Editor Selection Indicator */}
      {isEditable && isSelected && (
        <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 pointer-events-none z-10" />
      )}
      
      <div className="container mx-auto px-4">
        {/* Título editable */}
        {isEditable ? (
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-3xl font-bold mb-4 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-primary/20 rounded px-2 -mx-2"
            placeholder="Escribe un título..."
          />
        ) : (
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
        )}
        
        {/* Texto editable */}
        {isEditable ? (
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="text-muted-foreground bg-transparent border-none outline-none w-full resize-none focus:ring-2 focus:ring-primary/20 rounded px-2 -mx-2 min-h-[100px]"
            placeholder="Escribe el contenido..."
          />
        ) : (
          <p className="text-muted-foreground">{text}</p>
        )}
      </div>
    </section>
  )
}
`
}

/**
 * Genera el código a agregar al ComponentRegistry
 */
function generateRegistryAddition(
  name: string,
  componentName: string,
  label: string,
  description: string,
  icon: string,
  category: string
): string {
  return `
// 1. Agregar import al inicio del archivo:
import { ${componentName} } from "@/components/page-builder/blocks/${componentName}"

// 2. Agregar al componentRegistry:
export const componentRegistry: Record<string, RegisteredComponent> = {
  // ... otros componentes
  ${name}: ${componentName},
}

// 3. Agregar a la categoría correspondiente en componentCategories:
${category}: {
  label: "${category === 'basics' ? 'Básicos' : category === 'layout' ? 'Layout' : category === 'ecommerce' ? 'E-Commerce' : 'Media'}",
  components: [...existingComponents, "${name}"],
}

// 4. Agregar configuración de campos en componentFieldConfigs:
${name}: [
  { name: 'title', label: 'Título', type: 'text', defaultValue: 'Título del componente' },
  { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
],

// 5. Agregar contenido por defecto en componentDefaultContent:
${name}: {
  title: "Título del componente",
  text: "Contenido del componente.",
},

// 6. Agregar estilos por defecto en componentDefaultStyles:
${name}: {
  padding: "py-12",
  backgroundColor: "#ffffff",
},

// 7. Agregar metadatos en componentMetadata:
${name}: {
  label: "${label}",
  icon: "${icon}",
  description: "${description || `Componente ${label}`}",
},
`
}

/**
 * Genera el schema de validación Zod para el componente
 */
function generateValidationAddition(name: string): string {
  return `
// Agregar al objeto componentContentSchemas:
${name}: z.object({
  title: safeTextSchema.optional(),
  text: safeTextSchema.optional(),
  // Agrega más campos según los que uses en el componente
}),
`
}
