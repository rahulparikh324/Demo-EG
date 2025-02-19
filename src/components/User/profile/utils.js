import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { isEmpty } from 'lodash'

export const validate = async payload => {
  const schema = yup.object().shape({
    firstName: yup.string().required('First Name is required !'),
    lastName: yup.string().required('Last Name is required !'),
    defaultSite: yup.string().required('Default Facility is required !'),
    mobileNumber: yup
      .string()
      .nullable()
      .test('len', 'Mobile number must be 10 digits only, without the country code.', val => {
        return val == null || isEmpty(val) || val.length === 10
      }),
  })
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const validateWithMobile = async payload => {
  const schema = yup.object().shape({
    firstName: yup.string().required('First Name is required !'),
    lastName: yup.string().required('Last Name is required !'),
    defaultSite: yup.string().required('Default Facility is required !'),
    mobileNumber: yup
      .string()
      .test('len', 'Mobile number must be 10 digits only, without the country code.', val => {
        return val.length === 10
      })
      .required('Mobile Number is required !'),
  })
  const isValid = await validateSchema(payload, schema)
  return isValid
}
