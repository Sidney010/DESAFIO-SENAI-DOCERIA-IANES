import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { recuperarSenhaSchema } from '../types/auth.types'
import type { RecuperarSenhaForm } from '../types/auth.types'
import { useRecuperarSenhaMutation } from '../hooks/useAuthMutation'

export function RecuperarSenhaPage() {
  const { mutate, isPending, isSuccess } = useRecuperarSenhaMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<RecuperarSenhaForm>({
    resolver: zodResolver(recuperarSenhaSchema),
  })

  const onSubmit = (data: RecuperarSenhaForm) => mutate(data.email)

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
            <KeyRound className="text-green-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">E-mail enviado</h2>
          <p className="text-gray-500 text-sm mb-6">
            Se o e-mail estiver cadastrado, você receberá o código em breve.
          </p>
          <Link
            to="/redefinir-senha"
            className="inline-block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Inserir código
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
            <KeyRound className="text-orange-600" size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Recuperar senha</h1>
          <p className="text-gray-500 text-sm mt-1">Informe seu e-mail para receber o código</p>
        </div>

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

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-orange-600 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}