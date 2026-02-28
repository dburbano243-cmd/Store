"use client"

import { useState } from "react"
import { X, Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/useCart"
import CheckoutModal from "./CheckoutModal"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Carrito de Compras</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const media = (item as any).media ?? []
                  const selectedIndex = (item as any).selected_media_index
                  const preferred = media.find((m: any) => {
                    const fn = (m.file_name ?? "") as string
                    const sp = (m.storage_path ?? "") as string
                    const getExt = (s: string) => {
                      const match = s.match(/\.([^.\/]+)$/)
                      return match ? match[1].toLowerCase() : ""
                    }
                    const fnExt = getExt(fn)
                    const spExt = getExt(sp)

                    if (/^1(\.|$)/.test(fn)) {
                      if (fnExt && fnExt !== "mp4") return true
                    }

                    if (/\/1\.[^/]+$/.test(sp)) {
                      if (spExt && spExt !== "mp4") return true
                    }

                    return false
                  })

                  const src =
                    preferred?.url ??
                    (selectedIndex !== undefined ? media[selectedIndex]?.url : undefined) ??
                    media[1]?.url ??
                    media[0]?.url ??
                    "/placeholder.svg"

                  return (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image src={src} alt={item.name} fill className="object-cover rounded" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">${item.price.toLocaleString("es-CO")}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, Number(item.quantity || 0) - 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{Number(item.quantity || 0)}</span>
                        <button
                          onClick={() => updateQuantity(item.id, Number(item.quantity || 0) + 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Subtotal:</span>
                <span className="text-lg font-bold">${getTotalPrice().toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
