import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { produtoSchema } from '../types/produto.types'
import type { ProdutoForm } from '../types/produto.types'
import type { Produto, Categoria } from '../../../types'
import { useCriarProduto, useAtualizarProduto } from '../hooks/useProdutos'

interface Props {
  produto?: Produto | null
  categorias: Categoria[]
  onFechar: () => void
}

export function ProdutoModal({ produto, categorias, onFechar }: Props) {
  const isEdicao = !!produto
  const { mutate: criar,     isPending: criando    } = useCriarProduto()
  const { mutate: atualizar, isPending: atualizando } = useAtualizarProduto()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProdutoForm>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome_produto:         '',
      id_categoria:         0,
      sabor_massa:          '',
      recheio:              '',
      cobertura:            '',
      detalhes:             '',
      limite_minimo_alerta: 0,
    },
  })

  // Preenche o form ao editar
  useEffect(() => {
    if (produto) {
      reset({
        nome_produto:         produto.nome_produto,
        id_categoria:         produto.id_categoria,
        sabor_massa:          produto.sabor_massa  ?? '',
        recheio:              produto.recheio      ?? '',
        cobertura:            produto.cobertura    ?? '',
        detalhes:             produto.detalhes     ?? '',
        limite_minimo_alerta: produto.limite_minimo_alerta,
      })
    }
  }, [produto, reset])

  const onSubmit = (data: ProdutoForm) => {
    if (isEdicao) {
      atualizar({ id: produto!.id_produto, payload: data }, { onSuccess: onFechar })
    } else {
      criar(data, { onSuccess: onFechar })
    }
  }

  const isPending = criando || atualizando

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const errorClass = "text-red-500 text-xs mt-1"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-semibold text-gray-900">
            {isEdicao ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button onClick={onFechar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          {/* Nome */}
          <div>
            <label className={labelClass}>Nome do produto *</label>
            <input type="text" placeholder="Ex: Bolo de Chocolate" {...register('nome_produto')} className={inputClass} />
            {errors.nome_produto && <p className={errorClass}>{errors.nome_produto.message}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label className={labelClass}>Categoria *</label>
            <select {...register('id_categoria')} className={inputClass + ' bg-white'}>
              <option value={0}>Selecione uma categoria</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nome_categoria}
                </option>
              ))}
            </select>
            {errors.id_categoria && <p className={errorClass}>{errors.id_categoria.message}</p>}
          </div>

          {/* Componentes (opcionais) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Sabor da massa</label>
              <input type="text" placeholder="Ex: Chocolate" {...register('sabor_massa')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Recheio</label>
              <input type="text" placeholder="Ex: Brigadeiro" {...register('recheio')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cobertura</label>
              <input type="text" placeholder="Ex: Ganache" {...register('cobertura')} className={inputClass} />
            </div>
          </div>

          {/* Detalhes */}
          <div>
            <label className={labelClass}>Detalhes</label>
            <input type="text" placeholder="Ex: Sem glúten" {...register('detalhes')} className={inputClass} />
          </div>

          {/* Limite mínimo */}
          <div>
            <label className={labelClass}>Limite mínimo para alerta *</label>
            <input
              type="number"
              min={0}
              placeholder="Ex: 3"
              {...register('limite_minimo_alerta')}
              className={inputClass}
            />
            {errors.limite_minimo_alerta && <p className={errorClass}>{errors.limite_minimo_alerta.message}</p>}
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
              {isPending ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}