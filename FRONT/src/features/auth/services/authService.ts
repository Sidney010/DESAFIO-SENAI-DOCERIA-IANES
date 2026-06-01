import api from '../../../config/api'
import type { ApiResponse, Usuario } from '../../../types'

interface LoginPayload {
  email: string
  senha: string
}

interface LoginResponse {
  usuario: Usuario
  token: string
}

interface CadastroPayload {
  nome: string
  email: string
  senha: string
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/usuario/login', payload)
    return data.response
  },

  cadastrar: async (payload: CadastroPayload) => {
    const { data } = await api.post<ApiResponse<{ usuario: Usuario }>>('/usuario', payload)
    return data.response
  },

  recuperarSenha: async (email: string) => {
    const { data } = await api.post<ApiResponse<null>>('/usuario/recuperar-senha', { email })
    return data
  },

  redefinirSenha: async (payload: { email: string; codigo: string; nova_senha: string }) => {
    const { data } = await api.post<ApiResponse<null>>('/usuario/redefinir-senha', payload)
    return data
  },
}