import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../constants/queryKeys'
import { notificacaoService } from '../services/notificacaoService'

// Polling a cada 30s — atende RNF-003 (< 2s de resposta, atualização contínua)
const POLLING_INTERVAL = 30_000

export function useNotificacoes() {
  return useQuery({
    queryKey: queryKeys.notificacoes,
    queryFn:  notificacaoService.listar,
    refetchInterval: POLLING_INTERVAL,
    retry: false,
  })
}

// useNotificacoes.ts — desativa polling se backend não tiver pronto
export function useNotificacaoContagem() {
  return useQuery({
    queryKey: queryKeys.notificacaoContagem,
    queryFn:  notificacaoService.contagem,
    refetchInterval: POLLING_INTERVAL,
    retry: false, // Não fica tentando se der 404
  })
}

export function useNotificacaoValidade() {
  return useQuery({
    queryKey: queryKeys.notificacaoValidade,
    queryFn:  notificacaoService.validade,
    refetchInterval: POLLING_INTERVAL,
  })
}

export function useNotificacaoEstoqueBaixo() {
  return useQuery({
    queryKey: queryKeys.notificacaoEstoque,
    queryFn:  notificacaoService.estoqueBaixo,
    refetchInterval: POLLING_INTERVAL,
  })
}