import { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { componentRegistry } from "@/components/admin/page-builder/ComponentRegistry"
import { getGlobalStyles, type GlobalStyles } from "@/lib/services/page-builder.service"
import type { PageComponent } from "@/lib/types/page-builder.types"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Inicio | Tu Tienda",
  description: "Bienvenido a nuestra tienda en línea",
}

async function getHomePage() {
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .or("slug.eq./,slug.eq.home,slug.eq.inicio,is_home.eq.true")
    .eq("status", "published")
    .limit(1)
    .single()

  if (error || !page) {
    return null
  }

  return page
}

async function getPageComponents(pageId: string): Promise<PageComponent[]> {
  const { data, error } = await supabase
    .from("page_components")
    .select("*")
    .eq("page_id", pageId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching page components:", error)
    return []
  }

  return data || []
}

function generateGlobalStylesCss(styles: GlobalStyles): string {
  return `
    :root {
      --builder-primary: ${styles.primary_color};
      --builder-secondary: ${styles.secondary_color};
      --builder-accent: ${styles.accent_color};
      --builder-background: ${styles.background_color};
      --builder-text: ${styles.text_color};
      --builder-heading-font: ${styles.heading_font};
      --builder-body-font: ${styles.body_font};
      --builder-h1-size: ${styles.heading_size_h1};
      --builder-h2-size: ${styles.heading_size_h2};
      --builder-h3-size: ${styles.heading_size_h3};
      --builder-h4-size: ${styles.heading_size_h4};
      --builder-body-size: ${styles.body_size};
      --builder-small-size: ${styles.small_size};
      --builder-heading-weight: ${styles.heading_weight};
      --builder-body-weight: ${styles.body_weight};
      --builder-heading-line-height: ${styles.heading_line_height};
      --builder-body-line-height: ${styles.body_line_height};
      --builder-border-radius: ${styles.border_radius};
    }
    .builder-page {
      background-color: var(--builder-background);
      color: var(--builder-text);
      font-family: var(--builder-body-font);
      font-size: var(--builder-body-size);
      font-weight: var(--builder-body-weight);
      line-height: var(--builder-body-line-height);
    }
    .builder-page h1 { font-family: var(--builder-heading-font); font-size: var(--builder-h1-size); font-weight: var(--builder-heading-weight); line-height: var(--builder-heading-line-height); }
    .builder-page h2 { font-family: var(--builder-heading-font); font-size: var(--builder-h2-size); font-weight: var(--builder-heading-weight); line-height: var(--builder-heading-line-height); }
    .builder-page h3 { font-family: var(--builder-heading-font); font-size: var(--builder-h3-size); font-weight: var(--builder-heading-weight); line-height: var(--builder-heading-line-height); }
    .builder-page h4 { font-family: var(--builder-heading-font); font-size: var(--builder-h4-size); font-weight: var(--builder-heading-weight); line-height: var(--builder-heading-line-height); }
    .builder-page .text-primary, .builder-page a { color: var(--builder-primary); }
    .builder-page .bg-primary { background-color: var(--builder-primary); }
    ${styles.custom_css || ''}
  `
}

export default async function HomePage() {
  const page = await getHomePage()

  if (!page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">Bienvenido</h1>
          <p className="text-muted-foreground mb-6">
            La página de inicio aún no ha sido configurada. 
            Crea una página con el slug &quot;home&quot; desde el Page Builder.
          </p>
          <Link 
            href="/admin/pages"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ir al Page Builder
          </Link>
        </div>
      </div>
    )
  }

  const [components, globalStyles] = await Promise.all([
    getPageComponents(page.id),
    getGlobalStyles()
  ])

  const stylesCss = generateGlobalStylesCss(globalStyles)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: stylesCss }} />
      <div className="builder-page min-h-screen">
        {components.map((component) => {
          const Component = componentRegistry[component.component_type]
          if (!Component) return null

          return (
            <Component
              key={component.id}
              content={component.published_content}
              styles={component.styles}
              isEditable={false}
              isSelected={false}
            />
          )
        })}

        {components.length === 0 && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Esta página no tiene contenido todavía.
              </p>
              <Link 
                href={`/admin/pages/${page.id}`}
                className="text-primary hover:underline"
              >
                Editar página
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
