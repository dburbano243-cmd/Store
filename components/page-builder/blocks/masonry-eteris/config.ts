import { z } from "zod"
import type { BlockConfig } from "../types"
import { safeTextSchema, commonStyleFields } from "../types"

export const masonryEterisConfig: BlockConfig = {
  meta: {
    name: "masonry_eteris",
    label: "Masonry Gallery",
    category: "media",
    icon: "LayoutGrid",
    description: "Galeria tipo Pinterest con imagenes y videos de diferentes tamanios",
  },

  fields: [
    {
      name: "columns",
      label: "Columnas",
      type: "select",
      defaultValue: "4",
      options: [
        { label: "2 columnas", value: "2" },
        { label: "3 columnas", value: "3" },
        { label: "4 columnas", value: "4" },
        { label: "5 columnas", value: "5" },
        { label: "6 columnas", value: "6" },
      ],
    },
    {
      name: "gap",
      label: "Espacio entre items (px)",
      type: "number",
      defaultValue: 16,
    },
    {
      name: "enableLightbox",
      label: "Habilitar vista expandida",
      type: "boolean",
      defaultValue: true,
    },
    commonStyleFields.backgroundColor,
  ],

  defaultContent: {
    // items se cargan desde component_media usando el componentId (prop)
    items: [],
    columns: 4,
    gap: 16,
    enableLightbox: true,
  },

  defaultStyles: {
    backgroundColor: "#ffffff",
  },

  contentSchema: z.object({
    // items se cargan desde component_media table
    items: z.array(z.object({
      id: z.string(),
      url: z.string(),
      type: z.enum(["image", "video"]),
      alt: safeTextSchema.optional(),
      aspectRatio: z.number().optional(),
    })).optional(),
    columns: z.number().min(2).max(6).optional(),
    gap: z.number().min(0).max(64).optional(),
    enableLightbox: z.boolean().optional(),
  }),

  // No array editor here - we use a custom media uploader in the component folder
}
