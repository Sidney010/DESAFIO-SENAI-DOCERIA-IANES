import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { redefinirSenhaSchema } from '../types/auth.types'
import type { RedefinirSenhaForm } from '../types/auth.types'
import { useRedefinirSenhaMutation } from '../hooks/useAuthMutation'

export function RedefinirSenhaPage() {
  const { mutate, isPending, error } = useRedefinirSenhaMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<RedefinirSenhaForm>({
    resolver: zodResolver(redefinirSenhaSchema),
  })

  const onSubmit = (data: RedefinirSenhaForm) => mutate(data)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
            <ShieldCheck className="text-orange-600" size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Nova senha</h1>
          <p className="text-gray-500 text-sm mt-1">Insira o código recebido e defina sua nova senha</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            Código inválido ou expirado. Tente novamente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código (6 dígitos)</label>
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              {...register('codigo')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent tracking-widest text-center"
            />
            {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register('nova_senha')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.nova_senha && <p className="text-red-500 text-xs mt-1">{errors.nova_senha.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-orange-600 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}