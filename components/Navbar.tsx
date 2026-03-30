"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import UserMenu from "@/components/UserMenu"
import { supabase } from "@/lib/supabase"

interface NavLink {
  id: string
  label: string
  href: string
}

interface NavbarConfig {
  logo_text: string
  logo_url: string
  links: NavLink[]
  show_cart: boolean
  show_auth: boolean
}

const DEFAULT_CONFIG: NavbarConfig = {
  logo_text: "MinimalStore",
  logo_url: "",
  links: [
    { id: "1", label: "INICIO", href: "/" },
    { id: "2", label: "PRODUCTOS", href: "/productos" },
    { id: "3", label: "CONTACTO", href: "/#contacto" },
  ],
  show_cart: true,
  show_auth: true,
}

interface NavbarProps {
  onCartClick: () => void
}

export default function Navbar({ onCartClick }: NavbarProps) {
  const [config, setConfig] = useState<NavbarConfig>(DEFAULT_CONFIG)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { getTotalItems } = useCart()

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("navbar_config")
          .limit(1)
          .single()

        if (data?.navbar_config) {
          setConfig(data.navbar_config as NavbarConfig)
        }
      } catch (error) {
        // Use default config
      }
    }
    loadConfig()
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              {config.logo_url ? (
                <Image src={config.logo_url} alt={config.logo_text} width={150} height={40} className="h-10 w-auto" />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{config.logo_text}</h1>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {config.links.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu & Cart Icon */}
          <div className="flex items-center space-x-2">
            {config.show_auth && <UserMenu />}
            {config.show_cart && (
              <button onClick={onCartClick} className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {config.links.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
