"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FooterLink {
  id: string
  label: string
  href: string
}

interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
}

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface FooterConfig {
  company_name: string
  description: string
  columns: FooterColumn[]
  social_links: SocialLink[]
  copyright_text: string
}

const DEFAULT_CONFIG: FooterConfig = {
  company_name: "MinimalStore",
  description: "Tu tienda online de confianza para productos de alta calidad con diseño minimalista.",
  columns: [
    {
      id: "1",
      title: "Enlaces Rápidos",
      links: [
        { id: "1-1", label: "Inicio", href: "/" },
        { id: "1-2", label: "Productos", href: "/productos" },
        { id: "1-3", label: "Contacto", href: "/#contacto" },
      ],
    },
  ],
  social_links: [],
  copyright_text: "© 2024 MinimalStore. Todos los derechos reservados.",
}

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
  tiktok: <span className="text-sm font-bold">TT</span>,
}

export default function Footer() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("footer_config")
          .limit(1)
          .single()

        if (data?.footer_config) {
          setConfig(data.footer_config as FooterConfig)
        }
      } catch (error) {
        // Use default config
      }
    }
    loadConfig()
  }, [])

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{config.company_name}</h3>
            <p className="text-gray-400 mb-4">{config.description}</p>
            {config.social_links.length > 0 && (
              <div className="flex space-x-4">
                {config.social_links.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {socialIcons[social.platform] || social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Columnas dinámicas */}
          {config.columns.map((column) => (
            <div key={column.id}>
              <h4 className="text-lg font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">{config.copyright_text}</p>
        </div>
      </div>
    </footer>
  )
}
