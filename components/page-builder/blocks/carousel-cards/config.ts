import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const carouselCardsConfig: BlockConfig = {
  meta: {
    name: "carousel_cards",
    label: "Carrusel de Cards",
    category: "content",
    icon: "LayoutGrid",
    description: "Carrusel horizontal de cards con imagenes y descripciones",
  },

  fields: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Nuestros Servicios' },
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Descubre todo lo que podemos ofrecerte' },
    { name: 'cardsPerView', label: 'Cards por vista', type: 'number', defaultValue: 3 },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    title: "Nuestros Servicios",
    subtitle: "Descubre todo lo que podemos ofrecerte",
    cards: [
      {
        id: "card-1",
        title: "Servicio 1",
        description: "Descripcion del primer servicio que ofrecemos a nuestros clientes.",
        image: "/images/placeholder.svg",
        link: "#",
      },
      {
        id: "card-2",
        title: "Servicio 2",
        description: "Descripcion del segundo servicio con todas sus caracteristicas.",
        image: "/images/placeholder.svg",
        link: "#",
      },
      {
        id: "card-3",
        title: "Servicio 3",
        description: "Descripcion del tercer servicio disponible para ti.",
        image: "/images/placeholder.svg",
        link: "#",
      },
    ],
    cardsPerView: 3,
  },

  defaultStyles: {
    padding: "py-12 md:py-16 lg:py-20",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },

  contentSchema: z.object({
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    cards: z.array(z.object({
      id: z.string(),
      title: safeTextSchema.optional(),
      description: safeTextSchema.optional(),
      image: z.string().optional(),
      link: z.string().optional(),
    })).optional(),
    cardsPerView: z.number().min(1).max(6).optional(),
  }),

  // Configuracion del editor de cards
  arrayEditor: {
    arrayFieldName: "cards",
    labels: {
      title: "Cards",
      addButton: "Agregar card",
      itemLabel: "Card",
    },
    itemFields: {
      image: true,
      title: true,
      description: true,
      link: true,
    },
  },
}
