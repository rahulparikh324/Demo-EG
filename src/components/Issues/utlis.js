import enums from 'Constants/enums'

import AccessTime from '@material-ui/icons/AccessTime'
import HistoryIcon from '@material-ui/icons/History'
import DoneIcon from '@material-ui/icons/Done'
import RefreshIcon from '@material-ui/icons/Refresh'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { get } from 'lodash'

export const statusChipOptions = [
  { label: 'Open', value: enums.ISSUE.STATUS.OPEN, color: '#003DDA', icon: <AccessTime fontSize='small' /> },
  { label: 'Scheduled', value: enums.ISSUE.STATUS.SCHEDULED, color: '#fcba03', icon: <HistoryIcon fontSize='small' /> },
  { label: 'In Progress', value: enums.ISSUE.STATUS.IN_PROGRESS, color: '#3291DD', icon: <RefreshIcon fontSize='small' /> },
  { label: 'Resolved', value: enums.ISSUE.STATUS.RESOLVED, color: '#0dbf16', icon: <DoneIcon fontSize='small' /> },
]
export const statusOptions = [
  { label: 'All', value: [] },
  { label: 'Open', value: [enums.ISSUE.STATUS.OPEN] },
  { label: 'Scheduled', value: [enums.ISSUE.STATUS.SCHEDULED] },
  { label: 'In Progress', value: [enums.ISSUE.STATUS.IN_PROGRESS] },
  { label: 'Resolved', value: [enums.ISSUE.STATUS.RESOLVED] },
]

export const priorityOptions = [
  { label: 'Low', value: enums.ISSUE.PRIORITY.LOW, color: '#37d482' },
  { label: 'Medium', value: enums.ISSUE.PRIORITY.MEDIUM, color: '#ffd41a' },
  { label: 'High', value: enums.ISSUE.PRIORITY.HIGH, color: '#ff5f6e' },
  // { label: 'Very High', value: enums.ISSUE_PRIORITY.VERY_HIGH, color: '#840404' },
]

export const typeOptions = [
  { label: 'Compliance', value: enums.ISSUE.TYPE.COMPLIANCE },
  { label: 'Thermal Anamoly', value: enums.ISSUE.TYPE.THERMAL_ANAMOLY },
  { label: 'Ultrasonic Anamoly', value: enums.ISSUE.TYPE.ULTRASONIC_ANOMALY },
  { label: 'Repair', value: enums.ISSUE.TYPE.REPAIR },
  { label: 'Replacement', value: enums.ISSUE.TYPE.REPLACE },
  { label: 'Other', value: enums.ISSUE.TYPE.OTHER },
]

export const getChip = (status, list) => {
  if (!status) return {}
  const x = list.find(d => d.value === status)
  if (!x) return {}
  return { color: x.color, label: x.label }
}

export const generateAvatarColor = ({ firstName, lastName }) => {
  // Concatenate first name and last name
  const fullName = firstName + lastName
  // Calculate a hash value based on the full name
  let hash = 0
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Generate RGB values from the hash
  const red = (hash & 0xff0000) >> 16
  const green = (hash & 0x00ff00) >> 8
  const blue = hash & 0x0000ff
  // Convert RGB to hexadecimal
  const hex = '#' + ((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1)
  return hex
}

export const StatusControl = ({ onClick, icon, title, active, color }) => {
  return (
    <div className={`p-2 d-flex flex-column text-bold justify-content-between align-items-center status-control status-control-${active}`} style={{ background: active ? color : '#fff', color: !active ? '#606060' : '#fff', border: `1px solid #a1a1a1` }} onClick={onClick}>
      {icon}
      {title}
    </div>
  )
}

export const MinimalIssueStatus = ({ value, onClick }) => (
  <div className='mt-2'>
    <div className='text-bold'>Status</div>
    <div className='mb-2 d-flex flex-row justify-content-between align-items-center'>
      {statusOptions.map(d => (
        <StatusControl key={d.value} title={d.label} active={value === d.value} onClick={() => onClick(d.value)} icon={d.icon} color={d.color} />
      ))}
    </div>
  </div>
)

export const validate = async (payload, isResolutionRequired) => {
  const obj = {
    issueTitle: yup.string().required('Title is required !').max(100, 'Title can not be more than 100 characters !'),
    issueType: yup.string().required('Type is required !'),
  }
  if (isResolutionRequired) obj.resolutionType = yup.string().required('Resolution type is required !')
  if (!isResolutionRequired) obj.asset = yup.string().required('Asset is required !')
  const schema = yup.object().shape(obj)
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const createPayload = ({ issue, isForMaintenance, type, reason, workOrderID }) => {
  const payload = {
    ...issue,
    issueType: get(issue, 'issueType.value', null),
    assetIssueId: get(issue, 'assetIssueId', null),
    assetId: get(issue, 'asset.assetId', null),
    issueStatus: type === 'RESOLVE' ? enums.ISSUE.STATUS.RESOLVED : issue.issueStatus,
    resolveIssueReason: type === 'RESOLVE' ? reason : '',
  }
  if (isForMaintenance) {
    payload.inspectionType = get(issue, 'resolutionType.value', '')
    payload.problemDescription = get(payload, 'issueDescription', '')
    payload.woonboardingassetsId = get(payload, 'asset.woonboardingassetsId', null)
    payload.woId = workOrderID
    payload.issueImages = get(payload, 'issueImageList', [])
    const toDelete = ['asset', 'issueDescription', 'backOfficeNote', 'resolutionType', 'resolveIssueReason', 'issueImageList', 'assetIssueId', 'issueStatus']
    toDelete.forEach(d => {
      delete payload[d]
    })
  }
  return payload
}
