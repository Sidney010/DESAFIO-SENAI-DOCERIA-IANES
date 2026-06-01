import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { loginSchema } from '../types/auth.types'
import type { LoginForm } from '../types/auth.types'
import { useLoginMutation } from '../hooks/useAuthMutation'

export function LoginPage() {
  const { mutate, isPending, error } = useLoginMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => mutate(data)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
            <LogIn className="text-orange-600" size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Doceria IANES</h1>
          <p className="text-gray-500 text-sm mt-1">Faça login para acessar o sistema</p>
        </div>

        {/* Erro da API */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            E-mail ou senha incorretos. Tente novamente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('senha')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.senha && (
              <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>
            )}
          </div>

          {/* Esqueci senha */}
          <div className="text-right">
            <Link to="/recuperar-senha" className="text-sm text-orange-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link cadastro */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="text-orange-600 font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}