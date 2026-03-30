"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { DollarSign, ShoppingCart, Package, TrendingUp, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  totalSalesToday: number
  totalSalesMonth: number
  ordersToday: number
  ordersMonth: number
  totalProducts: number
  lowStockProducts: number
  totalCustomers: number
}

interface OrdersByDay {
  date: string
  count: number
}

function OrdersHeatmap({ data }: { data: OrdersByDay[] }) {
  // Generate last 365 days
  const today = new Date()
  const days: { date: string; count: number }[] = []
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const found = data.find(o => o.date === dateStr)
    days.push({ date: dateStr, count: found?.count || 0 })
  }

  // Find max for intensity calculation
  const maxCount = Math.max(...days.map(d => d.count), 1)

  // Get color intensity based on count
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/30"
    const intensity = count / maxCount
    if (intensity < 0.25) return "bg-emerald-900/50"
    if (intensity < 0.5) return "bg-emerald-700/70"
    if (intensity < 0.75) return "bg-emerald-500"
    return "bg-emerald-400"
  }

  // Group by weeks (7 days per row)
  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-card-foreground">Actividad de Ordenes</h2>
          <p className="text-xs text-muted-foreground">Ultimos 365 dias</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-muted/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900/50" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700/70" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
          </div>
          <span>Mas</span>
        </div>
      </div>
      
      {/* Month labels */}
      <div className="flex gap-0.5 mb-1 ml-6">
        {months.map((m, i) => (
          <span key={i} className="text-[10px] text-muted-foreground w-[52px] text-center">{m}</span>
        ))}
      </div>
      
      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground justify-around pr-1">
          <span>Lun</span>
          <span>Mie</span>
          <span>Vie</span>
        </div>
        
        {/* Grid */}
        <div className="flex gap-0.5 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-2.5 h-2.5 rounded-sm ${getColor(day.count)} transition-colors`}
                  title={`${day.date}: ${day.count} ordenes`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSalesToday: 0,
    totalSalesMonth: 0,
    ordersToday: 0,
    ordersMonth: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
  })
  const [ordersByDay, setOrdersByDay] = useState<OrdersByDay[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString()

      // Fetch orders for today
      const { data: ordersToday } = await supabase
        .from("orders")
        .select("id, total")
        .gte("created_at", startOfToday)
        .eq("payment_status", "paid")

      // Fetch orders for this month
      const { data: ordersMonth } = await supabase
        .from("orders")
        .select("id, total")
        .gte("created_at", startOfMonth)
        .eq("payment_status", "paid")

      // Fetch total products
      const { count: totalProducts } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })

      // Fetch low stock products
      const { count: lowStockProducts } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .lt("stock", 10)

      // Fetch total customers
      const { count: totalCustomers } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true })

      // Fetch orders by day for heatmap (last year)
      const { data: ordersByDayData } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", oneYearAgo)

      // Group orders by date
      const orderCounts: Record<string, number> = {}
      ordersByDayData?.forEach(order => {
        const date = order.created_at.slice(0, 10)
        orderCounts[date] = (orderCounts[date] || 0) + 1
      })
      const ordersByDayArray = Object.entries(orderCounts).map(([date, count]) => ({ date, count }))

      // Fetch recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        totalSalesToday: ordersToday?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        totalSalesMonth: ordersMonth?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        ordersToday: ordersToday?.length || 0,
        ordersMonth: ordersMonth?.length || 0,
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        totalCustomers: totalCustomers || 0,
      })
      setOrdersByDay(ordersByDayArray)
      setRecentOrders(recent || [])
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    { 
      label: "Ventas Hoy", 
      value: formatCurrency(stats.totalSalesToday), 
      icon: DollarSign,
      subtitle: `${stats.ordersToday} ordenes`
    },
    { 
      label: "Ventas del Mes", 
      value: formatCurrency(stats.totalSalesMonth), 
      icon: TrendingUp,
      subtitle: `${stats.ordersMonth} ordenes`
    },
    { 
      label: "Productos", 
      value: stats.totalProducts.toString(), 
      icon: Package,
      subtitle: `${stats.lowStockProducts} con stock bajo`
    },
    { 
      label: "Clientes", 
      value: stats.totalCustomers.toString(), 
      icon: Users,
      subtitle: "registrados"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500"
      case "processing": return "bg-blue-500/10 text-blue-500"
      case "pending": return "bg-yellow-500/10 text-yellow-500"
      case "cancelled": return "bg-red-500/10 text-red-500"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "Hace menos de 1 hora"
    if (hours < 24) return `Hace ${hours} horas`
    const days = Math.floor(hours / 24)
    return `Hace ${days} dias`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general de tu tienda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Heatmap */}
      <OrdersHeatmap data={ordersByDay} />

      {/* Recent Orders */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-card-foreground mb-4">
          Ordenes Recientes
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay ordenes recientes.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer_name} - {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
