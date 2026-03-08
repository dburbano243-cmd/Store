"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { supabase } from "@/lib/supabase"
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types"

const fetchOrders = async (): Promise<Order[]> => {
  // Fetch orders
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (ordersError) {
    console.error('Error fetching orders:', ordersError)
    throw ordersError
  }

  if (!ordersData || ordersData.length === 0) {
    return []
  }

  // Fetch all order items in one query
  const orderIds = ordersData.map(o => o.id)
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) {
    console.error('Error fetching order items:', itemsError)
  }

  // Group items by order_id
  const itemsByOrderId: Record<string, any[]> = {}
  if (itemsData) {
    for (const item of itemsData) {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = []
      }
      itemsByOrderId[item.order_id].push({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || '/placeholder.svg',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })
    }
  }

  const formattedOrders: Order[] = ordersData.map((order: any) => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    items: itemsByOrderId[order.id] || [],
    subtotal: order.subtotal,
    shipping_cost: order.shipping_cost,
    total: order.total,
    status: order.status as OrderStatus,
    payment_status: order.payment_status as PaymentStatus,
    payment_method: order.payment_method || '',
    payment_reference: order.payment_reference,
    shipping_address: { street: '', city: '' },
    created_at: order.created_at,
    updated_at: order.updated_at,
  }))

  return formattedOrders
}

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR('orders', fetchOrders, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return false
    }

    // Update local cache optimistically
    mutate(
      (currentOrders) =>
        currentOrders?.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ),
      false
    )
    return true
  }

  const getOrderById = (orderId: string): Order | undefined => {
    return data?.find((order) => order.id === orderId)
  }

  return {
    orders: data || [],
    loading: isLoading,
    error,
    mutate,
    updateOrderStatus,
    getOrderById,
  }
}

// Hook for fetching orders by user email (for customer panel)
const fetchUserOrders = async (email: string): Promise<Order[]> => {
  if (!email) return []

  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false })

  if (ordersError) {
    console.error('Error fetching user orders:', ordersError)
    throw ordersError
  }

  if (!ordersData || ordersData.length === 0) {
    return []
  }

  const orderIds = ordersData.map(o => o.id)
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) {
    console.error('Error fetching order items:', itemsError)
  }

  const itemsByOrderId: Record<string, any[]> = {}
  if (itemsData) {
    for (const item of itemsData) {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = []
      }
      itemsByOrderId[item.order_id].push({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || '/placeholder.svg',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })
    }
  }

  return ordersData.map((order: any) => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    items: itemsByOrderId[order.id] || [],
    subtotal: order.subtotal,
    shipping_cost: order.shipping_cost,
    total: order.total,
    status: order.status as OrderStatus,
    payment_status: order.payment_status as PaymentStatus,
    payment_method: order.payment_method || '',
    payment_reference: order.payment_reference,
    shipping_address: { street: '', city: '' },
    created_at: order.created_at,
    updated_at: order.updated_at,
  }))
}

export function useUserOrders(email: string | undefined) {
  const { data, error, isLoading } = useSWR(
    email ? `user-orders-${email}` : null,
    () => fetchUserOrders(email!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  )

  return {
    orders: data || [],
    loading: isLoading,
    error,
  }
}
