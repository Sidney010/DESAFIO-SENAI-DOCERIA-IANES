import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../constants/queryKeys'
import { usuarioService } from '../services/usuarioService'

export function useUsuarios() {
  return useQuery({
    queryKey: queryKeys.usuarios,
    queryFn:  usuarioService.listar,
    retry:    false,
  })
}

export function useAtualizarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      usuarioService.atualizar(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.usuarios }),
  })
}

export function useExcluirUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usuarioService.excluir,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.usuarios }),
  })
}