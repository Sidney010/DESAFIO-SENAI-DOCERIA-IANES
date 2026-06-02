import { useState } from 'react'
import { Plus, ArrowDownCircle, ArrowUpCircle, Search, Filter } from 'lucide-react'
import { useLotes } from '../hooks/useEstoque'
import { LoteModal }         from '../components/LoteModal'
import { MovimentacaoModal } from '../components/MovimentacaoModal'
import { getStatusValidade, formatarData } from '../../../utils/dateFormatter'
import type { Lote } from '../../../types'

type FiltroStatus = 'todos' | 'No prazo' | 'Alerta' | 'Vencido'

export function EstoquePage() {
  const { data: lotes = [], isLoading } = useLotes()

  const [busca, setBusca]                 = useState('')
  const [filtroStatus, setFiltroStatus]   = useState<FiltroStatus>('todos')
  const [loteModal, setLoteModal]         = useState(false)
  const [movModal, setMovModal]           = useState<{
    lote: Lote; tipo: 'entrada' | 'saida'
  } | null>(null)

  const lotesFiltrados = lotes.filter(lote => {
    const matchBusca = lote.nome_produto.toLowerCase().includes(busca.toLowerCase()) ||
      String(lote.id_lote).includes(busca)
    const matchStatus = filtroStatus === 'todos' || lote.status_validade === filtroStatus
    return matchBusca && matchStatus
  })

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie lotes e movimentações de estoque</p>
        </div>
        <button
          onClick={() => setLoteModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Novo lote
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por produto ou nº do lote..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value as FiltroStatus)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="No prazo">No prazo</option>
            <option value="Alerta">Em alerta</option>
            <option value="Vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando lotes...</div>
        ) : lotesFiltrados.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Nenhum lote encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lote</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fabricação</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vencimento</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Quantidade</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lotesFiltrados.map(lote => {
                  const status = getStatusValidade(lote.status_validade)
                  return (
                    <tr key={lote.id_lote} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{lote.id_lote}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{lote.nome_produto}</p>
                        <p className="text-xs text-gray-400">{lote.nome_categoria}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatarData(lote.data_fabricacao)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatarData(lote.data_vencimento)}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {lote.tipo_medida === 'peso' && lote.quantidade_peso !== null
                          ? `${lote.quantidade_peso} kg`
                          : `${lote.quantidade_porcoes} un.`
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.classe}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setMovModal({ lote, tipo: 'entrada' })}
                            title="Registrar entrada"
                            className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <ArrowDownCircle size={16} />
                          </button>
                          <button
                            onClick={() => setMovModal({ lote, tipo: 'saida' })}
                            title="Registrar saída"
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <ArrowUpCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {loteModal && <LoteModal onFechar={() => setLoteModal(false)} />}
      {movModal && (
        <MovimentacaoModal
          lote={movModal.lote}
          tipo={movModal.tipo}
          onFechar={() => setMovModal(null)}
        />
      )}
    </div>
  )
}