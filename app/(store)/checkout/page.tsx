"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingBag, CreditCard, Eye, EyeOff, Loader2, ArrowLeft, Lock, Minus, Plus, Trash2, Truck } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Mode: register or login
  const [mode, setMode] = useState<"register" | "login">("register")

  // Section 1: Account / Datos del pedido
  const [accountForm, setAccountForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  })

  // Section 2: Payment / Datos de pago y envio
  const [paymentForm, setPaymentForm] = useState({
    phone: "",
    city: "",
    address: "",
  })

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
          setAccountForm({
            email: data.email || profile.email || "",
            name: data.name || profile.name || "",
            password: "",
            confirmPassword: "",
          })
          setPaymentForm({
            phone: data.phone || "",
            city: data.city || "",
            address: data.address || "",
          })
        }
      }
      prefill()
    }
  }, [user, profile])

  const updateAccount = (field: string, value: string) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }))
  }

  const updatePayment = (field: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }))
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
    if (isSubmitting) return
    setError("")
    setIsSubmitting(true)

    try {
      let customerId = user?.id ?? null

      // If user is not logged in, handle registration or login
      if (!user) {
        if (mode === "register") {
          // Validate passwords
          if (accountForm.password !== accountForm.confirmPassword) {
            setError("Las contrasenas no coinciden")
            setIsSubmitting(false)
            return
          }
          if (accountForm.password.length < 6) {
            setError("La contrasena debe tener al menos 6 caracteres")
            setIsSubmitting(false)
            return
          }

          // 1. Register via Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: accountForm.email,
            password: accountForm.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: { name: accountForm.name },
            },
          })

          if (authError) {
            if (authError.message.includes("rate") || authError.status === 429) {
              setError("Demasiados intentos. Por favor espera unos minutos e intenta de nuevo.")
            } else {
              setError(authError.message)
            }
            setIsSubmitting(false)
            return
          }

          if (!authData.user) {
            setError("No se pudo crear el usuario")
            setIsSubmitting(false)
            return
          }

          customerId = authData.user.id

          // 2. Upsert profile via server API
          const profileRes = await fetch("/api/register-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: authData.user.id,
              name: accountForm.name,
              email: accountForm.email,
              address: paymentForm.address || null,
              city: paymentForm.city || null,
              phone: paymentForm.phone || null,
            }),
          })

          if (!profileRes.ok) {
            const profileData = await profileRes.json()
            setError(`Error guardando perfil: ${profileData.error || "Error desconocido"}`)
            setIsSubmitting(false)
            return
          }

          // 3. Auto-login after registration
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: accountForm.email,
            password: accountForm.password,
          })

          if (loginError) {
            // If auto-login fails, show message but continue with order
            toast({
              title: "Cuenta creada",
              description: "Tu cuenta fue creada. Revisa tu correo para confirmarla.",
            })
          }
        } else {
          // Login mode
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: accountForm.email,
            password: accountForm.password,
          })

          if (loginError) {
            setError("Correo o contrasena incorrectos")
            setIsSubmitting(false)
            return
          }

          customerId = loginData.user?.id ?? null
        }
      }

      // Now create the order (same logic as old CheckoutModal)
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
            name: accountForm.name,
            email: accountForm.email,
            phone: paymentForm.phone,
            address: paymentForm.address,
            city: paymentForm.city,
          },
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
    "w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
  const labelClass = "block text-sm font-medium text-foreground mb-1.5"

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
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-lime-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-lime-700" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Resumen de tu pedido</h2>
              </div>

              <div className="flex flex-col gap-4">
                {cartItems.map((item) => {
                  const imgSrc = getItemImage(item)
                  const qty = Number(item.quantity || 1)
                  const basePrice = (item as any).base_price ?? item.price
                  const hasDiscount = basePrice > item.price
                  const lineTotal = item.price * qty
                  const originalLineTotal = basePrice * qty
                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                        {/* Price per unit */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {hasDiscount && (
                            <span className="text-xs line-through text-muted-foreground">
                              ${basePrice.toLocaleString("es-CO")}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-foreground">
                            ${item.price.toLocaleString("es-CO")} c/u
                          </span>
                        </div>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            disabled={qty <= 1}
                            className="w-7 h-7 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="w-7 h-7 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {hasDiscount && (
                          <p className="text-xs line-through text-muted-foreground">
                            ${originalLineTotal.toLocaleString("es-CO")}
                          </p>
                        )}
                        <p className="text-sm font-bold text-foreground">
                          ${lineTotal.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-border mt-6 pt-4 flex flex-col gap-2">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-foreground">
                    ${subtotal.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Envio</span>
                  </div>
                  {shippingCost === 0 ? (
                    <span className="text-sm font-medium text-lime-600">Gratis</span>
                  ) : (
                    <span className="text-sm text-foreground">
                      ${shippingCost.toLocaleString("es-CO")}
                    </span>
                  )}
                </div>
                
                {/* Free shipping hint */}
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Agrega {FREE_SHIPPING_THRESHOLD - totalItems} producto{FREE_SHIPPING_THRESHOLD - totalItems > 1 ? 's' : ''} mas para envio gratis
                  </p>
                )}
                
                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-lime-600">
                    ${totalWithShipping.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Payment security notice */}
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2.5">
                <CreditCard className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-blue-800">Pago seguro con Wompi</span>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Seras redirigido al checkout seguro de Wompi para completar tu pago
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
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* SECTION 1: Account data */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {user ? "Datos de tu pedido" : mode === "register" ? "Datos de tu pedido" : "Inicia sesion para tu pedido"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    {user
                      ? "Verifica que tus datos sean correctos"
                      : mode === "register"
                        ? "Necesitamos algunos datos para procesar tu compra"
                        : "Ingresa con tu cuenta para continuar"}
                  </p>

                  {mode === "login" && !user ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label htmlFor="ck-email" className={labelClass}>Correo electronico *</label>
                        <input
                          id="ck-email"
                          type="email"
                          required
                          value={accountForm.email}
                          onChange={(e) => updateAccount("email", e.target.value)}
                          className={inputClass}
                          placeholder="tu@correo.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="ck-password" className={labelClass}>Contrasena *</label>
                        <div className="relative">
                          <input
                            id="ck-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={accountForm.password}
                            onChange={(e) => updateAccount("password", e.target.value)}
                            className={`${inputClass} pr-10`}
                            placeholder="Tu contrasena"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="ck-email" className={labelClass}>Correo electronico *</label>
                        <input
                          id="ck-email"
                          type="email"
                          required
                          value={accountForm.email}
                          onChange={(e) => updateAccount("email", e.target.value)}
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
                          value={accountForm.name}
                          onChange={(e) => updateAccount("name", e.target.value)}
                          className={inputClass}
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      {/* Password (only for new users) */}
                      {!user && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="ck-password" className={labelClass}>Contrasena *</label>
                            <div className="relative">
                              <input
                                id="ck-password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={accountForm.password}
                                onChange={(e) => updateAccount("password", e.target.value)}
                                className={`${inputClass} pr-10`}
                                placeholder="Min. 6 caracteres"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label htmlFor="ck-confirm-password" className={labelClass}>Confirmar contrasena *</label>
                            <input
                              id="ck-confirm-password"
                              type={showPassword ? "text" : "password"}
                              required
                              value={accountForm.confirmPassword}
                              onChange={(e) => updateAccount("confirmPassword", e.target.value)}
                              className={inputClass}
                              placeholder="Repite la contrasena"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle register/login (only if not logged in) */}
                  {!user && (
                    <p className="text-center text-sm text-muted-foreground mt-5">
                      {mode === "register" ? (
                        <>
                          {"Ya tienes cuenta? "}
                          <button
                            type="button"
                            onClick={() => { setMode("login"); setError("") }}
                            className="text-foreground font-medium hover:underline"
                          >
                            Inicia sesion
                          </button>
                        </>
                      ) : (
                        <>
                          {"No tienes cuenta? "}
                          <button
                            type="button"
                            onClick={() => { setMode("register"); setError("") }}
                            className="text-foreground font-medium hover:underline"
                          >
                            Completa tus datos
                          </button>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* SECTION 2: Payment data (shown in register mode or when logged in) */}
                {(mode === "register" || user) && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-base font-semibold text-foreground mb-1">Datos de pago y envio</h3>
                    <p className="text-sm text-muted-foreground mb-5">Informacion necesaria para procesar tu pago y envio</p>

                    <div className="flex flex-col gap-4">
                      {/* Address */}
                      <div>
                        <label htmlFor="ck-address" className={labelClass}>Direccion de entrega *</label>
                        <input
                          id="ck-address"
                          type="text"
                          required
                          value={paymentForm.address}
                          onChange={(e) => updatePayment("address", e.target.value)}
                          className={inputClass}
                          placeholder="Calle 123 #4-5, Apto 201"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="ck-phone" className={labelClass}>Telefono *</label>
                        <input
                          id="ck-phone"
                          type="tel"
                          required
                          value={paymentForm.phone}
                          onChange={(e) => updatePayment("phone", e.target.value)}
                          className={inputClass}
                          placeholder="3001234567"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label htmlFor="ck-city" className={labelClass}>Ciudad *</label>
                        <CitySelect
                          id="ck-city"
                          required
                          value={paymentForm.city}
                          onChange={(val) => updatePayment("city", val)}
                          className={inputClass}
                          placeholder="Busca tu ciudad..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-lime-500 text-white font-bold py-4 rounded-xl hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Procesando tu pedido...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Continuar con mi compra
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
