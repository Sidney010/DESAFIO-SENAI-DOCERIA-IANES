import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../constants/queryKeys'
import { loteService, movimentacaoService } from '../services/estoqueService'

// ── Lotes ─────────────────────────────────────────────────────────────────────
export function useLotes() {
  return useQuery({
    queryKey: queryKeys.lotes,
    queryFn:  loteService.listar,
  })
}

export function useCriarLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: loteService.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.lotes })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// ── Movimentações ─────────────────────────────────────────────────────────────
export function useMovimentacoesPorLote(idLote: number | null) {
  return useQuery({
    queryKey: queryKeys.movimentacoesLote(idLote!),
    queryFn:  () => movimentacaoService.listarPorLote(idLote!),
    enabled:  !!idLote,
  })
}

export function useRegistrarEntrada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: movimentacaoService.registrarEntrada,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.lotes })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useRegistrarSaida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: movimentacaoService.registrarSaida,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.lotes })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}