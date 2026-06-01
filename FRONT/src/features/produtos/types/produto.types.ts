import { z } from 'zod'

export const produtoSchema = z.object({
  nome_produto:          z.string().min(4, 'Nome deve ter no mínimo 4 caracteres'),
  id_categoria:          z.coerce.number().min(1, 'Selecione uma categoria'),
  sabor_massa:           z.string().optional(),
  recheio:               z.string().optional(),
  cobertura:             z.string().optional(),
  detalhes:              z.string().optional(),
  limite_minimo_alerta:  z.coerce.number().min(0, 'Informe o limite mínimo'),
})

export const categoriaSchema = z.object({
  nome_categoria: z.string().min(4, 'Nome deve ter no mínimo 4 caracteres'),
})

export type ProdutoForm   = z.infer<typeof produtoSchema>
export type CategoriaForm = z.infer<typeof categoriaSchema>