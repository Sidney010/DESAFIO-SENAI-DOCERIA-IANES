// ─── Respostas padrão da API ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  status: string
  status_code: number
  message: string
  response: T
}

// ─── Usuário ──────────────────────────────────────────────────────────────────
export interface Usuario {
  id_usuario: number
  nome: string
  email: string
  is_active: boolean
}

// ─── Categoria ────────────────────────────────────────────────────────────────
export interface Categoria {
  id_categoria: number
  nome_categoria: string
}

// ─── Produto ──────────────────────────────────────────────────────────────────
export interface Produto {
  id_produto: number
  nome_produto: string
  codigo_identificador: number
  sabor_massa?: string | null
  recheio?: string | null
  cobertura?: string | null
  detalhes?: string | null
  limite_minimo_alerta: number
  id_categoria: number
  nome_categoria: string
}

// ─── Lote ─────────────────────────────────────────────────────────────────────
export type TipoMedida = 'peso' | 'porcao'
export type StatusValidade = 'No prazo' | 'Alerta' | 'Vencido'

export interface Lote {
  id_lote: number
  data_fabricacao: string
  data_vencimento: string
  tipo_medida: TipoMedida
  quantidade_peso: number | null
  quantidade_porcoes: number
  status_validade: StatusValidade
  id_produto: number
  nome_produto: string
  nome_categoria: string
}

// ─── Movimentação ─────────────────────────────────────────────────────────────
export type TipoMovimentacao = 'Entrada' | 'Saída'

export interface Movimentacao {
  id_movimentacao: number
  tipo_movimentacao: TipoMovimentacao
  motivo: string
  quantidade: number
  data_hora: string
  id_lote: number
  data_vencimento: string
  status_validade: StatusValidade
  id_produto: number
  nome_produto: string
  id_usuario: number
  nome_usuario: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardItem {
  id_produto: number
  nome_produto: string
  codigo_identificador: number
  nome_categoria: string
  limite_minimo_alerta: number
  quantidade_total: number
  status_critico: StatusValidade
  estoque_baixo: boolean
  total_lotes: number
}

// ─── Notificação ──────────────────────────────────────────────────────────────
export type TipoNotificacao = 'validade' | 'estoque_baixo'
export type PrioridadeNotificacao = 'ALTA' | 'MEDIA' | 'BAIXA'

export interface NotificacaoItem {
  tipo_notificacao: TipoNotificacao
  prioridade: PrioridadeNotificacao
  status_validade: string
  id_produto: number
  nome_produto: string
  codigo_identificador: number
  nome_categoria: string
  id_lote?: number | null
  data_vencimento?: string | null
  dias_para_vencer?: number | null
  quantidade_atual: number
  tipo_medida?: string | null
  limite_minimo_alerta?: number | null
}

export interface NotificacaoContagem {
  alta: number
  media: number
  baixa: number
  total: number
}