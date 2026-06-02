import api from '../../../config/api'
import type { ApiResponse, NotificacaoItem, NotificacaoContagem } from '../../../types'

export const notificacaoService = {
  listar: async () => {
    const { data } = await api.get<ApiResponse<{ notificacoes: NotificacaoItem[] }>>('/notificacao')
    return data.response.notificacoes
  },

  contagem: async () => {
    const { data } = await api.get<ApiResponse<NotificacaoContagem>>('/notificacao/contagem')
    return data.response
  },

  validade: async () => {
    const { data } = await api.get<ApiResponse<{ notificacoes: NotificacaoItem[] }>>('/notificacao/validade')
    return data.response.notificacoes
  },

  estoqueBaixo: async () => {
    const { data } = await api.get<ApiResponse<{ notificacoes: NotificacaoItem[] }>>('/notificacao/estoque-baixo')
    return data.response.notificacoes
  },
}