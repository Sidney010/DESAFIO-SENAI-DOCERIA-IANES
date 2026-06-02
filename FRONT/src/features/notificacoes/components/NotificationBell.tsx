import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, XCircle, TrendingDown, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotificacaoContagem, useNotificacoes } from '../hooks/useNotificacoes'
import type { NotificacaoItem } from '../../../types'

function NotificacaoCard({ item }: { item: NotificacaoItem }) {
  const isVencido     = item.status_validade === 'Vencido'
  const isEstoqueBaixo = item.tipo_notificacao === 'estoque_baixo'

  const cor = isVencido
    ? 'border-l-red-500 bg-red-50'
    : isEstoqueBaixo
    ? 'border-l-orange-500 bg-orange-50'
    : 'border-l-yellow-500 bg-yellow-50'

  const Icone = isVencido ? XCircle : isEstoqueBaixo ? TrendingDown : AlertTriangle
  const corIcone = isVencido ? 'text-red-500' : isEstoqueBaixo ? 'text-orange-500' : 'text-yellow-500'

  return (
    <div className={`border-l-4 px-3 py-2.5 rounded-r-lg ${cor}`}>
      <div className="flex items-start gap-2">
        <Icone size={14} className={`${corIcone} flex-shrink-0 mt-0.5`} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">{item.nome_produto}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEstoqueBaixo
              ? `Estoque baixo — ${item.quantidade_atual} restante(s)`
              : item.dias_para_vencer !== null && item.dias_para_vencer !== undefined
              ? item.dias_para_vencer <= 0
                ? 'Produto vencido — retirar do estoque'
                : `Vence em ${item.dias_para_vencer} dia(s)`
              : item.status_validade
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export function NotificationBell() {
  const [aberto, setAberto] = useState(false)
  const ref                 = useRef<HTMLDivElement>(null)
  const navigate            = useNavigate()

  const { data: contagem } = useNotificacaoContagem()
  const { data: notificacoes = [] } = useNotificacoes()

  const total = contagem?.total ?? 0

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const preview = notificacoes.slice(0, 5)

  return (
    <div ref={ref} className="relative">
      {/* Botão sino */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">

          {/* Header do dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Notificações</span>
            {total > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {contagem?.alta  ? <span className="text-red-600 font-medium">{contagem.alta} alta</span>   : null}
                {contagem?.media ? <span className="text-yellow-600 font-medium">{contagem.media} média</span> : null}
              </div>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-72 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                Nenhuma notificação
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {preview.map((item, i) => (
                  <NotificacaoCard key={i} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => { navigate('/notificacoes'); setAberto(false) }}
                className="flex items-center justify-center gap-1 w-full px-4 py-3 text-sm text-orange-600 font-medium hover:bg-orange-50 transition-colors"
              >
                Ver todas as notificações
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}