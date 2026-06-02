import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { loteSchema } from '../types/estoque.types'
import type { LoteForm } from '../types/estoque.types'
import { useCriarLote } from '../hooks/useEstoque'
import { useProdutos } from '../../produtos/hooks/useProdutos'

interface Props {
  onFechar: () => void
}

export function LoteModal({ onFechar }: Props) {
  const { mutate: criar, isPending } = useCriarLote()
  const { data: produtos = [] }      = useProdutos()

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<LoteForm>({
    resolver: zodResolver(loteSchema),
    defaultValues: {
      tipo_medida:        'porcao',
      quantidade_porcoes: 0,
      quantidade_peso:    0,
    },
  })

  const tipoMedida = watch('tipo_medida')

  // Limpa campo irrelevante ao trocar tipo
  useEffect(() => {
    if (tipoMedida === 'porcao') setValue('quantidade_peso', undefined)
    else setValue('quantidade_porcoes', 0)
  }, [tipoMedida, setValue])

    
    const onSubmit = (data: LoteForm) => {
    const payload = {
        id_produto:         data.id_produto,
        data_fabricacao:    data.data_fabricacao,
        data_vencimento:    data.data_vencimento,
        tipo_medida:        data.tipo_medida,
        quantidade_porcoes: data.quantidade_porcoes ?? 0,
        ...(data.tipo_medida === 'peso' && {
        quantidade_peso: data.quantidade_peso ?? 0,
        }),
    }

    // Loga cada campo individualmente — aparece sem precisar expandir
    console.log('id_produto      →', payload.id_produto,        typeof payload.id_produto)
    console.log('data_fabricacao →', payload.data_fabricacao,   typeof payload.data_fabricacao)
    console.log('data_vencimento →', payload.data_vencimento,   typeof payload.data_vencimento)
    console.log('tipo_medida     →', payload.tipo_medida,       typeof payload.tipo_medida)
    console.log('qtd_porcoes     →', payload.quantidade_porcoes,typeof payload.quantidade_porcoes)
    console.log('qtd_peso        →', (payload as any).quantidade_peso, typeof (payload as any).quantidade_peso)

    criar(payload, { onSuccess: onFechar })
    }

  console.log('❌ Erros de validação:', errors)
  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const errorClass = "text-red-500 text-xs mt-1"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-semibold text-gray-900">Novo lote</h2>
          <button onClick={onFechar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          {/* Produto */}
          <div>
            <label className={labelClass}>Produto *</label>
            <select
              {...register('id_produto', { valueAsNumber: true })}
              className={inputClass + ' bg-white'}
            >
              <option value={0}>Selecione um produto</option>
              {produtos.map(p => (
                <option key={p.id_produto} value={p.id_produto}>
                  {p.nome_produto} — {p.nome_categoria}
                </option>
              ))}
            </select>
            {errors.id_produto && <p className={errorClass}>{errors.id_produto.message}</p>}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Data de fabricação *</label>
              <input type="date" {...register('data_fabricacao')} className={inputClass} />
              {errors.data_fabricacao && <p className={errorClass}>{errors.data_fabricacao.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Data de vencimento *</label>
              <input type="date" {...register('data_vencimento')} className={inputClass} />
              {errors.data_vencimento && <p className={errorClass}>{errors.data_vencimento.message}</p>}
            </div>
          </div>

          {/* Tipo de medida */}
          <div>
            <label className={labelClass}>Tipo de medida *</label>
            <div className="grid grid-cols-2 gap-3">
              {(['porcao', 'peso'] as const).map(tipo => (
                <label
                  key={tipo}
                  className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    tipoMedida === tipo
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={tipo}
                    {...register('tipo_medida')}
                    className="accent-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {tipo === 'porcao' ? '🍰 Porção (unidades)' : '⚖️ Peso (kg/g)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Campo dinâmico conforme tipo */}
          {tipoMedida === 'porcao' ? (
            <div>
              <label className={labelClass}>Quantidade de porções *</label>
              <input
                type="number"
                min={0}
                placeholder="Ex: 12"
                {...register('quantidade_porcoes', { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.quantidade_porcoes && <p className={errorClass}>{errors.quantidade_porcoes.message}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Peso total (kg) *</label>
                <input
                  type="number"
                  step="0.001"
                  min={0}
                  placeholder="Ex: 2.5"
                  {...register('quantidade_peso', { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.quantidade_peso && <p className={errorClass}>{errors.quantidade_peso.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Porções equivalentes *</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 10"
                  {...register('quantidade_porcoes', { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.quantidade_porcoes && <p className={errorClass}>{errors.quantidade_porcoes.message}</p>}
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className={labelClass}>Descrição (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Lote especial para festa"
              {...register('descricao')}
              className={inputClass}
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {isPending ? 'Registrando...' : 'Registrar lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}