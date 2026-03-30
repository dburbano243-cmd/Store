import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const imageTextConfig: BlockConfig = {
  meta: {
    name: "image_text",
    label: "Imagen y Texto",
    category: "content",
    icon: "Image",
    description: "Seccion con imagen y texto lado a lado",
  },

  fields: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Sobre Nosotros' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: 'Imagen descriptiva' },
    { 
      name: 'imagePosition', 
      label: 'Posicion de imagen', 
      type: 'select', 
      defaultValue: 'left',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Derecha', value: 'right' },
      ]
    },
    { name: 'showButton', label: 'Mostrar boton', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del boton', type: 'text', defaultValue: 'Saber mas' },
    { name: 'buttonUrl', label: 'URL del boton', type: 'text', defaultValue: '#' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],

  defaultContent: {
    title: "Sobre Nosotros",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "/images/placeholder.svg",
    imageAlt: "Imagen descriptiva",
    imagePosition: "left",
    buttonText: "Saber mas",
    buttonUrl: "#",
    showButton: true,
  },

  defaultStyles: {
    padding: "py-12 md:py-16 lg:py-20",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    accentColor: "#3b82f6",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    text: safeTextSchema.optional(),
    image: z.string().optional(),
    imageAlt: safeTextSchema.optional(),
    imagePosition: z.enum(["left", "right"]).optional(),
    showButton: z.boolean().optional(),
    buttonText: safeTextSchema.optional(),
    buttonUrl: z.string().optional(),
  }),
}
