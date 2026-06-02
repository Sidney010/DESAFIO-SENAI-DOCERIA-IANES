import { useState } from 'react'
import { Pencil, Trash2, UserCheck, UserX, Users } from 'lucide-react'
import { useUsuarios, useExcluirUsuario } from '../hooks/useUsuarios'
import { UsuarioModal } from '../components/UsuarioModal'
import { useAuth } from '../../../context/AuthContext'
import type { Usuario } from '../../../types'

export function UsuariosPage() {
  const { usuario: usuarioLogado }    = useAuth()
  const { data: usuarios = [], isLoading } = useUsuarios()
  const { mutate: excluir }           = useExcluirUsuario()
  const [modalUsuario, setModalUsuario] = useState<Usuario | null>(null)

  const confirmarExclusao = (u: Usuario) => {
    if (u.id_usuario === usuarioLogado?.id_usuario) {
      alert('Você não pode excluir seu próprio usuário.')
      return
    }
    if (window.confirm(`Deseja excluir o usuário "${u.nome}"?`)) {
      excluir(u.id_usuario)
    }
  }

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie os usuários com acesso ao sistema</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <Users size={15} className="text-orange-600" />
          <span className="text-sm text-orange-700 font-medium">
            {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando usuários...</div>
        ) : usuarios.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Usuário</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map(u => (
                  <tr
                    key={u.id_usuario}
                    className={`hover:bg-gray-50 ${
                      u.id_usuario === usuarioLogado?.id_usuario ? 'bg-orange-50/40' : ''
                    }`}
                  >
                    {/* Avatar + nome */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-700 text-xs font-semibold">
                            {u.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {u.nome}
                            {u.id_usuario === usuarioLogado?.id_usuario && (
                              <span className="ml-2 text-xs text-orange-600 font-normal">(você)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{u.email}</td>

                    {/* Status ativo/inativo */}
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                          <UserCheck size={12} />
                          Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                          <UserX size={12} />
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalUsuario(u)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmarExclusao(u)}
                          disabled={u.id_usuario === usuarioLogado?.id_usuario}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Excluir"
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

      {/* Modal */}
      {modalUsuario && (
        <UsuarioModal
          usuario={modalUsuario}
          onFechar={() => setModalUsuario(null)}
        />
      )}
    </div>
  )
}