import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Search } from 'lucide-react'
import { useProdutos, useCategorias, useExcluirProduto, useExcluirCategoria } from '../hooks/useProdutos'
import { ProdutoModal }   from '../components/ProdutoModal'
import { CategoriaModal } from '../components/CategoriaModal'
import type { Produto, Categoria } from '../../../types'

type Aba = 'produtos' | 'categorias'

export function ProdutosPage() {
  const [aba, setAba]                         = useState<Aba>('produtos')
  const [busca, setBusca]                     = useState('')
  const [produtoModal, setProdutoModal]       = useState<Produto | null | undefined>(undefined)
  const [categoriaModal, setCategoriaModal]   = useState<Categoria | null | undefined>(undefined)

  const { data: produtos   = [], isLoading: loadProd } = useProdutos()
  const { data: categorias = [], isLoading: loadCat  } = useCategorias()
  const { mutate: excluirProduto   } = useExcluirProduto()
  const { mutate: excluirCategoria } = useExcluirCategoria()

  const produtosFiltrados = produtos.filter(p =>
    p.nome_produto.toLowerCase().includes(busca.toLowerCase()) ||
    String(p.codigo_identificador).includes(busca)
  )

  const confirmarExclusaoProduto = (id: number) => {
    if (window.confirm('Deseja excluir este produto do catálogo?')) {
      excluirProduto(id)
    }
  }

  const confirmarExclusaoCategoria = (id: number) => {
    if (window.confirm('Deseja excluir esta categoria?')) {
      excluirCategoria(id)
    }
  }

  const tabClass = (t: Aba) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      aba === t
        ? 'bg-orange-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie o catálogo de produtos e categorias</p>
        </div>
        <button
          onClick={() => aba === 'produtos' ? setProdutoModal(null) : setCategoriaModal(null)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {aba === 'produtos' ? 'Novo produto' : 'Nova categoria'}
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-2">
        <button className={tabClass('produtos')}   onClick={() => setAba('produtos')}>
          Produtos ({produtos.length})
        </button>
        <button className={tabClass('categorias')} onClick={() => setAba('categorias')}>
          <Tag size={14} className="inline mr-1" />
          Categorias ({categorias.length})
        </button>
      </div>

      {/* ── ABA PRODUTOS ─────────────────────────────────────────────────────── */}
      {aba === 'produtos' && (
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loadProd ? (
              <div className="py-12 text-center text-gray-400 text-sm">Carregando...</div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">Nenhum produto encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Produto</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Código</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Componentes</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Alerta mín.</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {produtosFiltrados.map(produto => (
                      <tr key={produto.id_produto} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{produto.nome_produto}</td>
                        <td className="px-4 py-3 text-gray-500">#{produto.codigo_identificador}</td>
                        <td className="px-4 py-3">
                          <span className="bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                            {produto.nome_categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {[produto.sabor_massa, produto.recheio, produto.cobertura]
                            .filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{produto.limite_minimo_alerta}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setProdutoModal(produto)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => confirmarExclusaoProduto(produto.id_produto)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA CATEGORIAS ───────────────────────────────────────────────────── */}
      {aba === 'categorias' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loadCat ? (
            <div className="py-12 text-center text-gray-400 text-sm">Carregando...</div>
          ) : categorias.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Nenhuma categoria cadastrada</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categorias.map(cat => (
                <div key={cat.id_categoria} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Tag size={14} className="text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{cat.nome_categoria}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCategoriaModal(cat)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => confirmarExclusaoCategoria(cat.id_categoria)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      {produtoModal !== undefined && (
        <ProdutoModal
          produto={produtoModal}
          categorias={categorias}
          onFechar={() => setProdutoModal(undefined)}
        />
      )}
      {categoriaModal !== undefined && (
        <CategoriaModal
          categoria={categoriaModal}
          onFechar={() => setCategoriaModal(undefined)}
        />
      )}
    </div>
  )
}