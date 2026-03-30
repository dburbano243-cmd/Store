"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Store,
  ChevronUp,
  ChevronDown,
  Settings,
  ShoppingBag,
  Truck,
  FileText,
  Layers,
  PanelLeft,
  Plug,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Navegación del Dashboard (solo)
const dashboardNav = {
  label: "Dashboard",
  href: "/admin/dashboard",
  icon: LayoutDashboard,
}

// Navegación del Page Builder
const pageBuilderNav = {
  label: "Page Builder",
  icon: PanelLeft,
  items: [
    {
      label: "Páginas",
      href: "/admin/pages",
      icon: FileText,
    },
    {
      label: "Componentes",
      href: "/admin/components",
      icon: Layers,
    },
    {
      label: "Integraciones",
      href: "/admin/integrations",
      icon: Plug,
    },
  ],
}

// Navegación de la Tienda
const storeNav = {
  label: "Tienda",
  icon: Store,
  items: [
    {
      label: "Productos",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Órdenes",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Envíos",
      href: "/admin/shipments",
      icon: Truck,
    },
  ],
}

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const isGroupActive = (items: { href: string }[]) =>
    items.some((item) => isActiveRoute(item.href))

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">
              MinimalStore
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Panel Admin
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Dashboard - Solo */}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActiveRoute(dashboardNav.href)}
                  tooltip={dashboardNav.label}
                >
                  <Link href={dashboardNav.href}>
                    <dashboardNav.icon className="h-4 w-4" />
                    <span>{dashboardNav.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Page Builder - Colapsable */}
        <SidebarGroup>
          <SidebarGroupLabel>Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                defaultOpen={isGroupActive(pageBuilderNav.items)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={pageBuilderNav.label}>
                      <pageBuilderNav.icon className="h-4 w-4" />
                      <span>{pageBuilderNav.label}</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {pageBuilderNav.items.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveRoute(item.href)}
                          >
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tienda - Colapsable */}
        <SidebarGroup>
          <SidebarGroupLabel>Comercio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                defaultOpen={isGroupActive(storeNav.items)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={storeNav.label}>
                      <storeNav.icon className="h-4 w-4" />
                      <span>{storeNav.label}</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {storeNav.items.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveRoute(item.href)}
                          >
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configuracion">
              <Link href="/admin/settings" className="text-sidebar-foreground/70">
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ir a la tienda">
              <Link href="/" className="text-sidebar-foreground/70">
                <ChevronUp className="h-4 w-4 -rotate-90" />
                <span>Ir a la tienda</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
