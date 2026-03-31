/**
 * PAGE BUILDER BLOCKS - EXPORTS CENTRALIZADOS
 * 
 * Este archivo re-exporta todo desde el registry.
 * NO necesitas modificar este archivo al agregar nuevos componentes.
 * 
 * Para agregar un nuevo componente:
 * 1. Crear carpeta en /components/page-builder/blocks/[nombre]/
 * 2. Crear index.tsx con el componente
 * 3. Crear config.ts con la configuracion BlockConfig
 * 4. Agregar entrada en registry.ts (blockRegistry)
 * 
 * TODO: En el futuro, registry.ts tambien sera auto-generado.
 */

// Re-exportar todo desde el registry
export * from "./registry"

// Re-exportar tipos
export * from "./types"
