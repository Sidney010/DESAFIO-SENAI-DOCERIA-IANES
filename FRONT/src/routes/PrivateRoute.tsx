import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protege rotas autenticadas — redireciona para /login se não tiver token
export function PrivateRoute() {
  const { isAutenticado } = useAuth()
  return isAutenticado ? <Outlet /> : <Navigate to="/login" replace />
}