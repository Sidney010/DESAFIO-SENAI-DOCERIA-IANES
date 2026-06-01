import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { categoriaSchema } from '../types/produto.types'
import type { CategoriaForm } from '../types/produto.types'
import type { Categoria } from '../../../types'
import { useCriarCategoria, useAtualizarCategoria } from '../hooks/useProdutos'

interface Props {
  categoria?: Categoria | null
  onFechar: () => void
}

export function CategoriaModal({ categoria, onFechar }: Props) {
  const isEdicao = !!categoria
  const { mutate: criar,     isPending: criando    } = useCriarCategoria()
  const { mutate: atualizar, isPending: atualizando } = useAtualizarCategoria()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoriaForm>({
    resolver: zodResolver(categoriaSchema),
  })

  useEffect(() => {
    if (categoria) reset({ nome_categoria: categoria.nome_categoria })
  }, [categoria, reset])

  const onSubmit = (data: CategoriaForm) => {
    if (isEdicao) {
      atualizar({ id: categoria!.id_categoria, nome: data.nome_categoria }, { onSuccess: onFechar })
    } else {
      criar(data.nome_categoria, { onSuccess: onFechar })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {isEdicao ? 'Editar categoria' : 'Nova categoria'}
          </h2>
          <button onClick={onFechar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da categoria *</label>
            <input
              type="text"
              placeholder="Ex: Bolo, Torta, Doce Porção"
              {...register('nome_categoria')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.nome_categoria && (
              <p className="text-red-500 text-xs mt-1">{errors.nome_categoria.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={criando || atualizando}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {criando || atualizando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}