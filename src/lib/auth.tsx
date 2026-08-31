import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase"

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{
    error: string | null
    session: Session | null
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return

      if (error) {
        console.error("Failed to get session:", error)
      }

      setSession(data.session)
      setIsLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        setIsLoading(false)
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,

      signInWithEmail: async (
        email: string,
        password: string
      ) => {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        return {
          error: error?.message ?? null,
        }
      },

      signUpWithEmail: async (
        email: string,
        password: string
      ) => {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          })

        if (error) {
          console.error("Registration error:", error)

          return {
            error: error.message,
            session: null,
          }
        }

        if (data.session) {
          setSession(data.session)
        }

        return {
          error: null,
          session: data.session,
        }
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
          console.error("Sign out error:", error)
        }
      },
    }),
    [isLoading, session]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    )
  }

  return context
}
