import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../constants/queryKeys'
import { produtoService, categoriaService } from '../services/produtoService'

// ── Produtos ──────────────────────────────────────────────────────────────────
export function useProdutos() {
  return useQuery({
    queryKey: queryKeys.produtos,
    queryFn: produtoService.listar,
  })
}

export function useCriarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: produtoService.criar,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.produtos }),
  })
}

export function useAtualizarProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      produtoService.atualizar(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.produtos }),
  })
}

export function useExcluirProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: produtoService.excluir,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.produtos }),
  })
}

// ── Categorias ────────────────────────────────────────────────────────────────
export function useCategorias() {
  return useQuery({
    queryKey: queryKeys.categorias,
    queryFn: categoriaService.listar,
  })
}

export function useCriarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriaService.criar,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categorias }),
  })
}

export function useAtualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nome }: { id: number; nome: string }) =>
      categoriaService.atualizar(id, nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categorias }),
  })
}

export function useExcluirCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriaService.excluir,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categorias }),
  })
}