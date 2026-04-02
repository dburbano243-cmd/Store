# Agregar Nuevos Componentes al Page Builder

## Proceso 100% Automatico

Para agregar un nuevo componente, **solo crea la carpeta** con los archivos requeridos.
**No necesitas modificar ningun otro archivo.**

### Pasos:

1. **Crear la carpeta del componente:**
   ```
   components/page-builder/blocks/mi-componente/
   ├── index.tsx    # Componente React
   └── config.ts    # Configuracion del bloque
   ```

2. **Ejecutar el servidor:**
   ```bash
   npm run dev
   ```

**Listo.** El script escanea las carpetas automaticamente y regenera el registry.

---

## Estructura de Archivos

### index.tsx (Componente)

```tsx
"use client"

import type { BlockComponentProps } from "../types"

export interface MiComponenteContent {
  titulo?: string
  descripcion?: string
}

export function MiComponente({ content, styles }: BlockComponentProps) {
  const data = content as MiComponenteContent
  
  return (
    <section style={{ backgroundColor: styles?.backgroundColor }}>
      <h2 style={{ color: styles?.textColor }}>
        {data.titulo || "Titulo por defecto"}
      </h2>
      <p>{data.descripcion}</p>
    </section>
  )
}
```

### config.ts (Configuracion)

```tsx
import { z } from "zod"
import type { BlockConfig } from "../types"
import { safeTextSchema } from "../types"

export const miComponenteConfig: BlockConfig = {
  meta: {
    name: "mi_componente",  // snake_case, debe coincidir con carpeta
    label: "Mi Componente",
    category: "content",    // heroes | content | products | media | contact
    icon: "Layout",         // Icono de Lucide
    description: "Descripcion corta",
  },

  fields: [
    { name: "titulo", label: "Titulo", type: "text" },
    { name: "descripcion", label: "Descripcion", type: "textarea" },
    { name: "styles.backgroundColor", label: "Color de fondo", type: "color" },
    { name: "styles.textColor", label: "Color de texto", type: "color" },
  ],

  defaultContent: {
    titulo: "Titulo por defecto",
    descripcion: "Descripcion por defecto",
  },

  defaultStyles: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
  },

  contentSchema: z.object({
    titulo: safeTextSchema.optional(),
    descripcion: safeTextSchema.optional(),
  }),
}
```

---

## Componentes con Arrays (Slides/Cards)

Para sliders, carousels, etc., agrega `arrayEditor` al config:

```tsx
export const miSliderConfig: BlockConfig = {
  meta: {
    name: "mi_slider",
    label: "Mi Slider",
    category: "heroes",
    icon: "Layers",
    description: "Slider de imagenes",
  },

  fields: [
    { name: "styles.backgroundColor", label: "Fondo", type: "color" },
  ],

  // Configuracion del editor de arrays
  arrayEditor: {
    arrayFieldName: "slides",
    labels: {
      title: "Slides",
      addButton: "Agregar slide",
      itemLabel: "Slide",
    },
    itemFields: {
      image: true,
      title: true,
      subtitle: true,
      buttonText: true,
      buttonUrl: true,    // URL externa
      pageUrl: true,      // Selector de paginas internas
    },
  },

  defaultContent: {
    slides: [
      { id: "1", title: "Slide 1", image: "/placeholder.svg" },
    ],
  },

  defaultStyles: {
    backgroundColor: "#000000",
  },

  contentSchema: z.object({
    slides: z.array(z.object({
      id: z.string(),
      title: z.string().optional(),
      image: z.string().optional(),
    })).optional(),
  }),
}
```

---

## Referencia Rapida

### Tipos de campos

| Tipo | Uso |
|------|-----|
| `text` | Texto corto |
| `textarea` | Texto largo |
| `number` | Numeros |
| `boolean` | Switch Si/No |
| `color` | Selector de color |
| `image` | URL de imagen |
| `select` | Dropdown (requiere `options`) |

### Categorias

| Categoria | Componentes |
|-----------|-------------|
| `heroes` | Banners, sliders, headers |
| `content` | Texto, imagenes, cards |
| `products` | Grids de productos |
| `media` | Videos, galerias |
| `contact` | Formularios, contacto |

### Iconos (Lucide)

`Layout`, `Layers`, `Type`, `Image`, `Video`, `Columns`, `Square`, `ShoppingBag`, `Mail`, `MessageSquare`

---

## Comandos

```bash
npm run dev              # Regenera automaticamente
npm run generate:blocks  # Regenerar manualmente
npm run build            # Regenera antes del build
```
