import { z } from 'zod'

export const loteSchema = z.object({
  id_produto:       z.number().min(1, 'Selecione um produto'),
  data_fabricacao:  z.string().min(1, 'Data de fabricação obrigatória'),
  data_vencimento:  z.string().min(1, 'Data de vencimento obrigatória'),
  tipo_medida:      z.enum(['peso', 'porcao']),
  quantidade_peso:      z.number().optional(),
  quantidade_porcoes:   z.number().min(0, 'Informe a quantidade'),
  descricao:            z.string().optional(),
})
.refine(
  (data) => data.tipo_medida !== 'peso' || (data.quantidade_peso !== undefined && data.quantidade_peso > 0),
  { message: 'Informe o peso', path: ['quantidade_peso'] }
)

export const movimentacaoSchema = z.object({
  quantidade: z.number().min(1, 'Informe a quantidade'),
  motivo:     z.string().min(1, 'Informe o motivo'),
})

export type LoteForm          = z.infer<typeof loteSchema>
export type MovimentacaoForm  = z.infer<typeof movimentacaoSchema>