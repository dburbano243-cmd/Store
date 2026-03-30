/**
 * Static Data Repositories
 * 
 * Repositorios para datos estáticos como sliders y videos.
 * Por ahora usan datos hardcoded, pero pueden conectarse a la BD después.
 */

import type { 
  SliderRepository, 
  SliderSlide, 
  VideoGalleryRepository, 
  GalleryVideo 
} from "../types"

// =============================================
// SLIDER DATA (Hardcoded por ahora)
// TODO: Migrar a base de datos cuando sea necesario
// =============================================

const STATIC_SLIDES: SliderSlide[] = [
  {
    id: "slide-1",
    src: "/slider/1.webp",
    type: "image",
    title: "Lavable y Reutilizable",
    subtitle: "",
    position: 1,
    isActive: true,
  },
  {
    id: "slide-2",
    src: "/slider/2.mp4",
    type: "video",
    title: "Compacto",
    subtitle: "Pequeño, potente y listo para llevar",
    position: 2,
    isActive: true,
  },
]

export const supabaseSliderRepository: SliderRepository = {
  async getActiveSlides(): Promise<SliderSlide[]> {
    // Por ahora retornamos datos estáticos
    // Cuando migres a BD, reemplaza esta implementación
    return STATIC_SLIDES.filter(s => s.isActive).sort((a, b) => a.position - b.position)
  },

  async getById(id: string): Promise<SliderSlide | null> {
    return STATIC_SLIDES.find(s => s.id === id) ?? null
  },
}

// =============================================
// VIDEO GALLERY DATA (Hardcoded por ahora)
// TODO: Migrar a base de datos cuando sea necesario
// =============================================

const STATIC_VIDEOS: GalleryVideo[] = [
  {
    id: "video-1",
    type: "video",
    title: "Diseño y Materiales de Alta Calidad",
    description: "Fabricado con polímero de alta adherencia, resistente al uso continuo y totalmente lavable para máxima durabilidad.",
    thumbnail: "/slider/thumbnail.png",
    src: "/slider/1.webp",
    position: 1,
    isActive: true,
  },
  {
    id: "video-2",
    type: "video",
    title: "Modo de Uso Inteligente",
    description: "Deslízalo suavemente sobre la superficie, enjuágalo con agua y reutilízalo. Rápido, práctico y siempre listo en tu bolsillo.",
    thumbnail: "/slider/thumbnail.png",
    src: "/slider/2.mp4",
    position: 2,
    isActive: true,
  },
  {
    id: "video-3",
    type: "video",
    title: "Resultados Reales en Segundos",
    description: "Elimina pelusa, polvo y cabello al instante en ropa, muebles y vehículos, dejando un acabado limpio y profesional.",
    thumbnail: "/slider/thumbnail.png",
    src: "/slider/3.webp",
    position: 3,
    isActive: true,
  },
]

export const supabaseVideoGalleryRepository: VideoGalleryRepository = {
  async getActiveVideos(): Promise<GalleryVideo[]> {
    // Por ahora retornamos datos estáticos
    // Cuando migres a BD, reemplaza esta implementación
    return STATIC_VIDEOS.filter(v => v.isActive).sort((a, b) => a.position - b.position)
  },

  async getById(id: string): Promise<GalleryVideo | null> {
    return STATIC_VIDEOS.find(v => v.id === id) ?? null
  },
}
