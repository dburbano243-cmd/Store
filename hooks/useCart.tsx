"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, CartItem } from "@/lib/types"

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number, price?: number, selectedMediaIndex?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  getTotalItems: () => number
  getTotalPrice: () => number
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Product, quantity?: number, price?: number, selectedMediaIndex?: number) => {
    const qty = Number(quantity) || 1
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      const itemPrice = price !== undefined ? price : product.price

      if (existingItem) {
        const newQty = Number(existingItem.quantity) + qty
        // Recalculate unit price based on discounts and metadata
        const basePrice = (existingItem as any).base_price ?? (existingItem as any).price ?? product.price
        const newUnitPrice = computeUnitPriceFromProduct(existingItem as any, basePrice, newQty)
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQty, price: newUnitPrice }
            : item,
        )
      } else {
        return [
          ...prevItems,
          // Store base_price so we can always recompute discounts from the original product price
          { ...(product as any), quantity: qty, price: itemPrice, base_price: product.price, selected_media_index: selectedMediaIndex ?? 0 },
        ]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== productId) return item
        const basePrice = (item as any).base_price ?? (item as any).price ?? 0
        const newUnitPrice = computeUnitPriceFromProduct(item as any, basePrice, qty)
        return { ...item, quantity: qty, price: newUnitPrice }
      }),
    )
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0)
  }

  const clearCart = () => {
    setCartItems([])
  }

  // Helper: given a product-like object, its base unit price and a desired quantity,
  // compute the per-unit price applying discounts from `discounts` metadata.
  function computeUnitPriceFromProduct(prod: any, basePrice: number, q: number) {
    const discounts = prod.discounts ?? []
    const candidates: number[] = []
    for (const d of discounts) {
      if (!d || !d.is_active) continue
      if (d.currency_code !== "COP") continue
      const units = d.metadata?.units ? Number(d.metadata.units) : null
      const amount = Number(d.discount_amount ?? 0)
      if (!units || !amount) continue
      if (units === q) {
        candidates.push(amount * q)
      } else if (units === 3 && q >= 3) {
        candidates.push(amount * q)
      }
    }
    const discountTotal = candidates.length > 0 ? Math.max(...candidates) : 0
    const originalTotal = basePrice * q
    const finalTotal = Math.max(0, originalTotal - discountTotal)
    const perUnit = finalTotal / q
    return perUnit
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
