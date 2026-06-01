import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Usuario } from '../types'

interface AuthState {
  usuario: Usuario | null
  token: string | null
}

interface AuthContextType extends AuthState {
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAutenticado: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    // Inicializa do localStorage para sobreviver ao refresh da página
    const token   = localStorage.getItem('token')
    const usuario = localStorage.getItem('usuario')
    return {
      token,
      usuario: usuario ? JSON.parse(usuario) : null,
    }
  })

  // Sincroniza o localStorage sempre que o estado mudar
  useEffect(() => {
    if (auth.token && auth.usuario) {
      localStorage.setItem('token', auth.token)
      localStorage.setItem('usuario', JSON.stringify(auth.usuario))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }, [auth])

  const login = (token: string, usuario: Usuario) => {
    setAuth({ token, usuario })
  }

  const logout = () => {
    setAuth({ token: null, usuario: null })
  }

  return (
    <AuthContext.Provider value={{
      ...auth,
      login,
      logout,
      isAutenticado: !!auth.token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook customizado — evita importar useContext + AuthContext em todo lugar
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}