import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const contactSectionConfig: BlockConfig = {
  meta: {
    name: "contact_section",
    label: "Formulario de Contacto",
    category: "contact",
    icon: "Mail",
    description: "Formulario de contacto con integracion de EmailJS",
  },

  fields: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Contactame' },
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Tienes alguna pregunta? Me encantaria escucharte' },
    { name: 'submitButtonText', label: 'Texto del boton', type: 'text', defaultValue: 'Enviar Mensaje' },
    { name: 'nameLabel', label: 'Label nombre', type: 'text', defaultValue: 'Nombre' },
    { name: 'namePlaceholder', label: 'Placeholder nombre', type: 'text', defaultValue: 'Tu nombre completo' },
    { name: 'emailLabel', label: 'Label email', type: 'text', defaultValue: 'Correo Electronico' },
    { name: 'emailPlaceholder', label: 'Placeholder email', type: 'text', defaultValue: 'tu@email.com' },
    { name: 'messageLabel', label: 'Label mensaje', type: 'text', defaultValue: 'Mensaje' },
    { name: 'messagePlaceholder', label: 'Placeholder mensaje', type: 'text', defaultValue: 'Escribe tu mensaje aqui...' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.buttonColor,
    commonStyleFields.buttonTextColor,
  ],

  defaultContent: {
    title: "Contactame",
    subtitle: "Tienes alguna pregunta? Me encantaria escucharte",
    submitButtonText: "Enviar Mensaje",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre completo",
    emailLabel: "Correo Electronico",
    emailPlaceholder: "tu@email.com",
    messageLabel: "Mensaje",
    messagePlaceholder: "Escribe tu mensaje aqui...",
    successTitle: "Mensaje enviado",
    successMessage: "Mensaje enviado correctamente! Te contactare pronto.",
    errorTitle: "Error",
    errorMessage: "Ocurrio un error al enviar el mensaje. Intenta de nuevo mas tarde.",
  },

  defaultStyles: {
    padding: "py-12 md:py-16",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    buttonColor: "#111827",
    buttonTextColor: "#ffffff",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    submitButtonText: safeTextSchema.optional(),
    nameLabel: safeTextSchema.optional(),
    namePlaceholder: safeTextSchema.optional(),
    emailLabel: safeTextSchema.optional(),
    emailPlaceholder: safeTextSchema.optional(),
    messageLabel: safeTextSchema.optional(),
    messagePlaceholder: safeTextSchema.optional(),
    successTitle: safeTextSchema.optional(),
    successMessage: safeTextSchema.optional(),
    errorTitle: safeTextSchema.optional(),
    errorMessage: safeTextSchema.optional(),
  }),
}
