import { useState } from 'react'
import { Package, AlertTriangle, XCircle, TrendingDown } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { getStatusValidade } from '../../../utils/dateFormatter'
import type { DashboardItem } from '../../../types'

// ── Card de métrica resumo ──────────────────────────────────────────────────
function MetricCard({
  label, valor, icon: Icon, cor,
}: {
  label: string
  valor: number
  icon: React.ElementType
  cor: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{valor}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// ── Card de produto no estoque ──────────────────────────────────────────────
function ProdutoCard({ item }: { item: DashboardItem }) {
  const status = getStatusValidade(item.status_critico)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{item.nome_produto}</p>
          <p className="text-xs text-gray-400 mt-0.5">{item.nome_categoria} · #{item.codigo_identificador}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.classe}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-2xl font-semibold text-gray-900">{item.quantidade_total}</p>
          <p className="text-xs text-gray-400">unidades em estoque</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{item.total_lotes} lote{item.total_lotes !== 1 ? 's' : ''}</p>
          {item.estoque_baixo && (
            <p className="text-xs text-orange-600 font-medium mt-0.5">⚠ Estoque baixo</p>
          )}
        </div>
      </div>

      {/* Barra de nível de estoque */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            item.status_critico === 'Vencido'  ? 'bg-red-500'    :
            item.status_critico === 'Alerta'   ? 'bg-yellow-500' :
            item.estoque_baixo                 ? 'bg-orange-500' :
            'bg-green-500'
          }`}
          style={{
            width: `${Math.min(
              (item.quantidade_total / (item.limite_minimo_alerta * 3)) * 100, 100
            )}%`,
          }}
        />
      </div>
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────────
export function DashboardPage() {
  const { data: itens = [], isLoading, isError, refetch } = useDashboard()
  const [busca, setBusca]         = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  // Métricas resumo
  const totalProdutos  = itens.length
  const emAlerta       = itens.filter(i => i.status_critico === 'Alerta').length
  const vencidos       = itens.filter(i => i.status_critico === 'Vencido').length
  const estoqueBaixo   = itens.filter(i => i.estoque_baixo).length

  // Categorias únicas para o filtro
  const categorias = [...new Set(itens.map(i => i.nome_categoria))]

  // Filtros aplicados
  const itensFiltrados = itens.filter(item => {
    const matchBusca = item.nome_produto.toLowerCase().includes(busca.toLowerCase()) ||
      String(item.codigo_identificador).includes(busca)
    const matchStatus = filtroStatus === 'todos' ||
      (filtroStatus === 'estoque_baixo' ? item.estoque_baixo : item.status_critico === filtroStatus)
    const matchCategoria = filtroCategoria === 'todas' || item.nome_categoria === filtroCategoria
    return matchBusca && matchStatus && matchCategoria
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando estoque...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="text-red-400 mx-auto mb-3" size={40} />
          <p className="text-gray-600 font-medium">Erro ao carregar o estoque</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do estoque em tempo real</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total de produtos"  valor={totalProdutos} icon={Package}       cor="bg-blue-50 text-blue-600"   />
        <MetricCard label="Em alerta"           valor={emAlerta}      icon={AlertTriangle} cor="bg-yellow-50 text-yellow-600"/>
        <MetricCard label="Vencidos"            valor={vencidos}      icon={XCircle}       cor="bg-red-50 text-red-600"     />
        <MetricCard label="Estoque baixo"       valor={estoqueBaixo}  icon={TrendingDown}  cor="bg-orange-50 text-orange-600"/>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="todos">Todos os status</option>
          <option value="No prazo">No prazo</option>
          <option value="Alerta">Em alerta</option>
          <option value="Vencido">Vencidos</option>
          <option value="estoque_baixo">Estoque baixo</option>
        </select>
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="todas">Todas as categorias</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Grid de produtos */}
      {itensFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {itensFiltrados.map(item => (
            <ProdutoCard key={item.id_produto} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}