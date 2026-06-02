import api from '../../../config/api'
import type { ApiResponse, Usuario } from '../../../types'

interface AtualizarUsuarioPayload {
  nome?: string
  email?: string
  senha?: string
}

export const usuarioService = {
  listar: async () => {
    const { data } = await api.get<ApiResponse<{ usuarios: Usuario[] }>>('/usuario')
    return data.response.usuarios
  },

  atualizar: async (id: number, payload: AtualizarUsuarioPayload) => {
    const { data } = await api.put<ApiResponse<{ usuario: Usuario }>>(`/usuario/${id}`, payload)
    return data.response.usuario
  },

  excluir: async (id: number) => {
    await api.delete(`/usuario/${id}`)
  },
}