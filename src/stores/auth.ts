import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginPayload, RegisterPayload, Role, User } from '@/types/api'

const TOKEN_KEY = 'labvault-token'
const USER_KEY = 'labvault-user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(
    localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null,
  )

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const role = computed(() => user.value?.role)
  const isStaff = computed(() => role.value === 'ADMIN' || role.value === 'PETUGAS')
  const isPeminjam = computed(() => role.value === 'PEMINJAM')

  function persist(authToken: string, authUser: User) {
    token.value = authToken
    user.value = authUser
    localStorage.setItem(TOKEN_KEY, authToken)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(payload: LoginPayload) {
    const data = await authApi.login(payload)
    persist(data.token, data.user)
    return data
  }

  async function register(payload: RegisterPayload) {
    const registered = await authApi.register({
      ...payload,
      role: (payload.role ?? 'PEMINJAM') as Role,
    })
    return registered
  }

  function logout() {
    clear()
  }

  function hasRole(...roles: Role[]) {
    return user.value ? roles.includes(user.value.role) : false
  }

  return {
    token,
    user,
    isAuthenticated,
    role,
    isStaff,
    isPeminjam,
    login,
    register,
    logout,
    hasRole,
  }
})
