import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute }        from './PrivateRoute'
import { PublicRoute }         from './PublicRoute'
import { Layout }              from '../components/Layout'

import { LoginPage }           from '../features/auth/pages/LoginPage'
import { CadastroPage }        from '../features/auth/pages/CadastroPage'
import { RecuperarSenhaPage }  from '../features/auth/pages/RecuperarSenhaPage'
import { RedefinirSenhaPage }  from '../features/auth/pages/RedefinirSenhaPage'
import { DashboardPage }       from '../features/dashboard/pages/DashboardPage'
import { ProdutosPage }        from '../features/produtos/pages/ProdutosPage'
import { EstoquePage } from '../features/estoque/pages/EstoquePage'
import { NotificacoesPage } from '../features/notificacoes/pages/NotificacoesPage'
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/cadastro"         element={<CadastroPage />} />
          <Route path="/recuperar-senha"  element={<RecuperarSenhaPage />} />
          <Route path="/redefinir-senha"  element={<RedefinirSenhaPage />} />
        </Route>

        {/* Rotas privadas — todas dentro do Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/notificacoes" element={<NotificacoesPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/produtos"     element={<ProdutosPage />} />
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            {/* demais rotas entram aqui conforme avançamos */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}