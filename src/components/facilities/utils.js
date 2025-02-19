import enums from 'Constants/enums'

export const statusOptions = [
  { label: 'Active', value: enums.USER_STATUS_CHIPS[0].value, color: '#0dbf16' },
  { label: 'Inactive', value: enums.USER_STATUS_CHIPS[1].value, color: '#fc2803' },
]

export const allowAddAsset = [
  { label: 'Yes', value: '1', color: '#0dbf16' },
  { label: 'No', value: '0', color: '#fc2803' },
]

export const getChip = (status, list) => {
  if (!status) return {}
  const x = list.find(d => d.value === status)
  if (!x) return {}
  return { color: x.color, label: x.label }
}
