import api from '../../../config/api'
import type { ApiResponse, Lote, Movimentacao } from '../../../types'

interface LotePayload {
  id_produto: number
  data_fabricacao: string
  data_vencimento: string
  tipo_medida: 'peso' | 'porcao'
  quantidade_peso?: number
  quantidade_porcoes: number
}

interface MovimentacaoPayload {
  id_lote: number
  quantidade: number
  motivo: string
}

interface FiltroLoteParams {
  nome_produto?:    string
  codigo?:          number
  id_categoria?:    number
  status_validade?: string
}

export const loteService = {
  listar: async () => {
    const { data } = await api.get<ApiResponse<{ lotes: Lote[] }>>('/lote')
    return data.response.lotes
  },

  filtrar: async (params: FiltroLoteParams) => {
    const { data } = await api.get<ApiResponse<{ lotes: Lote[] }>>('/lote/filtro', { params })
    return data.response.lotes
  },

  criar: async (payload: LotePayload) => {
    const { data } = await api.post<ApiResponse<{ lote: Lote }>>('/lote', payload)
    return data.response.lote
  },
}

export const movimentacaoService = {
  listarPorLote: async (idLote: number) => {
    const { data } = await api.get<ApiResponse<{ movimentacoes: Movimentacao[] }>>(
      `/movimentacao/lote/${idLote}`
    )
    return data.response.movimentacoes
  },

  registrarEntrada: async (payload: MovimentacaoPayload) => {
    const { data } = await api.post<ApiResponse<{ movimentacao: Movimentacao }>>(
      '/movimentacao/entrada', payload
    )
    return data.response.movimentacao
  },

  registrarSaida: async (payload: MovimentacaoPayload) => {
    const { data } = await api.post<ApiResponse<{ movimentacao: Movimentacao }>>(
      '/movimentacao/saida', payload
    )
    return data.response.movimentacao
  },
}