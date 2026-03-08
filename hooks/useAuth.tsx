"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

const ADMIN_TYPE_USER_ID = "f8319287-2f81-410e-a4ed-9ffaf946d99b"
const CUSTOMER_TYPE_USER_ID = "67289587-b905-43fb-9d61-0030a566101e"

interface UserProfile {
  id: string
  name: string
  email: string
  type_user_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => { },
})

// Cache for profile data to avoid duplicate fetches
const profileCache: { [userId: string]: UserProfile | null } = {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  const fetchProfile = async (userId: string) => {
    // Return cached profile if available
    if (profileCache[userId]) {
      return profileCache[userId]
    }
    
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, type_user_id")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    
    // Cache the profile
    profileCache[userId] = data as UserProfile
    return data as UserProfile
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
        const userProfile = await fetchProfile(session.user.id)
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
          const userProfile = await fetchProfile(session.user.id)
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
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.type_user_id === ADMIN_TYPE_USER_ID

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
