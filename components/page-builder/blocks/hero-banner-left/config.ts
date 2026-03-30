import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const heroBannerLeftConfig: BlockConfig = {
  meta: {
    name: "hero_banner_left",
    label: "Banner Hero (Izquierda)",
    category: "heroes",
    icon: "ImageIcon",
    description: "Banner de pantalla completa con fondo de imagen y contenido alineado a la izquierda",
  },

  fields: [
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Colecciones Exclusivas' },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Bienvenido a Nuestra Tienda' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'backgroundImage', label: 'Imagen de fondo', type: 'image', defaultValue: '' },
    { name: 'overlayOpacity', label: 'Opacidad del overlay (%)', type: 'number', defaultValue: 50 },
    { name: 'showButton', label: 'Mostrar boton principal', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto boton principal', type: 'text', defaultValue: 'Explorar Productos' },
    { name: 'buttonUrl', label: 'URL boton principal', type: 'text', defaultValue: '/productos' },
    { name: 'showSecondaryButton', label: 'Mostrar boton secundario', type: 'boolean', defaultValue: true },
    { name: 'secondaryButtonText', label: 'Texto boton secundario', type: 'text', defaultValue: 'Conocer mas' },
    { name: 'secondaryButtonUrl', label: 'URL boton secundario', type: 'text', defaultValue: '/about' },
    commonStyleFields.overlayColor,
    commonStyleFields.accentColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    title: "Bienvenido a Nuestra Tienda",
    subtitle: "Colecciones Exclusivas",
    text: "Descubre productos unicos cuidadosamente seleccionados para ti. Calidad, estilo y servicio excepcional en cada compra.",
    backgroundImage: "/images/placeholder.svg",
    overlayOpacity: 50,
    buttonText: "Explorar Productos",
    buttonUrl: "/productos",
    showButton: true,
    secondaryButtonText: "Conocer mas",
    secondaryButtonUrl: "/about",
    showSecondaryButton: true,
  },

  defaultStyles: {
    padding: "",
    overlayColor: "#000000",
    accentColor: "#f59e0b",
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
