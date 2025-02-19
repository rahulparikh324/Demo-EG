import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { startCase } from 'lodash'

export const validateForm = async payload => {
  const obj = {}
  Object.keys(payload).forEach(key => (obj[key] = yup.string().required(`${startCase(key)} is required !`)))
  const schema = yup.object().shape({ ...obj })

  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const validateAssetDetails = async payload => {
  const schema = yup.object().shape({
    assetName: yup.string().required('Asset Name is required !'),
    inspectiontemplateAssetClassId: yup.string().required('Asset Class Code Name is required !'),
    building: yup.string().required('Building is required !'),
    floor: yup.string().required('Floor is required !'),
    room: yup.string().required('Room is required !'),
  })
  const isValid = await validateSchema(payload, schema)
  return isValid
}
