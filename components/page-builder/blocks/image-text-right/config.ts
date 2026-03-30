import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const imageTextRightConfig: BlockConfig = {
  meta: {
    name: "image_text_right",
    label: "Texto + Imagen Derecha",
    category: "content",
    icon: "LayoutPanelLeft",
    description: "Seccion con texto a la izquierda e imagen a la derecha con decoracion",
  },

  fields: [
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Nuestro Compromiso' },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Calidad Garantizada' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: 'Imagen descriptiva' },
    { name: 'showButton', label: 'Mostrar boton', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del boton', type: 'text', defaultValue: 'Ver productos' },
    { name: 'buttonUrl', label: 'URL del boton', type: 'text', defaultValue: '/productos' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],

  defaultContent: {
    title: "Calidad Garantizada",
    subtitle: "Nuestro Compromiso",
    text: "Nos esforzamos por ofrecer productos de la mas alta calidad. Cada articulo pasa por rigurosos controles.",
    image: "/images/placeholder.svg",
    imageAlt: "Imagen descriptiva",
    buttonText: "Ver productos",
    buttonUrl: "/productos",
    showButton: true,
  },

  defaultStyles: {
    padding: "py-16 md:py-24",
    backgroundColor: "#f8fafc",
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
