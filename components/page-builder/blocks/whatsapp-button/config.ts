import { z } from "zod"
import type { BlockConfig } from "../types"
import { safeTextSchema } from "../types"

export const whatsappButtonConfig: BlockConfig = {
  meta: {
    name: "whatsapp_button",
    label: "Boton WhatsApp",
    category: "interactive",
    icon: "MessageCircle",
    description: "Boton flotante de WhatsApp configurable con numero, mensaje predeterminado y posicion en pantalla",
  },

  fields: [
    {
      name: "phoneNumber",
      label: "Numero de WhatsApp",
      type: "text",
      defaultValue: "",
      placeholder: "Ej: 573001234567 (sin + ni espacios)",
    },
    {
      name: "defaultMessage",
      label: "Mensaje predeterminado",
      type: "text",
      defaultValue: "Hola, me gustaria obtener mas informacion.",
    },
    {
      name: "tooltipText",
      label: "Texto del tooltip",
      type: "text",
      defaultValue: "Chatea con nosotros",
    },
    {
      name: "position",
      label: "Posicion",
      type: "select",
      defaultValue: "bottom-right",
      options: [
        { value: "bottom-right", label: "Inferior derecha" },
        { value: "bottom-left", label: "Inferior izquierda" },
      ],
    },
    {
      name: "showOnMobile",
      label: "Visible en movil",
      type: "boolean",
      defaultValue: true,
    },
    {
      name: "showOnDesktop",
      label: "Visible en escritorio",
      type: "boolean",
      defaultValue: true,
    },
    {
      name: "pulseAnimation",
      label: "Animacion de pulso",
      type: "boolean",
      defaultValue: true,
    },
    {
      name: "buttonColor",
      label: "Color del boton",
      type: "color",
      defaultValue: "#25D366",
    },
  ],

  defaultContent: {
    phoneNumber: "",
    defaultMessage: "Hola, me gustaria obtener mas informacion.",
    tooltipText: "Chatea con nosotros",
    position: "bottom-right",
    showOnMobile: true,
    showOnDesktop: true,
    pulseAnimation: true,
    buttonColor: "#25D366",
  },

  defaultStyles: {},

  contentSchema: z.object({
    phoneNumber: z.string().optional(),
    defaultMessage: safeTextSchema.optional(),
    tooltipText: safeTextSchema.optional(),
    position: z.enum(["bottom-right", "bottom-left"]).optional(),
    showOnMobile: z.boolean().optional(),
    showOnDesktop: z.boolean().optional(),
    pulseAnimation: z.boolean().optional(),
    buttonColor: z.string().optional(),
  }),
}
