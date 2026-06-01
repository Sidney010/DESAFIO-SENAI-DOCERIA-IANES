// Converte ISO (2026-05-27) → DD/MM/AAAA para exibição
export const formatarData = (isoDate: string): string => {
  if (!isoDate) return '—'
  const [ano, mes, dia] = isoDate.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

// Converte DD/MM/AAAA → YYYY-MM-DD para enviar à API
export const formatarDataParaApi = (dataBr: string): string => {
  const [dia, mes, ano] = dataBr.split('/')
  return `${ano}-${mes}-${dia}`
}

// Retorna a classe de cor Tailwind conforme o status de validade
export const getStatusValidade = (status: string) => {
  switch (status) {
    case 'No prazo':
      return {
        label: 'No prazo',
        classe: 'bg-green-100 text-green-800',
      }
    case 'Alerta':
      return {
        label: 'Alerta',
        classe: 'bg-yellow-100 text-yellow-800',
      }
    case 'Vencido':
      return {
        label: 'Vencido',
        classe: 'bg-red-100 text-red-800',
      }
    default:
      return {
        label: status,
        classe: 'bg-gray-100 text-gray-800',
      }
  }
}