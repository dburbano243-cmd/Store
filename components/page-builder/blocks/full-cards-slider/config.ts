import { z } from "zod"
import type { BlockConfig } from "../types"
import { safeTextSchema } from "../types"

export const fullCardsSliderConfig: BlockConfig = {
  meta: {
    name: "full_cards_slider",
    label: "Full Cards Slider",
    category: "heroes",
    icon: "Layers",
    description: "Carrusel de cards a pantalla completa con enlaces a paginas",
  },

  fields: [
    { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: true },
    { name: 'autoplaySpeed', label: 'Velocidad (ms)', type: 'number', defaultValue: 4000 },
    { name: 'showArrows', label: 'Mostrar flechas', type: 'boolean', defaultValue: true },
    { name: 'cardsPerView', label: 'Cards visibles', type: 'number', defaultValue: 3 },
    // Style fields
    { name: 'styles.backgroundColor', label: 'Color de fondo', type: 'color', defaultValue: '#000000' },
    { name: 'styles.overlayColor', label: 'Color del overlay', type: 'color', defaultValue: '#000000' },
    { name: 'styles.overlayOpacity', label: 'Opacidad overlay (0-1)', type: 'number', defaultValue: 0.3 },
    { name: 'styles.titleColor', label: 'Color del titulo', type: 'color', defaultValue: '#ffffff' },
    { name: 'styles.subtitleColor', label: 'Color del subtitulo', type: 'color', defaultValue: '#d4a574' },
    { name: 'styles.buttonTextColor', label: 'Color texto boton', type: 'color', defaultValue: '#ffffff' },
    { name: 'styles.buttonBorderColor', label: 'Color borde boton', type: 'color', defaultValue: '#d4a574' },
    { name: 'styles.buttonBackgroundColor', label: 'Color fondo boton', type: 'color', defaultValue: 'transparent' },
    { name: 'styles.arrowColor', label: 'Color flechas', type: 'color', defaultValue: '#ffffff' },
    { name: 'styles.arrowBackgroundColor', label: 'Color fondo flechas', type: 'color', defaultValue: 'rgba(0,0,0,0.3)' },
    { name: 'styles.dotColor', label: 'Color puntos', type: 'color', defaultValue: 'rgba(255,255,255,0.5)' },
    { name: 'styles.dotActiveColor', label: 'Color punto activo', type: 'color', defaultValue: '#ffffff' },
  ],

  defaultContent: {
    slides: [
      {
        id: "slide-1",
        image: "/images/placeholder.svg",
        subtitle: "SMART AND USUAL",
        title: "PHOTO DESIGN",
        buttonText: "SEE MORE",
        pageUrl: "/",
      },
      {
        id: "slide-2",
        image: "/images/placeholder.svg",
        subtitle: "LIGHT AND COLOUR",
        title: "INTERIOR DESIGN",
        buttonText: "SEE MORE",
        pageUrl: "/",
      },
      {
        id: "slide-3",
        image: "/images/placeholder.svg",
        subtitle: "PASSION AND ART",
        title: "PHOTOGRAPHY",
        buttonText: "SEE MORE",
        pageUrl: "/",
      },
      {
        id: "slide-4",
        image: "/images/placeholder.svg",
        subtitle: "CREATIVE VISION",
        title: "BRANDING",
        buttonText: "SEE MORE",
        pageUrl: "/",
      },
    ],
    autoplay: true,
    autoplaySpeed: 4000,
    showArrows: true,
    cardsPerView: 3,
  },

  defaultStyles: {
    padding: "",
    backgroundColor: "#000000",
    overlayColor: "#000000",
    overlayOpacity: "0.3",
    titleColor: "#ffffff",
    subtitleColor: "#d4a574",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#d4a574",
    buttonBackgroundColor: "transparent",
    arrowColor: "#ffffff",
    arrowBackgroundColor: "rgba(0,0,0,0.3)",
    dotColor: "rgba(255,255,255,0.5)",
    dotActiveColor: "#ffffff",
  },

  contentSchema: z.object({
    slides: z.array(z.object({
      id: z.string(),
      image: z.string().optional(),
      subtitle: safeTextSchema.optional(),
      title: safeTextSchema.optional(),
      buttonText: safeTextSchema.optional(),
      pageUrl: z.string().optional(),
    })).optional(),
    autoplay: z.boolean().optional(),
    autoplaySpeed: z.number().min(1000).max(30000).optional(),
    showArrows: z.boolean().optional(),
    cardsPerView: z.number().min(1).max(5).optional(),
  }),

  // Configuracion del editor de cards
  arrayEditor: {
    arrayFieldName: "slides",
    labels: {
      title: "Cards",
      addButton: "Agregar card",
      itemLabel: "Card",
    },
    itemFields: {
      image: true,
      title: true,
      subtitle: true,
      buttonText: true,
      pageUrl: true,  // Selector de paginas internas
    },
  },
}
