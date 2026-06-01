import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { cadastroSchema } from '../types/auth.types'
import type { CadastroForm } from '../types/auth.types'
import { useCadastroMutation } from '../hooks/useAuthMutation'

export function CadastroPage() {
  const { mutate, isPending, error } = useCadastroMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
  })

  const onSubmit = (data: CadastroForm) => mutate(data)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
            <UserPlus className="text-orange-600" size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
          <p className="text-gray-500 text-sm mt-1">Preencha os dados para se cadastrar</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            E-mail já cadastrado ou dados inválidos.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              placeholder="Seu nome completo"
              {...register('nome')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register('senha')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, com maiúscula, minúscula e número.</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-orange-600 font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}