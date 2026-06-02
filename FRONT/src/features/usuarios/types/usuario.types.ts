import { z } from 'zod'

export const editarUsuarioSchema = z.object({
  nome:  z.string().min(4, 'Nome deve ter no mínimo 4 caracteres'),
  email: z.string().email('E-mail inválido'),
})

export type EditarUsuarioForm = z.infer<typeof editarUsuarioSchema>