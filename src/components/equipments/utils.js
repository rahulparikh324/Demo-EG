import enums from 'Constants/enums'

export const equipmentOptions = [
  { label: 'Calibrated', value: enums.EQUIPMENT.CALIBRATED, color: '#37D482' },
  { label: 'Not Calibrated', value: enums.EQUIPMENT.NOTCALIBRATED, color: '#F64949' },
  { label: 'N/A', value: enums.EQUIPMENT.NA, color: '#778899' },
]

export const getChip = (status, list) => {
  if (!status) return {}
  const x = list.find(d => d.value === status)
  if (!x) return {}
  return { color: x.color, label: x.label }
}
