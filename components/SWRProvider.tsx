"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

interface SWRProviderProps {
  children: ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // El cache real está en localStorage via fetchProducts y useAuth
        // SWR solo maneja la deduplicacion de llamadas
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        refreshInterval: 0,
        dedupingInterval: 60000, // 1 minuto de deduplicacion entre llamadas identicas
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  )
}
