export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  userInfo: UserInfo | null
  tokenExpiresAt: string | null
}

export interface UserInfo {
  id: string
  email: string
  isActive: boolean
  createdAt: string
}
