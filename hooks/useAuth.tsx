"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

const ADMIN_TYPE_USER_ID = "f8319287-2f81-410e-a4ed-9ffaf946d99b"
const CUSTOMER_TYPE_USER_ID = "67289587-b905-43fb-9d61-0030a566101e"

const PROFILE_STORAGE_KEY = "user_profile"
const PROFILE_TTL = 24 * 60 * 60 * 1000 // 24 horas

interface UserProfile {
  id: string
  name: string
  email: string
  type_user_id: string | null
}

interface StoredProfile {
  profile: UserProfile
  timestamp: number
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

// Obtener profile de localStorage
function getStoredProfile(userId: string): UserProfile | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`)
    if (!stored) return null
    
    const parsed: StoredProfile = JSON.parse(stored)
    const now = Date.now()
    
    // Verificar si no ha expirado
    if (now - parsed.timestamp < PROFILE_TTL) {
      return parsed.profile
    }
    
    // Expirado, eliminar
    localStorage.removeItem(`${PROFILE_STORAGE_KEY}_${userId}`)
    return null
  } catch {
    return null
  }
}

// Guardar profile en localStorage
function storeProfile(userId: string, profile: UserProfile): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored: StoredProfile = {
      profile,
      timestamp: Date.now(),
    }
    localStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(stored))
  } catch {
    // Ignorar errores de localStorage
  }
}

// Eliminar profile de localStorage
function clearStoredProfile(userId?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    if (userId) {
      localStorage.removeItem(`${PROFILE_STORAGE_KEY}_${userId}`)
    } else {
      // Limpiar todos los profiles
      const keys = Object.keys(localStorage).filter(k => k.startsWith(PROFILE_STORAGE_KEY))
      keys.forEach(k => localStorage.removeItem(k))
    }
  } catch {
    // Ignorar errores
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  const fetchProfileFromDB = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, type_user_id")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    
    const userProfile = data as UserProfile
    // Guardar en localStorage
    storeProfile(userId, userProfile)
    return userProfile
  }

  const getProfile = async (userId: string): Promise<UserProfile | null> => {
    // Primero intentar obtener de localStorage
    const storedProfile = getStoredProfile(userId)
    if (storedProfile) {
      return storedProfile
    }
    
    // Si no hay en localStorage, obtener de DB
    return fetchProfileFromDB(userId)
  }

  const refreshProfile = async () => {
    if (user) {
      clearStoredProfile(user.id)
      const userProfile = await fetchProfileFromDB(user.id)
      setProfile(userProfile)
    }
  }

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return
    initializedRef.current = true
    
    let isMounted = true

    // Initial session check only
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return
      
      if (session?.user) {
        setUser(session.user)
        const userProfile = await getProfile(session.user.id)
        if (isMounted) {
          setProfile(userProfile)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      // Only react to actual auth changes, not initial state
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await getProfile(session.user.id)
          if (isMounted) setProfile(userProfile)
        } else {
          setProfile(null)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    if (user) {
      clearStoredProfile(user.id)
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.type_user_id === ADMIN_TYPE_USER_ID

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
