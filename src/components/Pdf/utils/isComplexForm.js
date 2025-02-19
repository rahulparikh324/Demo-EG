import { COMPLEX_STRUCTURED_FORM_NAMES } from '../constant'
import { complexTemplates } from './premadeForms'

const isComplexForm = name => {
  const formNames = Object.values(COMPLEX_STRUCTURED_FORM_NAMES)
  if (!formNames.includes(name)) return []
  const formTemplate = complexTemplates[name]
  return formTemplate
}

export default isComplexForm
