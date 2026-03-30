import type { ComponentStyles, EditableComponentProps } from "@/lib/types/page-builder.types"

// Importar todos los bloques disponibles
import { HeroSlider } from "@/components/page-builder/blocks/HeroSlider"
import { CarouselCards } from "@/components/page-builder/blocks/CarouselCards"
import { ContactSection } from "@/components/page-builder/blocks/ContactSection"
import { ImageText } from "@/components/page-builder/blocks/ImageText"
import { TitleText } from "@/components/page-builder/blocks/TitleText"
import { ProductGridBlock } from "@/components/page-builder/blocks/ProductGridBlock"
import { VideoGalleryBlock } from "@/components/page-builder/blocks/VideoGalleryBlock"
import { ImageTextLeft } from "@/components/page-builder/blocks/ImageTextLeft"
import { ImageTextRight } from "@/components/page-builder/blocks/ImageTextRight"
import { HeroBannerLeft } from "@/components/page-builder/blocks/HeroBannerLeft"
import { HeroBannerRight } from "@/components/page-builder/blocks/HeroBannerRight"
import { HeaderEteris } from "@/components/page-builder/blocks/HeaderEteris"

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
  // Imagen + Texto
  image_text_left: ImageTextLeft,
  image_text_right: ImageTextRight,
  // Hero Banners
  hero_banner_left: HeroBannerLeft,
  hero_banner_right: HeroBannerRight,
  header_eteris: HeaderEteris,
  // E-commerce
  product_grid: ProductGridBlock,
  // Media
  video_gallery: VideoGalleryBlock,
}

/**
 * Categorías de componentes para la UI
 */
export const componentCategories: Record<string, {
  label: string
  components: string[]
}> = {
  heroes: {
    label: "Heroes / Banners",
    components: ["hero_slider", "hero_banner_left", "hero_banner_right", "header_eteris"],
  },
  content: {
    label: "Contenido",
    components: ["image_text_left", "image_text_right", "image_text", "title_text"],
  },
  basics: {
    label: "Básicos",
    components: ["carousel_cards", "contact_section"],
  },
  ecommerce: {
    label: "E-Commerce",
    components: ["product_grid"],
  },
  media: {
    label: "Media",
    components: ["video_gallery"],
  },
}

/**
 * Configuración de campos editables por tipo de componente
 * Esto define qué campos aparecen en el sidebar cuando seleccionas un componente
 */
/**
 * Campos de estilo comunes para componentes
 */
