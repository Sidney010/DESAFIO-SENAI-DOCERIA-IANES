import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { authService } from '../services/authService'

export function useLoginMutation() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.token, data.usuario)
      navigate('/dashboard')
    },
  })
}

export function useCadastroMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.cadastrar,
    onSuccess: () => navigate('/login'),
  })
}

export function useRecuperarSenhaMutation() {
  return useMutation({ mutationFn: authService.recuperarSenha })
}

export function useRedefinirSenhaMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.redefinirSenha,
    onSuccess: () => navigate('/login'),
  })
}