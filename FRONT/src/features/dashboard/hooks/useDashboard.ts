import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../constants/queryKeys'
import { dashboardService } from '../services/dashboardService'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardService.listar,
    refetchInterval: 30000, // Atualiza a cada 30s automaticamente
  })
}