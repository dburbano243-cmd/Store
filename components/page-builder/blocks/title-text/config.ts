import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const titleTextConfig: BlockConfig = {
  meta: {
    name: "title_text",
    label: "Titulo y Texto",
    category: "content",
    icon: "Type",
    description: "Seccion con titulo y texto para contenido general",
  },

  fields: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Titulo de la Seccion' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { 
      name: 'alignment', 
      label: 'Alineacion', 
      type: 'select', 
      defaultValue: 'center',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' },
      ]
    },
    { 
      name: 'titleSize', 
      label: 'Tamano del titulo', 
      type: 'select', 
      defaultValue: 'lg',
      options: [
        { label: 'Pequeno', value: 'sm' },
        { label: 'Mediano', value: 'md' },
        { label: 'Grande', value: 'lg' },
        { label: 'Extra Grande', value: 'xl' },
      ]
    },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    title: "Titulo de la Seccion",
    text: "Este es el contenido de texto que acompana al titulo. Puedes escribir aqui toda la informacion que necesites compartir con tus visitantes.",
    alignment: "center",
    titleSize: "lg",
  },

  defaultStyles: {
    padding: "py-12 md:py-16 lg:py-20",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    text: safeTextSchema.optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
    titleSize: z.enum(["sm", "md", "lg", "xl"]).optional(),
  }),
}
