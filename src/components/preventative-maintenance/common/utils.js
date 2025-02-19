import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import enums from 'Constants/enums'

export const typeOptions = [
  { label: 'Recurring', value: 25 },
  { label: 'Fixed', value: 24 },
]
export const conditionTypes = [
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 3, value: 3 },
]
export const conditionTableColumns = [
  { label: 'Condition', width: '20%' },
  { label: 'Frequency ( Repeats Every )', width: '50%' },
  { label: 'Time Period', width: '30%' },
]
export const timePeriodOptions = [
  { label: 'Years', value: 30 },
  { label: 'Months', value: 29 },
]
export const timePeriodObj = {
  30: 'Years',
  29: 'Months',
}
export const assetPMFilterOptions = [
  { label: 'Upcoming', value: [enums.PM.STATUS.INPROGRESS, enums.PM.STATUS.OPEN, enums.PM.STATUS.SCHEDULE] },
  { label: 'Completed', value: [enums.PM.STATUS.COMPLETED] },
  { label: 'Missed PMs', value: [enums.PM.STATUS.OVERDUE] },
]
export const backlogPMFilterOptions = [
  { label: 'All', value: [] },
  { label: 'Open', value: [enums.PM.STATUS.OPEN] },
  { label: 'Scheduled', value: [enums.PM.STATUS.SCHEDULE] },
  { label: 'In Progress', value: [enums.PM.STATUS.INPROGRESS] },
  { label: 'Completed', value: [enums.PM.STATUS.COMPLETED] },
  { label: 'Overdue', value: [enums.PM.STATUS.OVERDUE] },
]
export const validate = async payload => {
  const schema = yup.object().shape({
    title: yup.string().required('Title is required !').max(100, 'Title can not be more than 100 characters !'),
    estimationTime: yup.number().integer('Please enter a valid Estimated Time').min(0, 'Please enter a valid Estimated Time').typeError('Estimated Time must be an integer').nullable(),
    pmTriggerType: yup.string().required('Trigger type is required !'),
  })
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const fileExtensions = {
  pdf: ['pdf'],
  xls: ['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'],
  img: ['jpg', 'jpeg', 'gif', 'png', 'eps'],
  doc: ['doc', 'docx', 'dot', 'docm'],
}

export const getDueInColor = days => {
  if (days <= 0) return '#EE3B0A'
  if (days >= 1 && days <= 30) return '#F64949'
  if (days >= 31 && days <= 60) return '#E46007'
  if (days >= 61 && days <= 90) return '#DF7D05'
  if (days >= 91 && days <= 180) return '#D49203'
  if (days >= 181) return '#CAA500'
}

export const pmStatusOptions = [
  { label: 'Open', value: enums.PM.STATUS.OPEN, color: '#003DDA' },
  { label: 'Completed', value: enums.PM.STATUS.COMPLETED, color: '#5D8C21' },
  { label: 'In Progress', value: enums.PM.STATUS.INPROGRESS, color: '#3291DD' },
  { label: 'Scheduled', value: enums.PM.STATUS.SCHEDULE, color: '#FF9D33' },
]
export const getChip = (status, list) => {
  if (!status) return {}
  const x = list.find(d => d.value === status)
  if (!x) return {}
  return { color: x.color, label: x.label }
}

export const customSort = (value, unit) => {
  const numericValue = parseInt(value, 10)
  if (!value || !unit || isNaN(numericValue)) {
    return 0 // Handle missing or non-numeric value
  }

  if (unit === 'Month' || unit === 'Months') {
    return numericValue
  } else if (unit === 'Year' || unit === 'Years') {
    return numericValue * 12
  }

  return 0
}

export const vendorCategoryOptions = [
  { label: 'Manufacturer', value: 1 },
  { label: 'Electrical Contractor', value: 2 },
  { label: 'Thermographer', value: 3 },
  { label: 'Other', value: 4 },
]

export const contactCategoryOptions = [
  { label: 'Customer', value: 1 },
  { label: 'Vendor', value: 2 },
  { label: 'Internal', value: 3 },
  { label: 'Other', value: 4 },
]
