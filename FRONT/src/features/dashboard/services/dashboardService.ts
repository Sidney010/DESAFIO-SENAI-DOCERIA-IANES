import api from '../../../config/api'
import type { ApiResponse, DashboardItem } from '../../../types'

export const dashboardService = {
  listar: async () => {
    const { data } = await api.get<ApiResponse<{ dashboard: DashboardItem[] }>>('/dashboard')
    return data.response.dashboard
  },
}