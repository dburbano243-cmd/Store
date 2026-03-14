import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CartProvider } from "@/hooks/useCart"
import { AuthProvider } from "@/hooks/useAuth"
import { Toaster } from "@/components/ui/toaster"
import SWRProvider from "@/components/SWRProvider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MinimalStore - Tienda Online",
  description: "Tu tienda online de confianza para productos de alta calidad",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <SWRProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </SWRProvider>
        <Toaster />
      </body>
    </html>
  )
}
