export const formatMoney = (value: number, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)

export const formatPct = (value: number, digits = 2) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`

export const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const salvadorDate = new Date(date.getTime() - 6 * 60 * 60 * 1000)
  const day = String(salvadorDate.getDate()).padStart(2, '0')
  const month = String(salvadorDate.getMonth() + 1).padStart(2, '0')
  const year = String(salvadorDate.getFullYear())
  const hour = String(salvadorDate.getHours()).padStart(2, '0')
  const minute = String(salvadorDate.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year}, ${hour}:${minute}`
}

export const boolText = (value: boolean) => (value ? 'Yes' : 'No')
