import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../domain/entities/User'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  
  // Computed
  isAdmin: () => boolean
  isPremium: () => boolean
}

/**
 * Global Auth Store
 * Manages user authentication state
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false, // Changed to false - will be set to true when checking auth
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      isAdmin: () => get().user?.isAdmin ?? false,
      
      isPremium: () => get().user?.isPremium ?? false,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      // Reconstruct User entity when hydrating from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          // Check if tokens exist in localStorage (with @radio-app: prefix)
          const hasTokens = typeof window !== 'undefined' && 
            localStorage.getItem('@radio-app:access_token') && 
            localStorage.getItem('@radio-app:refresh_token')
          
          if (!hasTokens) {
            // No tokens found - clear user
            state.user = null
            state.isAuthenticated = false
            return
          }
          
          // Reconstruct User entity with methods
          const userData = state.user as any
          state.user = new User(
            userData.id,
            userData.email,
            userData.name,
            userData.role,
            userData.avatarUrl,
            userData.favoriteStationIds || []
          )
        }
      },
    }
  )
)
