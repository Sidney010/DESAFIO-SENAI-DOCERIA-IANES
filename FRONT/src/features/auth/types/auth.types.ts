import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

export const cadastroSchema = z.object({
  nome:  z.string().min(4, 'Nome deve ter no mínimo 4 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
})

export const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const redefinirSenhaSchema = z.object({
  email:     z.string().email('E-mail inválido'),
  codigo:    z.string().length(6, 'O código deve ter 6 dígitos'),
  nova_senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
})

export type LoginForm        = z.infer<typeof loginSchema>
export type CadastroForm     = z.infer<typeof cadastroSchema>
export type RecuperarSenhaForm = z.infer<typeof recuperarSenhaSchema>
export type RedefinirSenhaForm = z.infer<typeof redefinirSenhaSchema>