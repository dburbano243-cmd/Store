import { z } from "zod"
import type { BlockConfig } from "../types"
import { commonStyleFields, safeTextSchema } from "../types"

export const headerEterisConfig: BlockConfig = {
  meta: {
    name: "header_eteris",
    label: "Header Eteris",
    category: "heroes",
    icon: "Sparkles",
    description: "Header minimalista de pantalla completa con slider fade, redes sociales verticales y paginacion numerica",
  },

  fields: [
    { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: true },
    { name: 'autoplaySpeed', label: 'Velocidad (ms)', type: 'number', defaultValue: 6000 },
    { name: 'showSocials', label: 'Mostrar redes sociales', type: 'boolean', defaultValue: true },
    { name: 'instagramUrl', label: 'URL Instagram', type: 'text', defaultValue: '#' },
    { name: 'twitterUrl', label: 'URL Twitter', type: 'text', defaultValue: '#' },
    { name: 'facebookUrl', label: 'URL Facebook', type: 'text', defaultValue: '#' },
    commonStyleFields.overlayColor,
    commonStyleFields.accentColor,
    commonStyleFields.textColor,
  ],

  defaultContent: {
    slides: [
      {
        id: "slide-1",
        title: "Love will tear us apart again",
        text: "The world without photography will be meaningless to us if there is no light.",
        image: "/images/placeholder.svg",
        buttonText: "READ MORE",
        buttonUrl: "#",
      },
      {
        id: "slide-2",
        title: "Capture the moment",
        text: "Every photograph tells a story that words cannot express.",
        image: "/images/placeholder.svg",
        buttonText: "DISCOVER",
        buttonUrl: "#",
      },
    ],
    autoplay: true,
    autoplaySpeed: 6000,
    showSocials: true,
    instagramUrl: "#",
    twitterUrl: "#",
    facebookUrl: "#",
  },

  defaultStyles: {
    padding: "",
    overlayColor: "#000000",
    accentColor: "#c9a962",
    textColor: "#ffffff",
  },

  contentSchema: z.object({
    slides: z.array(z.object({
      id: z.string(),
      title: safeTextSchema.optional(),
      text: safeTextSchema.optional(),
      image: z.string().optional(),
      buttonText: safeTextSchema.optional(),
      buttonUrl: z.string().optional(),
    })).optional(),
    autoplay: z.boolean().optional(),
    autoplaySpeed: z.number().min(1000).max(30000).optional(),
    showSocials: z.boolean().optional(),
    instagramUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
  }),
}
