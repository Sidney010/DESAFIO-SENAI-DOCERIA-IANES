import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Boxes, Bell, Users,
  LogOut, Menu, X, ChefHat,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../features/notificacoes/components/NotificationBell.tsx'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/produtos',    label: 'Produtos',      icon: Package         },
  { to: '/estoque',     label: 'Estoque',       icon: Boxes           },
  { to: '/notificacoes',label: 'Notificações',  icon: Bell            },
  { to: '/usuarios',    label: 'Usuários',      icon: Users           },
]

export function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarAberta, setSidebarAberta] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Overlay mobile */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200
        flex flex-col
        transform transition-transform duration-200
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">Doceria IANES</p>
            <p className="text-xs text-gray-400">Gestão de Estoque</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarAberta(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuário + logout */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-700 text-xs font-semibold">
                {usuario?.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nome}</p>
              <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo principal ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          {/* Botão menu mobile */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarAberta(!sidebarAberta)}
          >
            {sidebarAberta ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:block" />

          {/* Sino de notificações */}
          <NotificationBell />
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}