/**
 * generate-block-registry.js
 * 
 * Escanea todas las carpetas en components/page-builder/blocks/ que tengan
 * index.tsx + config.ts y genera automáticamente registry.generated.ts
 * 
 * Uso:
 *   node scripts/generate-block-registry.js
 *   (o via: npm run generate:blocks)
 * 
 * Para añadir un nuevo componente:
 *   1. Crea la carpeta components/page-builder/blocks/mi-componente/
 *   2. Añade index.tsx (componente) y config.ts (configuración)
 *   3. Ejecuta npm run generate:blocks  (o simplemente npm run dev)
 */

const fs = require("fs")
const path = require("path")

const BLOCKS_DIR = path.join(__dirname, "../components/page-builder/blocks")
const OUTPUT_FILE = path.join(BLOCKS_DIR, "registry.generated.ts")

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte un nombre de carpeta kebab-case a PascalCase
 * e.g. "hero-slider" → "HeroSlider"
 */
function toPascalCase(str) {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

/**
 * Convierte un nombre de carpeta kebab-case a camelCase
 * e.g. "hero-slider" → "heroSlider"
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Convierte un nombre de carpeta kebab-case a snake_case
 * e.g. "hero-slider" → "hero_slider"
 */
function toSnakeCase(str) {
  return str.replace(/-/g, "_")
}

/**
 * Lee el nombre real del export del componente desde index.tsx
 * Busca la primera línea "export function Nombre" o "export const Nombre"
 * Si no encuentra, usa el PascalCase del folder.
 */
function extractComponentExport(indexPath) {
  try {
    const content = fs.readFileSync(indexPath, "utf-8")
    // Matches: export function MyComponent( | export const MyComponent =
    const match = content.match(/^export\s+(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/m)
    if (match) return match[1]
  } catch (_) {
    // ignore
  }
  return null
}

/**
 * Lee el nombre real del export de config desde config.ts
 * Busca la primera línea "export const xyzConfig"
 * Si no encuentra, usa el camelCase del folder + "Config".
 */
function extractConfigExport(configPath) {
  try {
    const content = fs.readFileSync(configPath, "utf-8")
    // Matches: export const myComponentConfig
    const match = content.match(/^export\s+const\s+([a-zA-Z][a-zA-Z0-9_]*Config)/m)
    if (match) return match[1]
  } catch (_) {
    // ignore
  }
  return null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("🔍 Escaneando bloques en:", BLOCKS_DIR)

  // Leer todas las subcarpetas
  const entries = fs.readdirSync(BLOCKS_DIR, { withFileTypes: true })
  const blockFolders = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  // Filtrar solo las que tienen index.tsx + config.ts
  const validBlocks = blockFolders.filter((folder) => {
    const indexPath = path.join(BLOCKS_DIR, folder, "index.tsx")
    const configPath = path.join(BLOCKS_DIR, folder, "config.ts")
    return fs.existsSync(indexPath) && fs.existsSync(configPath)
  })

  if (validBlocks.length === 0) {
    console.error("❌ No se encontraron bloques válidos (requieren index.tsx + config.ts)")
    process.exit(1)
  }

  console.log(`✅ Encontrados ${validBlocks.length} bloques:`, validBlocks.join(", "))

  // Construir la información de cada bloque
  const blocks = validBlocks.map((folder) => {
    const indexPath = path.join(BLOCKS_DIR, folder, "index.tsx")
    const configPath = path.join(BLOCKS_DIR, folder, "config.ts")

    const componentName = extractComponentExport(indexPath) || toPascalCase(folder)
    const configName = extractConfigExport(configPath) || `${toCamelCase(folder)}Config`
    const registryKey = toSnakeCase(folder)

    return { folder, componentName, configName, registryKey }
  })

  // ─── Generar el contenido del archivo ──────────────────────────────────────

  const imports = blocks
    .map(
      ({ folder, componentName, configName }) =>
        `import { ${componentName} } from "./${folder}"\nimport { ${configName} } from "./${folder}/config"`
    )
    .join("\n")

  const registryEntries = blocks
    .map(
      ({ registryKey, componentName, configName }) =>
        `  "${registryKey}": { component: ${componentName}, config: ${configName} },`
    )
    .join("\n")

  const output = `/**
 * ============================================
 * ARCHIVO GENERADO AUTOMÁTICAMENTE
 * ============================================
 * NO EDITAR MANUALMENTE
 *
 * Este archivo es generado por: scripts/generate-block-registry.js
 * Se regenera automáticamente al ejecutar npm run dev o npm run generate:blocks
 *
 * Para agregar un nuevo componente:
 * 1. Crea una carpeta en components/page-builder/blocks/nombre-componente/
 * 2. Agrega index.tsx (componente) y config.ts (configuración)
 * 3. Ejecuta npm run generate:blocks  (o simplemente npm run dev)
 * ============================================
 */

import type { ComponentType } from "react"
import type { BlockConfig, BlockComponentProps } from "./types"

// ============================================
// IMPORTS AUTO-GENERADOS
// ============================================
${imports}

// ============================================
// REGISTRY AUTO-GENERADO
// ============================================
interface BlockRegistryEntry {
  component: ComponentType<BlockComponentProps>
  config: BlockConfig
}

const blockRegistry: Record<string, BlockRegistryEntry> = {
${registryEntries}
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

/** Metadata de bloques (label, icon, category, description) */
export const blockMetadata: Record<string, { label: string; icon: string; category: string; description: string }> =
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [
      name,
      {
        label: entry.config.meta.label,
        icon: entry.config.meta.icon,
        category: entry.config.meta.category,
        description: entry.config.meta.description || "",
      },
    ])
  )

/** Campos configurables por tipo de bloque */
export const blockFieldConfigs: Record<string, BlockConfig["fields"]> =
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.fields])
  )

/** Contenido por defecto de cada bloque */
export const blockDefaultContent: Record<string, BlockConfig["defaultContent"]> =
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.defaultContent])
  )

/** Estilos por defecto de cada bloque */
export const blockDefaultStyles: Record<string, BlockConfig["defaultStyles"]> =
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.defaultStyles])
  )

/** Schemas de validación de contenido */
export const blockContentSchemas: Record<string, BlockConfig["contentSchema"]> =
  Object.fromEntries(
    Object.entries(blockRegistry).map(([name, entry]) => [name, entry.config.contentSchema])
  )

/** Configuración de editores de arrays (slides, cards, etc) */
export const blockArrayEditorConfigs: Record<string, BlockConfig["arrayEditor"]> =
  Object.fromEntries(
    Object.entries(blockRegistry)
      .filter(([, entry]) => entry.config.arrayEditor)
      .map(([name, entry]) => [name, entry.config.arrayEditor])
  )

/** Categorías disponibles como objeto { [key]: { label, components[] } } */
export const blockCategories: Record<string, { label: string; components: string[] }> =
  Object.entries(blockRegistry).reduce(
    (acc, [name, entry]) => {
      const cat = entry.config.meta.category
      if (!acc[cat]) {
        acc[cat] = { label: cat.charAt(0).toUpperCase() + cat.slice(1), components: [] }
      }
      acc[cat].components.push(name)
      return acc
    },
    {} as Record<string, { label: string; components: string[] }>
  )

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
`

  fs.writeFileSync(OUTPUT_FILE, output, "utf-8")
  console.log("✅ registry.generated.ts actualizado con", blocks.length, "bloques.")
}

main()
