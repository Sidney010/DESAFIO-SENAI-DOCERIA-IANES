import api from '../../../config/api'
import type { ApiResponse, Produto, Categoria } from '../../../types'

interface ProdutoPayload {
  nome_produto: string
  id_categoria: number
  sabor_massa?: string
  recheio?: string
  cobertura?: string
  detalhes?: string
  limite_minimo_alerta: number
}

interface FiltroParams {
  nome?: string
  codigo?: number
  categoria?: number
}

export const produtoService = {
  listar: async () => {
    const { data } = await api.get<ApiResponse<{ produtos: Produto[] }>>('/produto')
    return data.response.produtos
  },

  buscarPorId: async (id: number) => {
    const { data } = await api.get<ApiResponse<{ produto: Produto }>>(`/produto/${id}`)
    return data.response.produto
  },

  filtrar: async (params: FiltroParams) => {
    const { data } = await api.get<ApiResponse<{ produtos: Produto[] }>>('/produto/filtro', { params })
    return data.response.produtos
  },

  criar: async (payload: ProdutoPayload) => {
    const { data } = await api.post<ApiResponse<{ produto: Produto }>>('/produto', payload)
    return data.response.produto
  },

  atualizar: async (id: number, payload: Partial<ProdutoPayload>) => {
    const { data } = await api.put<ApiResponse<{ produto: Produto }>>(`/produto/${id}`, payload)
    return data.response.produto
  },

  excluir: async (id: number) => {
    await api.delete(`/produto/${id}`)
  },
}

export const categoriaService = {
  listar: async () => {
    const { data } = await api.get<ApiResponse<{ categorias: Categoria[] }>>('/categoria')
    return data.response.categorias
  },

  criar: async (nome_categoria: string) => {
    const { data } = await api.post<ApiResponse<{ categoria: Categoria }>>('/categoria', { nome_categoria })
    return data.response.categoria
  },

  atualizar: async (id: number, nome_categoria: string) => {
    const { data } = await api.put<ApiResponse<{ categoria: Categoria }>>(`/categoria/${id}`, { nome_categoria })
    return data.response.categoria
  },

  excluir: async (id: number) => {
    await api.delete(`/categoria/${id}`)
  },
}