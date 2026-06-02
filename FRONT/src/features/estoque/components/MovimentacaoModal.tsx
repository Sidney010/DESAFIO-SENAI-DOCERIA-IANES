import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { movimentacaoSchema } from '../types/estoque.types'
import type { MovimentacaoForm } from '../types/estoque.types'
import type { Lote } from '../../../types'
import { useRegistrarEntrada, useRegistrarSaida } from '../hooks/useEstoque'
import { formatarData } from '../../../utils/dateFormatter'

interface Props {
  lote: Lote
  tipo: 'entrada' | 'saida'
  onFechar: () => void
}

export function MovimentacaoModal({ lote, tipo, onFechar }: Props) {
  const { mutate: entrada, isPending: entrando } = useRegistrarEntrada()
  const { mutate: saida,   isPending: saindo   } = useRegistrarSaida()

  const { register, handleSubmit, formState: { errors } } = useForm<MovimentacaoForm>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: { quantidade: 1, motivo: '' },
  })

  const onSubmit = (data: MovimentacaoForm) => {
    const payload = { id_lote: lote.id_lote, ...data }
    if (tipo === 'entrada') {
      entrada(payload, { onSuccess: onFechar })
    } else {
      saida(payload, { onSuccess: onFechar })
    }
  }

  const isEntrada = tipo === 'entrada'
  const isPending = entrando || saindo

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const errorClass = "text-red-500 text-xs mt-1"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl ${
          isEntrada ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            {isEntrada
              ? <ArrowDownCircle size={20} className="text-green-600" />
              : <ArrowUpCircle   size={20} className="text-red-600"   />
            }
            <h2 className="font-semibold text-gray-900">
              {isEntrada ? 'Registrar entrada' : 'Registrar saída'}
            </h2>
          </div>
          <button onClick={onFechar} className="p-2 rounded-lg hover:bg-white/60 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Info do lote */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm">
          <p className="font-medium text-gray-900">{lote.nome_produto}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            Lote #{lote.id_lote} · Vence em {formatarData(lote.data_vencimento)} ·{' '}
            {lote.quantidade_porcoes} unidade{lote.quantidade_porcoes !== 1 ? 's' : ''} em estoque
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          <div>
            <label className={labelClass}>
              Quantidade {isEntrada ? 'a adicionar' : 'a remover'} *
            </label>
            <input
              type="number"
              min={1}
              {...register('quantidade', { valueAsNumber: true })}
              className={inputClass}
            />
            {errors.quantidade && <p className={errorClass}>{errors.quantidade.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Motivo *</label>
            <input
              type="text"
              placeholder={isEntrada ? 'Ex: Nova fornada' : 'Ex: Venda, Descarte'}
              {...register('motivo')}
              className={inputClass}
            />
            {errors.motivo && <p className={errorClass}>{errors.motivo.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors ${
                isEntrada
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isPending ? 'Registrando...' : isEntrada ? 'Confirmar entrada' : 'Confirmar saída'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}