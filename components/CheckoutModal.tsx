"use client"

import type React from "react"

import { useState } from "react"
import { X, ShoppingBag, CreditCard, Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/useCart"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, getTotalPrice, updateQuantity, removeFromCart } = useCart()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    legalId: "",
    address: "",
    city: "",
    region: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleWompiPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Build items array for the Edge Function
      const items = cartItems.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity || 1),
        unit_price: Math.round(item.price),
      }))

      const total = Math.round(getTotalPrice())
      const returnUrl = `${window.location.origin}/payment-response`

      // Call our API proxy which forwards to the Supabase Edge Function
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: null, // Will be resolved to a guest UUID server-side
          items,
          total,
          return_url: returnUrl,
          // Customer data for Wompi checkout context
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            legal_id: formData.legalId || undefined,
            address: formData.address,
            city: formData.city,
            region: formData.region || undefined,
          },
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(
          errorData?.error || "No se pudo crear la orden. Intenta nuevamente."
        )
      }

      const data = await res.json()
      const checkoutUrl = data.checkout_url || data.payment_url

      if (!checkoutUrl) {
        throw new Error("No se recibio la URL de pago. Intenta nuevamente.")
      }

      // Redirect to Wompi checkout (URL provided by the Edge Function)
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-md lg:h-auto bg-white rounded-lg shadow-xl z-50 flex flex-col">
        <div className="flex flex-col h-full max-h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Finalizar Compra</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Order summary */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen del pedido</h3>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 truncate font-medium">{item.name}</div>
                      <div className="text-gray-500 text-xs">${item.price.toLocaleString("es-CO")}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                        onClick={() => {
                          const newQty = Number(item.quantity || 0) - 1
                          if (newQty <= 0) removeFromCart(item.id)
                          else updateQuantity(item.id, newQty)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-8 text-center text-sm">{Number(item.quantity || 0)}</span>

                      <button
                        type="button"
                        aria-label={`Aumentar cantidad de ${item.name}`}
                        onClick={() => updateQuantity(item.id, Number(item.quantity || 0) + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                      <div className="w-20 text-right font-medium">
                        ${(item.price * Number(item.quantity || 0)).toLocaleString("es-CO")}
                      </div>

                      <button
                        type="button"
                        aria-label={`Eliminar ${item.name}`}
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleWompiPayment} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="3001234567"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="legalId" className="block text-sm font-medium text-gray-700 mb-1">
                    Cedula
                  </label>
                  <input
                    type="text"
                    id="legalId"
                    name="legalId"
                    value={formData.legalId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="1234567890"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Bogota"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Cundinamarca"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Direccion de entrega *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Calle 123 #4-5, Apto 201"
                  />
                </div>
              </div>

              {/* Wompi info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Pago seguro con Wompi</span>
                </div>
                <p className="text-xs text-blue-600">
                  Seras redirigido al checkout seguro de Wompi para completar tu pago
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Preparando pago...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pagar con Wompi
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
