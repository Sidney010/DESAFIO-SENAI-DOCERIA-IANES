import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Bloqueia acesso a /login e /cadastro para quem já está logado
export function PublicRoute() {
  const { isAutenticado } = useAuth()
  return isAutenticado ? <Navigate to="/dashboard" replace /> : <Outlet />
}