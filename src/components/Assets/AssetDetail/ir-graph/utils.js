export const getEndDate = () => {
  const d = new Date()
  let month = `${d.getMonth() + 1}`
  let day = `${d.getDate()}`
  const year = `${d.getFullYear()}`

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return `${year}-${month}-${day}T23:59:59`
}

export const timeRangeTypes = {
  today: 'TODAY',
  week: 'WEEK',
  month: 'MONTH',
  all: 'ALL',
}

export const legend = [
  { dataKey: 'irAcrossPoleAsFound1', label: 'IRAP As Found 1', color: '#555555' },
  { dataKey: 'irAcrossPoleAsFound2', label: 'IRAP As Found 2', color: '#f6bf2b' },
  { dataKey: 'irAcrossPoleAsFound3', label: 'IRAP As Found 3', color: '#1cb4c7' },
  { dataKey: 'irPoletoPoleAsFound1', label: 'IRPP As Found 1', color: '#de584d' },
  { dataKey: 'irPoletoPoleAsFound2', label: 'IRPP As Found 2', color: '#5e4dde' },
  { dataKey: 'irPoletoPoleAsFound3', label: 'IRPP As Found 3', color: '#0004ff' },
]
