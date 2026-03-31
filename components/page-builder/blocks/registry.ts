/**
 * REGISTRO DE BLOQUES DEL PAGE BUILDER
 * =====================================
 * 
 * Este archivo re-exporta todo desde registry.generated.ts
 * que es generado automáticamente por scripts/generate-block-registry.js
 * 
 * PARA AGREGAR UN NUEVO COMPONENTE (desarrollo local):
 * 1. Crea carpeta: components/page-builder/blocks/mi-componente/
 *    - index.tsx: export function MiComponente({ content, styles }) { ... }
 *    - config.ts: export const miComponenteConfig: BlockConfig = { ... }
 * 2. Ejecuta: npm run dev (se regenera automáticamente)
 * 
 * El script genera el archivo registry.generated.ts escaneando
 * todas las carpetas que tengan index.tsx + config.ts
 */

// Re-exportar todo desde el archivo generado
export * from "./registry.generated"
