import { FORM_NAMES } from '../constant'
import { templatedForms } from './premadeForms'

const checkForExistingForm = name => {
  const formNames = Object.values(FORM_NAMES)
  if (!formNames.includes(name)) return null
  const formTemplate = templatedForms[name]
  return formTemplate
}

export default checkForExistingForm
