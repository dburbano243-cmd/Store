import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const videoGalleryConfig: BlockConfig = {
  meta: {
    name: "video_gallery",
    label: "Galeria de Videos",
    category: "media",
    icon: "Video",
    description: "Galeria de videos con reproduccion automatica al hacer scroll",
  },

  fields: [
    { name: 'showTitle', label: 'Mostrar titulo', type: 'boolean', defaultValue: true },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Videos Demostrativos' },
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Descubre mas sobre nuestros productos' },
    { 
      name: 'columns', 
      label: 'Columnas', 
      type: 'select', 
      defaultValue: '3',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ]
    },
    { 
      name: 'aspectRatio', 
      label: 'Aspect Ratio', 
      type: 'select', 
      defaultValue: '9/16',
      options: [
        { label: '9:16 (Vertical)', value: '9/16' },
        { label: '16:9 (Horizontal)', value: '16/9' },
        { label: '1:1 (Cuadrado)', value: '1/1' },
        { label: '4:3', value: '4/3' },
      ]
    },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    title: "Videos Demostrativos",
    subtitle: "Descubre mas sobre nuestros productos a traves de estos videos informativos",
    columns: 3,
    aspectRatio: "9/16",
    showTitle: true,
  },

  defaultStyles: {
    padding: "py-16",
    backgroundColor: "#f8fafc",
    textColor: "#111827",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    columns: z.number().min(1).max(4).optional(),
    aspectRatio: z.string().optional(),
    showTitle: z.boolean().optional(),
  }),
}
