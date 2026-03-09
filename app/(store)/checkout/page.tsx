"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingBag, CreditCard, Loader2, ArrowLeft, Lock, Minus, Plus, Trash2, Truck, User, MapPin, Check } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import CartSidebar from "@/components/CartSidebar"
import CitySelect from "@/components/CitySelect"

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, getTotalPrice, getTotalItems, isHydrated, updateQuantity, removeFromCart } = useCart()

  // Shipping cost logic: free if 5+ items, otherwise 10,000 COP
  const SHIPPING_COST = 10000
  const FREE_SHIPPING_THRESHOLD = 5
  const totalItems = getTotalItems()
  const shippingCost = totalItems >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const subtotal = getTotalPrice()
  const totalWithShipping = subtotal + shippingCost
  const { user, profile } = useAuth()
  const { toast } = useToast()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Section 1: Identificacion
  const [identificationForm, setIdentificationForm] = useState({
    email: "",
    name: "",
    documentNumber: "",
  })

  // Section 2: Envio
  const [shippingForm, setShippingForm] = useState({
    phone: "",
    address: "",
    city: "",
    neighborhood: "",
    additionalInfo: "",
    receiverName: "",
  })

  // Track which section is active
  const [activeSection, setActiveSection] = useState<1 | 2>(1)

  // Check if identification is complete
  const isIdentificationComplete = useMemo(() => {
    return (
      identificationForm.email.trim() !== "" &&
      identificationForm.name.trim() !== "" &&
      identificationForm.documentNumber.trim() !== "" &&
      identificationForm.documentNumber.trim().length >= 6
    )
  }, [identificationForm])

  // Check if shipping is complete
  const isShippingComplete = useMemo(() => {
    return (
      shippingForm.phone.trim() !== "" &&
      shippingForm.address.trim() !== "" &&
      shippingForm.city.trim() !== "" &&
      shippingForm.neighborhood.trim() !== "" &&
      shippingForm.receiverName.trim() !== ""
    )
  }, [shippingForm])

  // Can submit only when both sections are complete
  const canSubmit = isIdentificationComplete && isShippingComplete

  // Auto-advance to section 2 when section 1 is complete
  useEffect(() => {
    if (isIdentificationComplete && activeSection === 1) {
      setActiveSection(2)
    }
  }, [isIdentificationComplete, activeSection])

  // Pre-fill when user is logged in
  useEffect(() => {
    if (user && profile) {
      const prefill = async () => {
        const { data } = await supabase
          .from("users")
          .select("name, email, phone, address, city")
          .eq("id", user.id)
          .single()

        if (data) {
          setIdentificationForm({
            email: data.email || profile.email || "",
            name: data.name || profile.name || "",
            documentNumber: "",
          })
          setShippingForm(prev => ({
            ...prev,
            phone: data.phone || "",
            city: data.city || "",
            address: data.address || "",
          }))
        }
      }
      prefill()
    }
  }, [user, profile])

  const updateIdentification = (field: string, value: string) => {
    setIdentificationForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateShipping = (field: string, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }))
  }

  // Wait for cart to hydrate from localStorage before rendering anything
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando tu pedido...</span>
        </div>
      </div>
    )
  }

  // Show empty cart message only after hydration confirms it's truly empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onCartClick={() => setIsCartOpen(true)} />
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Tu carrito esta vacio</h2>
          <p className="text-muted-foreground mb-6">Agrega productos para continuar con tu compra</p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Volver a la tienda
          </button>
        </div>
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !canSubmit) return
    setError("")
    setIsSubmitting(true)

    try {
      let customerId = user?.id ?? null

      // If user is not logged in, auto-register with document number as password
      if (!user) {
        // Check if email already exists
        const { data: existingUser } = await supabase.auth.signInWithPassword({
          email: identificationForm.email,
          password: identificationForm.documentNumber,
        })

        if (existingUser?.user) {
          // User exists and password (document) matches
          customerId = existingUser.user.id
        } else {
          // Try to register new user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: identificationForm.email,
            password: identificationForm.documentNumber,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: { name: identificationForm.name },
            },
          })

          if (authError) {
            // If user already exists but wrong password, just continue as guest
            if (authError.message.includes("already registered")) {
              customerId = null
            } else if (authError.message.includes("rate") || authError.status === 429) {
              setError("Demasiados intentos. Por favor espera unos minutos e intenta de nuevo.")
              setIsSubmitting(false)
              return
            } else {
              // Continue anyway, order will be created with guest ID
              customerId = null
            }
          } else if (authData?.user) {
            customerId = authData.user.id

            // Upsert profile via server API
            await fetch("/api/register-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: authData.user.id,
                name: identificationForm.name,
                email: identificationForm.email,
                address: shippingForm.address || null,
                city: shippingForm.city || null,
                phone: shippingForm.phone || null,
              }),
            })
          }
        }
      }

      // Build shipment_data JSON with additional shipping info
      const shipmentData = {
        address: shippingForm.address,
        city: shippingForm.city,
        neighborhood: shippingForm.neighborhood,
        additional_info: shippingForm.additionalInfo,
        receiver_name: shippingForm.receiverName,
      }

      // Now create the order
      const items = cartItems.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity || 1),
        unit_price: Math.round(item.price),
      }))

      const orderSubtotal = Math.round(subtotal)
      const orderShippingCost = shippingCost
      const orderTotal = Math.round(totalWithShipping)
      const returnUrl = `${window.location.origin}/payment-response`

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          items,
          subtotal: orderSubtotal,
          shipping_cost: orderShippingCost,
          total: orderTotal,
          return_url: returnUrl,
          customer: {
            name: identificationForm.name,
            email: identificationForm.email,
            document_number: identificationForm.documentNumber,
            phone: shippingForm.phone,
            address: shippingForm.address,
            city: shippingForm.city,
          },
          shipment_data: shipmentData,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || "No se pudo crear la orden. Intenta nuevamente.")
      }

      const data = await res.json()
      const checkoutUrl = data.checkout_url || data.payment_url

      if (!checkoutUrl) {
        throw new Error("No se recibio la URL de pago. Intenta nuevamente.")
      }

      // Redirect to Wompi checkout
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
      setIsSubmitting(false)
    }
  }

  const inputClass =
    "w-full px-4 py-3 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
  const labelClass = "block text-sm font-medium text-foreground mb-2"

  // Get the preferred image for each cart item
  const getItemImage = (item: any) => {
    const media = item.media ?? []
    const selectedIndex = item.selected_media_index
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
    return (
      preferred?.url ??
      (selectedIndex !== undefined ? media[selectedIndex]?.url : undefined) ??
      media[1]?.url ??
      media[0]?.url ??
      "/placeholder.svg"
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <div className="max-w-6xl mx-auto px-4 py-8 mt-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: Order Summary */}
          <div className="w-full lg:w-5/12">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Resumen de tu pedido</h2>
              </div>

              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                {cartItems.map((item) => {
                  const imgSrc = getItemImage(item)
                  const qty = Number(item.quantity || 1)
                  const basePrice = (item as any).base_price ?? item.price
                  const hasDiscount = basePrice > item.price
                  const lineTotal = item.price * qty
                  const originalLineTotal = basePrice * qty
                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {hasDiscount && (
                            <span className="text-xs line-through text-muted-foreground">
                              ${basePrice.toLocaleString("es-CO")}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            ${item.price.toLocaleString("es-CO")} c/u
                          </span>
                        </div>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            disabled={qty <= 1}
                            className="w-6 h-6 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-6 h-6 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {hasDiscount && (
                          <p className="text-xs line-through text-muted-foreground">
                            ${originalLineTotal.toLocaleString("es-CO")}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-foreground">
                          ${lineTotal.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-border mt-6 pt-4 flex flex-col gap-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-foreground">
                    ${subtotal.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Envio</span>
                  </div>
                  {shippingCost === 0 ? (
                    <span className="text-sm font-medium text-green-600">Gratis</span>
                  ) : (
                    <span className="text-sm text-foreground">
                      ${shippingCost.toLocaleString("es-CO")}
                    </span>
                  )}
                </div>

                {/* Free shipping hint */}
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    Agrega {FREE_SHIPPING_THRESHOLD - totalItems} producto{FREE_SHIPPING_THRESHOLD - totalItems > 1 ? 's' : ''} mas para envio gratis
                  </p>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-base font-semibold text-foreground">Total a pagar</span>
                  <span className="text-2xl font-bold text-foreground">
                    ${totalWithShipping.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Payment security notice */}
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-blue-800">Pago seguro con Wompi</span>
                  <p className="text-xs text-blue-600 mt-1">
                    Seras redirigido al checkout seguro para completar tu pago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Forms */}
          <div className="w-full lg:w-7/12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Error */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Progress indicator */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isIdentificationComplete
                    ? "bg-green-500 text-white"
                    : activeSection === 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}>
                    {isIdentificationComplete ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <span className={`text-sm font-medium ${activeSection === 1 ? "text-foreground" : "text-muted-foreground"}`}>
                    Identificacion
                  </span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isShippingComplete
                    ? "bg-green-500 text-white"
                    : activeSection === 2
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                    }`}>
                    {isShippingComplete ? <Check className="h-4 w-4" /> : "2"}
                  </div>
                  <span className={`text-sm font-medium ${activeSection === 2 ? "text-foreground" : "text-muted-foreground"}`}>
                    Envio
                  </span>
                </div>
              </div>

              {/* SECTION 1: Identificacion */}
              <div
                className={`bg-card border rounded-2xl p-6 transition-all ${activeSection === 1 ? "border-primary shadow-sm" : "border-border"
                  }`}
              >
                <div
                  className="flex items-center gap-3 mb-5 cursor-pointer"
                  onClick={() => setActiveSection(1)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIdentificationComplete ? "bg-green-100" : "bg-primary/10"
                    }`}>
                    <User className={`h-5 w-5 ${isIdentificationComplete ? "text-green-600" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">Identificacion</h3>
                    <p className="text-sm text-muted-foreground">Tus datos personales para la compra</p>
                  </div>
                  {isIdentificationComplete && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-4 ${activeSection !== 1 && isIdentificationComplete ? "opacity-60" : ""}`}>
                  {/* Email */}
                  <div>
                    <label htmlFor="ck-email" className={labelClass}>Correo electronico *</label>
                    <input
                      id="ck-email"
                      type="email"
                      required
                      value={identificationForm.email}
                      onChange={(e) => updateIdentification("email", e.target.value)}
                      className={inputClass}
                      placeholder="tu@correo.com"
                      readOnly={!!user}
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="ck-name" className={labelClass}>Nombre completo *</label>
                    <input
                      id="ck-name"
                      type="text"
                      required
                      value={identificationForm.name}
                      onChange={(e) => updateIdentification("name", e.target.value)}
                      className={inputClass}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Document Number */}
                  <div>
                    <label htmlFor="ck-document" className={labelClass}>Numero de documento *</label>
                    <input
                      id="ck-document"
                      type="text"
                      required
                      value={identificationForm.documentNumber}
                      onChange={(e) => updateIdentification("documentNumber", e.target.value.replace(/\D/g, ""))}
                      className={inputClass}
                      placeholder="Cedula o NIT, Pasaporte, ETC"
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Minimo 6 digitos</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Envio */}
              <div
                className={`bg-card border rounded-2xl p-6 transition-all ${activeSection === 2 ? "border-primary shadow-sm" : "border-border"
                  } ${!isIdentificationComplete ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div
                  className="flex items-center gap-3 mb-5 cursor-pointer"
                  onClick={() => isIdentificationComplete && setActiveSection(2)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isShippingComplete ? "bg-green-100" : "bg-primary/10"
                    }`}>
                    <MapPin className={`h-5 w-5 ${isShippingComplete ? "text-green-600" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">Datos de envio</h3>
                    <p className="text-sm text-muted-foreground">Donde enviaremos tu pedido</p>
                  </div>
                  {isShippingComplete && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {isIdentificationComplete && (
                  <div className="flex flex-col gap-4">
                    {/* Phone */}
                    <div>
                      <label htmlFor="ck-phone" className={labelClass}>Telefono de contacto *</label>
                      <input
                        id="ck-phone"
                        type="tel"
                        required
                        value={shippingForm.phone}
                        onChange={(e) => updateShipping("phone", e.target.value)}
                        className={inputClass}
                        placeholder="3001234567"
                      />
                    </div>

                    {/* Receiver Name */}
                    <div>
                      <label htmlFor="ck-receiver" className={labelClass}>Nombre de quien recibe *</label>
                      <input
                        id="ck-receiver"
                        type="text"
                        required
                        value={shippingForm.receiverName}
                        onChange={(e) => updateShipping("receiverName", e.target.value)}
                        className={inputClass}
                        placeholder="Nombre de la persona que recibira el pedido"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="ck-address" className={labelClass}>Direccion *</label>
                      <input
                        id="ck-address"
                        type="text"
                        required
                        value={shippingForm.address}
                        onChange={(e) => updateShipping("address", e.target.value)}
                        className={inputClass}
                        placeholder="Calle 123 #4-5, Apto 201"
                      />
                    </div>

                    {/* City and Neighborhood */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ck-city" className={labelClass}>Ciudad *</label>
                        <CitySelect
                          id="ck-city"
                          required
                          value={shippingForm.city}
                          onChange={(val) => updateShipping("city", val)}
                          className={inputClass}
                          placeholder="Busca tu ciudad..."
                        />
                      </div>
                      <div>
                        <label htmlFor="ck-neighborhood" className={labelClass}>Barrio *</label>
                        <input
                          id="ck-neighborhood"
                          type="text"
                          required
                          value={shippingForm.neighborhood}
                          onChange={(e) => updateShipping("neighborhood", e.target.value)}
                          className={inputClass}
                          placeholder="Nombre del barrio"
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <label htmlFor="ck-additional" className={labelClass}>Informacion adicional</label>
                      <textarea
                        id="ck-additional"
                        value={shippingForm.additionalInfo}
                        onChange={(e) => updateShipping("additionalInfo", e.target.value)}
                        className={`${inputClass} resize-none`}
                        placeholder="Instrucciones especiales de entrega, referencias, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando tu pedido...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {canSubmit ? "Continuar al pago" : "Completa todos los datos"}
                  </>
                )}
              </button>

              {/* Trust badge */}
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3" />
                Tus datos estan protegidos y tu pago es 100% seguro
              </p>
            </form>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
