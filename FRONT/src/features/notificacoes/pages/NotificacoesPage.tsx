import { useState } from 'react'
import { AlertTriangle, XCircle, TrendingDown, Bell } from 'lucide-react'
import {
  useNotificacoes,
  useNotificacaoValidade,
  useNotificacaoEstoqueBaixo,
} from '../hooks/useNotificacoes'
import { formatarData } from '../../../utils/dateFormatter'
import type { NotificacaoItem } from '../../../types'

type Aba = 'todas' | 'validade' | 'estoque'

function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const map: Record<string, string> = {
    ALTA:  'bg-red-100 text-red-700',
    MEDIA: 'bg-yellow-100 text-yellow-700',
    BAIXA: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[prioridade] ?? 'bg-gray-100 text-gray-600'}`}>
      {prioridade}
    </span>
  )
}

function NotificacaoRow({ item }: { item: NotificacaoItem }) {
  const isVencido      = item.status_validade === 'Vencido'
  const isEstoqueBaixo = item.tipo_notificacao === 'estoque_baixo'

  const Icone  = isVencido ? XCircle : isEstoqueBaixo ? TrendingDown : AlertTriangle
  const corIcon = isVencido
    ? 'text-red-500 bg-red-50'
    : isEstoqueBaixo
    ? 'text-orange-500 bg-orange-50'
    : 'text-yellow-500 bg-yellow-50'

  return (
    <div className="flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${corIcon}`}>
        <Icone size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900">{item.nome_produto}</p>
          <PrioridadeBadge prioridade={item.prioridade} />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{item.nome_categoria} · #{item.codigo_identificador}</p>
        <p className="text-xs text-gray-600 mt-1">
          {isEstoqueBaixo
            ? `Quantidade atual: ${item.quantidade_atual} — Mínimo: ${item.limite_minimo_alerta}`
            : item.dias_para_vencer !== null && item.dias_para_vencer !== undefined
            ? item.dias_para_vencer <= 0
              ? `Vencido em ${formatarData(item.data_vencimento ?? '')}`
              : `Vence em ${item.dias_para_vencer} dia(s) — ${formatarData(item.data_vencimento ?? '')}`
            : item.status_validade
          }
        </p>
      </div>
    </div>
  )
}

export function NotificacoesPage() {
  const [aba, setAba] = useState<Aba>('todas')

  const { data: todas       = [], isLoading: loadTodas  } = useNotificacoes()
  const { data: validade    = [], isLoading: loadVal     } = useNotificacaoValidade()
  const { data: estoqueBaixo= [], isLoading: loadEstoque } = useNotificacaoEstoqueBaixo()

  const dadosAba   = aba === 'todas' ? todas : aba === 'validade' ? validade : estoqueBaixo
  const isLoading  = aba === 'todas' ? loadTodas : aba === 'validade' ? loadVal : loadEstoque

  const tabClass = (t: Aba) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      aba === t ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`

  // Contadores por prioridade
  const altas  = todas.filter(n => n.prioridade === 'ALTA').length
  const medias = todas.filter(n => n.prioridade === 'MEDIA').length

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Alertas de validade e estoque em tempo real</p>
      </div>

      {/* Banners de alta prioridade */}
      {altas > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <XCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {altas} produto{altas > 1 ? 's' : ''} com alerta de alta prioridade — requer atenção imediata.
          </p>
        </div>
      )}
      {medias > 0 && altas === 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700 font-medium">
            {medias} produto{medias > 1 ? 's' : ''} próximo{medias > 1 ? 's' : ''} do vencimento.
          </p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-2 flex-wrap">
        <button className={tabClass('todas')} onClick={() => setAba('todas')}>
          Todas ({todas.length})
        </button>
        <button className={tabClass('validade')} onClick={() => setAba('validade')}>
          <AlertTriangle size={13} className="inline mr-1" />
          Validade ({validade.length})
        </button>
        <button className={tabClass('estoque')} onClick={() => setAba('estoque')}>
          <TrendingDown size={13} className="inline mr-1" />
          Estoque baixo ({estoqueBaixo.length})
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando notificações...</div>
        ) : dadosAba.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Bell size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma notificação nesta categoria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dadosAba.map((item, i) => (
              <NotificacaoRow key={i} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}