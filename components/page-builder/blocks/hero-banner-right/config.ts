import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const heroBannerRightConfig: BlockConfig = {
  meta: {
    name: "hero_banner_right",
    label: "Banner Hero (Derecha)",
    category: "heroes",
    icon: "ImageIcon",
    description: "Banner de pantalla completa con fondo de imagen y contenido alineado a la derecha",
  },

  fields: [
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Nueva Coleccion' },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Productos de Calidad Premium' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'backgroundImage', label: 'Imagen de fondo', type: 'image', defaultValue: '' },
    { name: 'overlayOpacity', label: 'Opacidad del overlay (%)', type: 'number', defaultValue: 50 },
    { name: 'showButton', label: 'Mostrar boton principal', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto boton principal', type: 'text', defaultValue: 'Comprar Ahora' },
    { name: 'buttonUrl', label: 'URL boton principal', type: 'text', defaultValue: '/productos' },
    { name: 'showSecondaryButton', label: 'Mostrar boton secundario', type: 'boolean', defaultValue: true },
    { name: 'secondaryButtonText', label: 'Texto boton secundario', type: 'text', defaultValue: 'Ver catalogo' },
    { name: 'secondaryButtonUrl', label: 'URL boton secundario', type: 'text', defaultValue: '/catalogo' },
    commonStyleFields.overlayColor,
    commonStyleFields.accentColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    title: "Productos de Calidad Premium",
    subtitle: "Nueva Coleccion",
    text: "Encuentra lo mejor para ti en nuestra seleccion exclusiva. Envios rapidos y atencion personalizada.",
    backgroundImage: "/images/placeholder.svg",
    overlayOpacity: 50,
    buttonText: "Comprar Ahora",
    buttonUrl: "/productos",
    showButton: true,
    secondaryButtonText: "Ver catalogo",
    secondaryButtonUrl: "/catalogo",
    showSecondaryButton: true,
  },

  defaultStyles: {
    padding: "",
    overlayColor: "#000000",
    accentColor: "#10b981",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    text: safeTextSchema.optional(),
    backgroundImage: z.string().optional(),
    overlayOpacity: z.number().min(0).max(100).optional(),
    showButton: z.boolean().optional(),
    buttonText: safeTextSchema.optional(),
    buttonUrl: z.string().optional(),
    showSecondaryButton: z.boolean().optional(),
    secondaryButtonText: safeTextSchema.optional(),
    secondaryButtonUrl: z.string().optional(),
  }),
}
