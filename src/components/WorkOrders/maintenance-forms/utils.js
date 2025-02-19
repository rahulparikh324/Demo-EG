import { get } from 'lodash'
import enums from 'Constants/enums'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'

export const formatOptions = d => {
  const data = get(d, 'data', [])
  const options = data.map(d => ({ ...d, label: d.name, value: d.assetId }))
  return options
}

export const validate = async (payload, isOld, isReplace, isRepair, isJustAsset) => {
  const shape = { assetName: yup.string().required('Asset Name is required !').max(100, 'Asset Name can not be more than 100 characters !') }
  // if (!isOld) shape.assetClassCode = yup.string().required('Class is required !')
  if (isReplace) shape.replacedAssetId = yup.string().nullable().required('Asset to be replaced is required !')
  if (isRepair) shape.repairResolution = yup.string().required('Repair Resolution is required !')
  if (!isJustAsset) shape.problemDesc = yup.string().nullable().required('Problem is required !')
  const schema = yup.object().shape(shape)
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const inspectionStatusOptions = [
  { label: 'Open', value: 1 },
  { label: 'In Progress', value: 2 },
  { label: 'Done', value: 3 },
]

export const repairResolutionOptions = [
  { label: 'Repair Completed Successfully', value: 1 },
  { label: 'Repair Could Not Be Completed', value: 2 },
]

export const issueResolutionOptions = [
  { label: 'Issue Resolved Successfully', value: 1 },
  { label: 'Issue Could Not Be Resolved', value: 2 },
]

export const replacementResolutionOptions = [
  { label: 'Replacement Completed Successfully', value: 1 },
  { label: 'Replacement Could Not Be Completed', value: 2 },
]

export const recommendedActionOptions = [
  { label: 'Inspection', value: 1 },
  { label: 'Repair', value: 2 },
  { label: 'Replace', value: 3 },
  { label: 'No Action Required', value: 4 },
]

export const actionScheduleOptions = [
  { label: 'Today', value: 1 },
  { label: 'Future', value: 2 },
]

export const inspectionTypes = [
  { label: 'NETA Inspection', value: enums.MWO_INSPECTION_TYPES.INSPECTION },
  { label: 'Install / Add', value: enums.MWO_INSPECTION_TYPES.INSTALL },
  { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
  { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
  { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
  { label: 'Issue', value: enums.MWO_INSPECTION_TYPES.ISSUE },
  { label: 'Preventative Maintenance', value: enums.MWO_INSPECTION_TYPES.PM },
]
export const linkedIssues = [
  { label: 'Issue Title', width: '40%' },
  { label: 'Type', width: '50%' },
  { label: 'Action', width: '10%' },
]
export const linkedIssueDetails = [
  { label: 'Issue Title', width: '50%' },
  { label: 'Type', width: '50%' },
]
export const LinkedIssueTableHeader = () => (
  <div className='d-flex align-items-center p-2' style={{ borderBottom: '1px solid #a1a1a1' }}>
    {linkedIssues.map(({ label, width }) => (
      <div key={label} className='text-bold' style={{ width }}>
        {label}
      </div>
    ))}
  </div>
)
