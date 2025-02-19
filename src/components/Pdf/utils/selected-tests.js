import { FORM_NAMES, COMPLEX_STRUCTURED_FORM_NAMES } from '../constant'

const selectedTests = (formName, testData) => {
  if (formName === COMPLEX_STRUCTURED_FORM_NAMES.LVCB) {
    const { contactResistance, groundFaultElements, instantaneousElements, insulationResistanceAcrossPole, insulationResistancePoleToPole, longTimeElements, shortTimeElements } = testData
    return {
      contact_resistance_test: contactResistance,
      ground_fault_elements: groundFaultElements,
      instantaneous_elements: instantaneousElements,
      insulation_resistance_pole_to_pole: insulationResistancePoleToPole,
      insulation_resistance_across_pole: insulationResistanceAcrossPole,
      longtime_elements: longTimeElements,
      shorttime_elements: shortTimeElements,
    }
  } else return testData
}
export default selectedTests
