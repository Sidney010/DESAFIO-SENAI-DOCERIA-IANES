import axios from 'axios'

// Instância central do Axios — toda requisição da aplicação passa por aqui
const api = axios.create({
  baseURL: 'http://localhost:8080/v1/IANES',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Antes de cada requisição, injeta o token JWT no header automaticamente
// Assim nenhum service precisa se preocupar em buscar o token manualmente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
// Centraliza o tratamento de erros globais
// 401 → token expirado/inválido → limpa storage e redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      // Redireciona sem depender do React Router (que pode não estar no contexto)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api