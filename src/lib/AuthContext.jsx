import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { getProfile } from './auth'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profileState, setProfileState] = useState({
    owner: null,
    data: null,
    loading: false,
    error: '',
  })
  const [sessionLoading, setSessionLoading] = useState(Boolean(supabase))
  useEffect(() => {
    if (!supabase) return
    let active = true
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setSessionLoading(false)
      }
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])
  useEffect(() => {
    if (!user) {
      setProfileState({ owner: null, data: null, loading: false, error: '' })
      return
    }
    let active = true
    setProfileState({ owner: user.id, data: null, loading: true, error: '' })
    getProfile(user.id)
      .then((data) => {
        if (active)
          setProfileState({
            owner: user.id,
            data,
            loading: false,
            error: data ? '' : 'Your account profile has not been created yet.',
          })
      })
      .catch((error) => {
        if (active)
          setProfileState({
            owner: user.id,
            data: null,
            loading: false,
            error: error.message || 'Your profile is unavailable.',
          })
      })
    return () => {
      active = false
    }
  }, [user?.id])
  const profile =
    user && profileState.owner === user.id ? profileState.data : null
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading:
          sessionLoading ||
          Boolean(
            user && (profileState.owner !== user.id || profileState.loading),
          ),
        profileError: profileState.error,
        isAdmin: profile?.role === 'admin',
        refreshProfile: async () => {
          if (user) {
            const data = await getProfile(user.id)
            setProfileState({
              owner: user.id,
              data,
              loading: false,
              error: data
                ? ''
                : 'Your account profile has not been created yet.',
            })
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  return useContext(AuthContext)
}
