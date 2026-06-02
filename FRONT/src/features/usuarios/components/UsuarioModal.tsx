import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, UserCog } from 'lucide-react'
import { editarUsuarioSchema } from '../types/usuario.types'
import type { EditarUsuarioForm } from '../types/usuario.types'
import type { Usuario } from '../../../types'
import { useAtualizarUsuario } from '../hooks/useUsuarios'

interface Props {
  usuario: Usuario
  onFechar: () => void
}

export function UsuarioModal({ usuario, onFechar }: Props) {
  const { mutate: atualizar, isPending } = useAtualizarUsuario()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditarUsuarioForm>({
    resolver: zodResolver(editarUsuarioSchema),
  })

  useEffect(() => {
    reset({ nome: usuario.nome, email: usuario.email })
  }, [usuario, reset])

  const onSubmit = (data: EditarUsuarioForm) => {
    atualizar({ id: usuario.id_usuario, payload: data }, { onSuccess: onFechar })
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"
  const errorClass = "text-red-500 text-xs mt-1"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCog size={16} className="text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Editar usuário</h2>
          </div>
          <button onClick={onFechar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input type="text" {...register('nome')} className={inputClass} />
            {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelClass}>E-mail</label>
            <input type="email" {...register('email')} className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
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
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}