import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const imageTextLeftConfig: BlockConfig = {
  meta: {
    name: "image_text_left",
    label: "Imagen Izquierda + Texto",
    category: "content",
    icon: "LayoutPanelLeft",
    description: "Seccion con imagen a la izquierda y texto a la derecha con decoracion",
  },

  fields: [
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Sobre Nosotros' },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Descubre Nuestra Historia' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: 'Imagen descriptiva' },
    { name: 'showButton', label: 'Mostrar boton', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del boton', type: 'text', defaultValue: 'Conocer mas' },
    { name: 'buttonUrl', label: 'URL del boton', type: 'text', defaultValue: '/about' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],

  defaultContent: {
    title: "Descubre Nuestra Historia",
    subtitle: "Sobre Nosotros",
    text: "Somos una empresa comprometida con la calidad y la excelencia. Cada producto que ofrecemos esta cuidadosamente seleccionado.",
    image: "/images/placeholder.svg",
    imageAlt: "Imagen descriptiva",
    buttonText: "Conocer mas",
    buttonUrl: "/about",
    showButton: true,
  },

  defaultStyles: {
    padding: "py-16 md:py-24",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    accentColor: "#3b82f6",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    text: safeTextSchema.optional(),
    image: z.string().optional(),
    imageAlt: safeTextSchema.optional(),
    showButton: z.boolean().optional(),
    buttonText: safeTextSchema.optional(),
    buttonUrl: z.string().optional(),
  }),
}
