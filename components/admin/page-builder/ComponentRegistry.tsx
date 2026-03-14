import type { ComponentStyles, EditableComponentProps } from "@/lib/types/page-builder.types"

// Importar todos los bloques disponibles
import { HeroSlider } from "@/components/page-builder/blocks/HeroSlider"
import { CarouselCards } from "@/components/page-builder/blocks/CarouselCards"
import { ContactSection } from "@/components/page-builder/blocks/ContactSection"
import { ImageText } from "@/components/page-builder/blocks/ImageText"
import { TitleText } from "@/components/page-builder/blocks/TitleText"

/**
 * Props para componentes registrados en el editor visual
 */
export interface RegisteredComponentProps extends EditableComponentProps {
  /** Contenido del componente (draft_content) */
  content: Record<string, unknown>
  /** Estilos del componente */
  styles: ComponentStyles
}

/**
 * Tipo para un componente registrado
 */
export type RegisteredComponent = React.ComponentType<RegisteredComponentProps>

/**
 * Registry de componentes para el Visual Editor
 * 
 * Los componentes deben estar registrados aquí para que aparezcan en el editor.
 * El nombre (key) debe coincidir con el `name` en component_types de la base de datos.
 */
export const componentRegistry: Record<string, RegisteredComponent> = {
  // Básicos
  hero_slider: HeroSlider,
  carousel_cards: CarouselCards,
  contact_section: ContactSection,
  image_text: ImageText,
  title_text: TitleText,
}

/**
 * Categorías de componentes para la UI
 */
export const componentCategories: Record<string, {
  label: string
  components: string[]
}> = {
  basics: {
    label: "Básicos",
    components: ["hero_slider", "carousel_cards", "contact_section", "image_text", "title_text"],
  },
  // Agregar más categorías aquí cuando sea necesario
  // layout: { label: "Layout", components: [] },
  // ecommerce: { label: "E-Commerce", components: [] },
}

/**
 * Configuración de campos editables por tipo de componente
 * Esto define qué campos aparecen en el sidebar cuando seleccionas un componente
 */
export const componentFieldConfigs: Record<string, Array<{
  name: string
  label: string
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'color' | 'select' | 'number' | 'boolean' | 'array'
  defaultValue?: unknown
  options?: { label: string; value: string }[]
}>> = {
  hero_slider: [
    { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: true },
    { name: 'autoplaySpeed', label: 'Velocidad (ms)', type: 'number', defaultValue: 5000 },
    { name: 'showArrows', label: 'Mostrar flechas', type: 'boolean', defaultValue: true },
    { name: 'showDots', label: 'Mostrar puntos', type: 'boolean', defaultValue: true },
  ],
  carousel_cards: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Nuestros Servicios' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: '' },
    { name: 'cardsPerView', label: 'Cards por vista', type: 'number', defaultValue: 3 },
  ],
  contact_section: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Contáctanos' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: '' },
    { name: 'formTitle', label: 'Título del formulario', type: 'text', defaultValue: 'Envíanos un mensaje' },
    { name: 'submitButtonText', label: 'Texto del botón', type: 'text', defaultValue: 'Enviar mensaje' },
    { name: 'showMap', label: 'Mostrar mapa', type: 'boolean', defaultValue: false },
    { name: 'mapEmbedUrl', label: 'URL del mapa (embed)', type: 'text', defaultValue: '' },
  ],
  image_text: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Sobre Nosotros' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: '' },
    { name: 'imagePosition', label: 'Posición de imagen', type: 'select', defaultValue: 'left', options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Derecha', value: 'right' },
    ]},
    { name: 'showButton', label: 'Mostrar botón', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del botón', type: 'text', defaultValue: 'Saber más' },
    { name: 'buttonUrl', label: 'URL del botón', type: 'text', defaultValue: '#' },
  ],
  title_text: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Título de la Sección' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'alignment', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Centro', value: 'center' },
      { label: 'Derecha', value: 'right' },
    ]},
    { name: 'titleSize', label: 'Tamaño del título', type: 'select', defaultValue: 'lg', options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
      { label: 'Extra grande', value: 'xl' },
    ]},
  ],
}

