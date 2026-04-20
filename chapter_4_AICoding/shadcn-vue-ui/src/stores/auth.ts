import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const expiryTime = ref<number | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !isTokenExpired())
  const isTokenExpiringSoon = computed(() => {
    if (!expiryTime.value) return false
    const now = Date.now()
    const timeUntilExpiry = expiryTime.value - now
    return timeUntilExpiry > 0 && timeUntilExpiry < 30 * 60 * 1000 // 30 minutes
  })

  // Helper functions
  function isTokenExpired(): boolean {
    if (!expiryTime.value) return true
    return Date.now() > expiryTime.value
  }

  function saveToLocalStorage(): void {
    if (token.value) {
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_token_expiry', expiryTime.value?.toString() || '')
      localStorage.setItem('access_token', token.value) // For backward compatibility
    }
    if (user.value) {
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      localStorage.setItem('user', JSON.stringify(user.value)) // For backward compatibility
    }
  }

  function loadFromLocalStorage(): void {
    // Try new storage keys first, then fall back to old ones
    let savedToken = localStorage.getItem('auth_token')
    if (!savedToken) {
      savedToken = localStorage.getItem('access_token')
    }

    let savedExpiry = localStorage.getItem('auth_token_expiry')
    let savedUser = localStorage.getItem('auth_user')
    if (!savedUser) {
      savedUser = localStorage.getItem('user')
    }

    if (savedToken && savedExpiry) {
      token.value = savedToken
      expiryTime.value = parseInt(savedExpiry)
    }

    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        user.value = null
      }
    }
  }

  function clearAuth(): void {
    token.value = null
    user.value = null
    expiryTime.value = null
    error.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_token_expiry')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  // Actions
  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(username, password)
      
      if (response.success) {
        token.value = response.access_token
        expiryTime.value = Date.now() + response.expires_in * 1000
        user.value = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role
        }
        
        saveToLocalStorage()
        return true
      } else {
        error.value = 'Login failed'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(
    username: string,
    email: string,
    password: string
  ): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.register(username, email, password)
      
      if (response.success) {
        return true
      } else {
        error.value = 'Registration failed'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshToken(): Promise<boolean> {
    if (!token.value) return false

    try {
      const response = await authApi.refreshToken()
      
      if (response.success) {
        token.value = response.access_token
        expiryTime.value = Date.now() + response.expires_in * 1000
        saveToLocalStorage()
        return true
      }
      return false
    } catch {
      clearAuth()
      return false
    }
  }

  function logout(): void {
    clearAuth()
  }

  function checkTokenValidity(): boolean {
    if (isTokenExpired()) {
      clearAuth()
      return false
    }
    return true
  }

  return {
    // State
    token,
    user,
    expiryTime,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isTokenExpiringSoon,

    // Methods
    login,
    register,
    logout,
    refreshToken,
    checkTokenValidity,
    loadFromLocalStorage,
    isTokenExpired,
  }
})
