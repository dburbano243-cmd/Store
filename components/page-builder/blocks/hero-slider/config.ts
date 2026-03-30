import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const heroSliderConfig: BlockConfig = {
  meta: {
    name: "hero_slider",
    label: "Hero Slider",
    category: "heroes",
    icon: "Layers",
    description: "Carrusel de imagenes a pantalla completa con texto y botones",
  },

  fields: [
    { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: true },
    { name: 'autoplaySpeed', label: 'Velocidad (ms)', type: 'number', defaultValue: 5000 },
    { name: 'showArrows', label: 'Mostrar flechas', type: 'boolean', defaultValue: true },
    { name: 'showDots', label: 'Mostrar puntos', type: 'boolean', defaultValue: true },
    commonStyleFields.overlayColor,
    commonStyleFields.accentColor,
  ],

  defaultContent: {
    slides: [
      {
        id: "slide-1",
        title: "Bienvenido a nuestra tienda",
        subtitle: "Descubre los mejores productos con ofertas exclusivas",
        image: "/images/placeholder.svg",
        buttonText: "Ver productos",
        buttonUrl: "/productos",
      },
      {
        id: "slide-2",
        title: "Nueva coleccion",
        subtitle: "Explora las ultimas tendencias de la temporada",
        image: "/images/placeholder.svg",
        buttonText: "Explorar",
        buttonUrl: "/coleccion",
      },
    ],
    autoplay: true,
    autoplaySpeed: 5000,
    showArrows: true,
    showDots: true,
  },

  defaultStyles: {
    padding: "",
  },

  contentSchema: z.object({
    slides: z.array(z.object({
      id: z.string(),
      title: safeTextSchema.optional(),
      subtitle: safeTextSchema.optional(),
      image: z.string().optional(),
      buttonText: safeTextSchema.optional(),
      buttonUrl: z.string().optional(),
    })).optional(),
    autoplay: z.boolean().optional(),
    autoplaySpeed: z.number().min(1000).max(30000).optional(),
    showArrows: z.boolean().optional(),
    showDots: z.boolean().optional(),
  }),
}