const commonStyleFields = {
  backgroundColor: { name: 'styles.backgroundColor', label: 'Color de fondo', type: 'color' as const, defaultValue: '#ffffff' },
  textColor: { name: 'styles.textColor', label: 'Color de texto', type: 'color' as const, defaultValue: '#111827' },
  accentColor: { name: 'styles.accentColor', label: 'Color de acento', type: 'color' as const, defaultValue: '#3b82f6' },
  overlayColor: { name: 'styles.overlayColor', label: 'Color del overlay', type: 'color' as const, defaultValue: '#000000' },
  buttonColor: { name: 'styles.buttonColor', label: 'Color del boton', type: 'color' as const, defaultValue: '#111827' },
  buttonTextColor: { name: 'styles.buttonTextColor', label: 'Color texto boton', type: 'color' as const, defaultValue: '#ffffff' },
}

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
    commonStyleFields.overlayColor,
    commonStyleFields.accentColor,
  ],
  carousel_cards: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Nuestros Servicios' },
    { name: 'subtitle', label: 'Subtitulo', type: 'textarea', defaultValue: '' },
    { name: 'cardsPerView', label: 'Cards por vista', type: 'number', defaultValue: 3 },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],
  contact_section: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Contactame' },
    { name: 'subtitle', label: 'Subtitulo', type: 'textarea', defaultValue: 'Tienes alguna pregunta? Me encantaria escucharte' },
    { name: 'submitButtonText', label: 'Texto del boton', type: 'text', defaultValue: 'Enviar Mensaje' },
    { name: 'showMap', label: 'Mostrar mapa', type: 'boolean', defaultValue: false },
    { name: 'mapEmbedUrl', label: 'URL del mapa (embed)', type: 'text', defaultValue: '' },
    { name: 'nameLabel', label: 'Label - Nombre', type: 'text', defaultValue: 'Nombre' },
    { name: 'namePlaceholder', label: 'Placeholder - Nombre', type: 'text', defaultValue: 'Tu nombre completo' },
    { name: 'emailLabel', label: 'Label - Email', type: 'text', defaultValue: 'Correo Electronico' },
    { name: 'emailPlaceholder', label: 'Placeholder - Email', type: 'text', defaultValue: 'tu@email.com' },
    { name: 'messageLabel', label: 'Label - Mensaje', type: 'text', defaultValue: 'Mensaje' },
    { name: 'messagePlaceholder', label: 'Placeholder - Mensaje', type: 'text', defaultValue: 'Escribe tu mensaje aqui...' },
    { name: 'successTitle', label: 'Titulo exito', type: 'text', defaultValue: 'Mensaje enviado' },
    { name: 'successMessage', label: 'Mensaje exito', type: 'text', defaultValue: 'Mensaje enviado correctamente! Te contactare pronto.' },
    { name: 'errorTitle', label: 'Titulo error', type: 'text', defaultValue: 'Error' },
    { name: 'errorMessage', label: 'Mensaje error', type: 'text', defaultValue: 'Ocurrio un error al enviar el mensaje. Intenta de nuevo mas tarde.' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.buttonColor,
    commonStyleFields.buttonTextColor,
  ],
  image_text: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Sobre Nosotros' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: '' },
    { name: 'imagePosition', label: 'Posicion de imagen', type: 'select', defaultValue: 'left', options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Derecha', value: 'right' },
    ]},
    { name: 'showButton', label: 'Mostrar boton', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del boton', type: 'text', defaultValue: 'Saber mas' },
    { name: 'buttonUrl', label: 'URL del boton', type: 'text', defaultValue: '#' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],
  title_text: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Titulo de la Seccion' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'alignment', label: 'Alineacion', type: 'select', defaultValue: 'center', options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Centro', value: 'center' },
      { label: 'Derecha', value: 'right' },
    ]},
    { name: 'titleSize', label: 'Tamano del titulo', type: 'select', defaultValue: 'lg', options: [
      { label: 'Pequeno', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
      { label: 'Extra grande', value: 'xl' },
    ]},
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],
  product_grid: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Productos Destacados' },
    { name: 'subtitle', label: 'Subtitulo', type: 'textarea', defaultValue: '' },
    { name: 'dataSource', label: 'Fuente de datos', type: 'select', defaultValue: 'featured', options: [
      { label: 'Productos destacados', value: 'featured' },
      { label: 'Productos recientes', value: 'recent' },
      { label: 'Por categoria', value: 'category' },
      { label: 'Manual', value: 'manual' },
    ]},
    { name: 'categoryId', label: 'ID de Categoria', type: 'text', defaultValue: '' },
    { name: 'limit', label: 'Cantidad de productos', type: 'number', defaultValue: 8 },
    { name: 'columns', label: 'Columnas', type: 'select', defaultValue: '4', options: [
      { label: '2 columnas', value: '2' },
      { label: '3 columnas', value: '3' },
      { label: '4 columnas', value: '4' },
      { label: '5 columnas', value: '5' },
    ]},
    { name: 'showViewAll', label: 'Mostrar "Ver todos"', type: 'boolean', defaultValue: true },
    { name: 'viewAllUrl', label: 'URL "Ver todos"', type: 'text', defaultValue: '/productos' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],
  video_gallery: [
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Galeria de Videos' },
    { name: 'subtitle', label: 'Subtitulo', type: 'textarea', defaultValue: '' },
    { name: 'layout', label: 'Layout', type: 'select', defaultValue: 'grid', options: [
      { label: 'Grilla', value: 'grid' },
      { label: 'Lista', value: 'list' },
      { label: 'Destacado', value: 'featured' },
    ]},
    { name: 'columns', label: 'Columnas (solo grilla)', type: 'select', defaultValue: '3', options: [
      { label: '2 columnas', value: '2' },
      { label: '3 columnas', value: '3' },
      { label: '4 columnas', value: '4' },
    ]},
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
  ],
  image_text_left: [
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Sobre Nosotros' },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Descubre Nuestra Historia' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: '' },
    { name: 'showButton', label: 'Mostrar boton', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del boton', type: 'text', defaultValue: 'Conocer mas' },
    { name: 'buttonUrl', label: 'URL del boton', type: 'text', defaultValue: '/about' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],
  image_text_right: [
    { name: 'subtitle', label: 'Subtitulo', type: 'text', defaultValue: 'Nuestro Compromiso' },
    { name: 'title', label: 'Titulo', type: 'text', defaultValue: 'Calidad Garantizada' },
    { name: 'text', label: 'Texto', type: 'textarea', defaultValue: '' },
    { name: 'image', label: 'Imagen', type: 'image', defaultValue: '' },
    { name: 'imageAlt', label: 'Alt de imagen', type: 'text', defaultValue: '' },
    { name: 'showButton', label: 'Mostrar boton', type: 'boolean', defaultValue: true },
    { name: 'buttonText', label: 'Texto del boton', type: 'text', defaultValue: 'Ver productos' },
    { name: 'buttonUrl', label: 'URL del boton', type: 'text', defaultValue: '/productos' },
    commonStyleFields.backgroundColor,
    commonStyleFields.textColor,
    commonStyleFields.accentColor,
  ],
  hero_banner_left: [
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
  hero_banner_right: [
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
  header_eteris: [
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
        image: "/images/placeholder.svg",
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
        image: "/images/placeholder.svg",
        link: "#",
      },
      {
        id: "card-2",
        title: "Servicio 2",
        description: "Descripción del segundo servicio.",
        image: "/images/placeholder.svg",
        link: "#",
      },
      {
        id: "card-3",
        title: "Servicio 3",
        description: "Descripción del tercer servicio.",
        image: "/images/placeholder.svg",
        link: "#",
      },
    ],
    cardsPerView: 3,
  },
  contact_section: {
    title: "Contáctame",
    subtitle: "¿Tienes alguna pregunta? Me encantaría escucharte",
    contactInfo: {
      email: "contacto@ejemplo.com",
      phone: "+1 234 567 890",
      address: "Calle Principal 123, Ciudad, País",
    },
    formTitle: "Envíanos un mensaje",
    submitButtonText: "Enviar Mensaje",
    showMap: false,
    mapEmbedUrl: "",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre completo",
    emailLabel: "Correo Electrónico",
    emailPlaceholder: "tu@email.com",
    messageLabel: "Mensaje",
    messagePlaceholder: "Escribe tu mensaje aquí...",
    successTitle: "Mensaje enviado",
    successMessage: "¡Mensaje enviado correctamente! Te contactaré pronto.",
    errorTitle: "Error",
    errorMessage: "Ocurrió un error al enviar el mensaje. Intenta de nuevo más tarde.",
  },
  image_text: {
    title: "Sobre Nosotros",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "/images/placeholder.svg",
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
  product_grid: {
    title: "Productos Destacados",
    subtitle: "Descubre nuestra selección especial",
    dataSource: "featured",
    categoryId: "",
    limit: 8,
    columns: "4",
    showViewAll: true,
    viewAllUrl: "/productos",
    manualProductIds: [],
  },
  video_gallery: {
    title: "Galería de Videos",
    subtitle: "Explora nuestro contenido multimedia",
    layout: "grid",
    columns: "3",
    videos: [
      {
        id: "video-1",
        title: "Video de ejemplo",
        description: "Descripción del video",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "/images/placeholder.svg",
      },
    ],
  },
  image_text_left: {
    title: "Descubre Nuestra Historia",
    subtitle: "Sobre Nosotros",
    text: "Somos una empresa comprometida con la calidad y la excelencia. Cada producto que ofrecemos está cuidadosamente seleccionado para garantizar la mejor experiencia para nuestros clientes.",
    image: "/images/placeholder.svg",
    imageAlt: "Imagen descriptiva",
    buttonText: "Conocer más",
    buttonUrl: "/about",
    showButton: true,
  },
  image_text_right: {
    title: "Calidad Garantizada",
    subtitle: "Nuestro Compromiso",
    text: "Nos esforzamos por ofrecer productos de la más alta calidad. Cada artículo pasa por rigurosos controles para asegurar que cumple con nuestros estándares de excelencia.",
    image: "/images/placeholder.svg",
    imageAlt: "Imagen descriptiva",
    buttonText: "Ver productos",
    buttonUrl: "/productos",
    showButton: true,
  },
  hero_banner_left: {
    title: "Bienvenido a Nuestra Tienda",
    subtitle: "Colecciones Exclusivas",
    text: "Descubre productos únicos cuidadosamente seleccionados para ti. Calidad, estilo y servicio excepcional en cada compra.",
    backgroundImage: "/images/placeholder.svg",
    overlayOpacity: 50,
    buttonText: "Explorar Productos",
    buttonUrl: "/productos",
    showButton: true,
    secondaryButtonText: "Conocer más",
    secondaryButtonUrl: "/about",
    showSecondaryButton: true,
  },
  hero_banner_right: {
    title: "Productos de Calidad Premium",
    subtitle: "Nueva Colección",
    text: "Encuentra lo mejor para ti en nuestra selección exclusiva. Envíos rápidos y atención personalizada.",
    backgroundImage: "/images/placeholder.svg",
    overlayOpacity: 50,
    buttonText: "Comprar Ahora",
    buttonUrl: "/productos",
    showButton: true,
    secondaryButtonText: "Ver catálogo",
    secondaryButtonUrl: "/catalogo",
    showSecondaryButton: true,
  },
  header_eteris: {
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
  product_grid: {
    padding: "py-16",
    backgroundColor: "#f8fafc",
  },
  video_gallery: {
    padding: "py-16",
    backgroundColor: "#ffffff",
  },
  image_text_left: {
    padding: "",
    backgroundColor: "#ffffff",
    accentColor: "#3b82f6",
  },
  image_text_right: {
    padding: "",
    backgroundColor: "#f8fafc",
    accentColor: "#3b82f6",
  },
  hero_banner_left: {
    padding: "",
    overlayColor: "#000000",
    accentColor: "#f59e0b",
  },
  hero_banner_right: {
    padding: "",
    overlayColor: "#000000",
    accentColor: "#10b981",
  },
  header_eteris: {
    padding: "",
    overlayColor: "#000000",
    accentColor: "#c9a962",
    textColor: "#ffffff",
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
  product_grid: {
    label: "Grilla de Productos",
    icon: "ShoppingBag",
    description: "Muestra productos de la tienda en formato grilla",
  },
  video_gallery: {
    label: "Galería de Videos",
    icon: "Video",
    description: "Galería de videos de YouTube con diferentes layouts",
  },
  image_text_left: {
    label: "Imagen Izquierda + Texto",
    icon: "PanelLeft",
    description: "Imagen a la izquierda con texto y botón a la derecha",
  },
  image_text_right: {
    label: "Texto + Imagen Derecha",
    icon: "PanelRight",
    description: "Texto a la izquierda con imagen y botón a la derecha",
  },
  hero_banner_left: {
    label: "Banner Hero (Izquierda)",
    icon: "ImageIcon",
    description: "Banner de pantalla completa con fondo de imagen y contenido alineado a la izquierda",
  },
  hero_banner_right: {
    label: "Banner Hero (Derecha)",
    icon: "ImageIcon",
    description: "Banner de pantalla completa con fondo de imagen y contenido alineado a la derecha",
  },
  header_eteris: {
    label: "Header Eteris",
    icon: "Sparkles",
    description: "Header minimalista de pantalla completa con slider fade, redes sociales verticales y paginacion numerica",
  },
}
