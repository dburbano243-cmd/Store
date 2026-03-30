import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const productGridConfig: BlockConfig = {
  meta: {
    name: "product_grid",
    label: "Grid de Productos",
    category: "products",
    icon: "ShoppingBag",
    description: "Muestra productos de tu tienda en un grid con carrito de compras",
  },

  fields: [
    { name: 'showTitle', label: 'Mostrar titulo', type: 'boolean', defaultValue: true },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Mis Productos' },
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Descubre nuestra coleccion cuidadosamente seleccionada' },
    { 
      name: 'columns', 
      label: 'Columnas', 
      type: 'select', 
      defaultValue: '4',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
      ]
    },
    { name: 'limit', label: 'Limite de productos', type: 'number', defaultValue: 8 },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    title: "Mis Productos",
    subtitle: "Descubre nuestra coleccion cuidadosamente seleccionada de productos de alta calidad",
    columns: 4,
    limit: 8,
    showTitle: true,
  },

  defaultStyles: {
    padding: "py-16",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    columns: z.number().min(1).max(6).optional(),
    limit: z.number().min(1).max(50).optional(),
    showTitle: z.boolean().optional(),
  }),
}