/**
 * Contenido por defecto para cada tipo de componente
 * Usado cuando se crea un nuevo componente
 */
export const componentDefaultContent: Record<string, Record<string, unknown>> = {
  hero_slider: {
    slides: [
      {
        id: "slide-1",
        title: "Bienvenido a nuestra tienda",
        subtitle: "Descubre los mejores productos con ofertas exclusivas",
        image: "/placeholder.svg?height=600&width=1200",
        buttonText: "Ver productos",
        buttonUrl: "/productos",
      },
    ],
    autoplay: true,
    autoplaySpeed: 5000,
    showArrows: true,
    showDots: true,
  },
  carousel_cards: {
    title: "Nuestros Servicios",
    subtitle: "Descubre todo lo que podemos ofrecerte",
    cards: [
      {
        id: "card-1",
        title: "Servicio 1",
        description: "Descripción del primer servicio.",
        image: "/placeholder.svg?height=200&width=300",
        link: "#",
      },
      {
        id: "card-2",
        title: "Servicio 2",
        description: "Descripción del segundo servicio.",
        image: "/placeholder.svg?height=200&width=300",
        link: "#",
      },
      {
        id: "card-3",
        title: "Servicio 3",
        description: "Descripción del tercer servicio.",
        image: "/placeholder.svg?height=200&width=300",
        link: "#",
      },
    ],
    cardsPerView: 3,
  },
  contact_section: {
    title: "Contáctanos",
    subtitle: "Estamos aquí para ayudarte.",
    contactInfo: {
      email: "contacto@ejemplo.com",
      phone: "+1 234 567 890",
      address: "Calle Principal 123, Ciudad, País",
    },
    formTitle: "Envíanos un mensaje",
    submitButtonText: "Enviar mensaje",
    showMap: false,
  },
  image_text: {
    title: "Sobre Nosotros",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "/placeholder.svg?height=400&width=600",
    imageAlt: "Imagen descriptiva",
    imagePosition: "left",
    buttonText: "Saber más",
    buttonUrl: "#",
    showButton: true,
  },
  title_text: {
    title: "Título de la Sección",
    text: "Este es el contenido de texto que acompaña al título.",
    alignment: "center",
    titleSize: "lg",
  },
}

/**
 * Estilos por defecto para cada tipo de componente
 */
export const componentDefaultStyles: Record<string, ComponentStyles> = {
  hero_slider: {
    padding: "",
  },
  carousel_cards: {
    padding: "py-16",
    backgroundColor: "#ffffff",
  },
  contact_section: {
    padding: "py-16",
    backgroundColor: "#f8fafc",
  },
  image_text: {
    padding: "py-16",
    backgroundColor: "#ffffff",
  },
  title_text: {
    padding: "py-12",
    backgroundColor: "#ffffff",
  },
}

/**
 * Metadatos de componentes para la UI (iconos, labels, etc.)
 */
export const componentMetadata: Record<string, {
  label: string
  icon: string
  description: string
}> = {
  hero_slider: {
    label: "Hero Slider",
    icon: "Image",
    description: "Slider de imágenes para el header con texto y botones",
  },
  carousel_cards: {
    label: "Carrusel de Cards",
    icon: "LayoutGrid",
    description: "Carrusel horizontal de tarjetas con imagen y texto",
  },
  contact_section: {
    label: "Sección de Contacto",
    icon: "Mail",
    description: "Formulario de contacto con información de contacto",
  },
  image_text: {
    label: "Imagen + Texto",
    icon: "SplitSquareHorizontal",
    description: "Sección con imagen a un lado y texto al otro",
  },
  title_text: {
    label: "Título + Texto",
    icon: "Type",
    description: "Sección simple con título y párrafo de texto",
  },
}
