import enums from 'Constants/enums'
import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { get } from 'lodash'

export const assetTypeOfIssue = [
  { label: 'Create New', value: 'CREATE_NEW' },
  { label: 'Add Existing', value: 'ADD_EXISTING' },
]
export const resolutionTypes = [
  { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
  { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
  { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
]

export const issueSteps = [
  { id: 1, name: 'Issue Details' },
  { id: 2, name: 'Asset Details' },
  { id: 3, name: 'Resolution Details' },
]

export const ISSUE_CREATION_TYPE = {
  EXISTING: 1,
  NEW: 2,
}
export const NEW_ISSUE_ASSET_TYPE = {
  NEW: 1,
  EXISTING: 2,
  VERIFY_ON_FIELD: 3,
}

export const validateIssueDetails = async payload => {
  const obj = {
    issueTitle: yup.string().required('Title is required !').max(100, 'Title can not be more than 100 characters !'),
    issueType: yup.string().required('Type is required !'),
    resolutionType: yup.string().required('Resolution type is required !'),
  }
  const shouldShowExistingAsset = !get(payload, 'asset.isVerifyInField', false) && get(payload, 'asset.type', '') === assetTypeOfIssue[1].value
  if (shouldShowExistingAsset) obj.linkedAsset = yup.string().required('Linked Asset is required !')
  const schema = yup.object().shape(obj)
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const LinkedIssueTable = ({ title, type }) => (
  <>
    <div className='text-bold' style={{ fontSize: '13px' }}>
      Linked Issue
    </div>
    <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div className='text-bold align-items-center p-2' style={{ borderBottom: '1px solid #a1a1a1' }}>
        Issue Title
      </div>
      <div className='text-bold align-items-center p-2' style={{ borderBottom: '1px solid #a1a1a1' }}>
        Type
      </div>
      <div className='align-items-center p-2'>{title}</div>
      <div className='align-items-center p-2'>{type}</div>
    </div>
  </>
)

export const validateResolutionDetails = async (payload, isReplace) => {
  const obj = {
    linkedAsset: yup.string().required('Asset is required !'),
    issueDescription: yup.string().required('Problem Description is required !'),
  }
  if (isReplace) obj.replacedByAsset = yup.string().required('Replaced By Asset Asset is required !')
  const schema = yup.object().shape(obj)
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const isValidURL = str => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/

  return urlRegex.test(str)
}
