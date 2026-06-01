// Chaves centralizadas do React Query
// Evita strings mágicas espalhadas e garante que o cache seja invalidado corretamente
export const queryKeys = {
  usuarios:      ['usuarios']              as const,
  usuario:       (id: number) => ['usuarios', id]          as const,

  categorias:    ['categorias']            as const,
  categoria:     (id: number) => ['categorias', id]        as const,

  produtos:      ['produtos']              as const,
  produto:       (id: number) => ['produtos', id]          as const,
  produtoFiltro: (params: object) => ['produtos', 'filtro', params] as const,

  lotes:         ['lotes']                 as const,
  lote:          (id: number) => ['lotes', id]             as const,
  loteFiltro:    (params: object) => ['lotes', 'filtro', params]    as const,

  movimentacoes:      ['movimentacoes']         as const,
  movimentacoesLote:  (idLote: number) => ['movimentacoes', 'lote', idLote] as const,

  dashboard:          ['dashboard']             as const,

  notificacoes:       ['notificacoes']          as const,
  notificacaoContagem:['notificacoes', 'contagem']         as const,
  notificacaoValidade:['notificacoes', 'validade']         as const,
  notificacaoEstoque: ['notificacoes', 'estoque-baixo']    as const,
}