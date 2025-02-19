import { isEmpty } from 'lodash'

export const createSequence = (data, sequence = []) => {
  sequence = sequence || []
  if (['container'].includes(data.type) && !['submit'].includes(data.key)) sequence.push(data.key)
  if (!isEmpty(data.components)) data.components.forEach(comp => createSequence(comp, sequence))
  return sequence
}

export const footer = {
  testEquipmentNumber: '121314',
  inspectionVerdict: 'Pass',
  comments: 'The asset PASSED and is acceptable for operation.',
  testedBy: 'Anmol',
  testEquipmentCalibrationTable: [
    {
      equipmentId: '15',
      name: '16',
      serialNumber: '17',
      calibrationDate: '2023-07-14T00:00:00+05:30',
    },
  ],
  copyright: '',
  selection1: '',
  defects: 'no',
  defectDescription: '',
  violations: 'no',
  necViolations: [{ selectViolation: '' }],
  oshaViolations: [{ selectViolation: '' }],
  repairSchedule: '',
  electricalIssueDescription: 'EID',
  visualIssueDescription: 'VID',
  mechanicalIssueDescription: 'MID',
  replacementSchedule: '',
  contactResistanceIssueDescription1: 'EID',
  generalMechanicalIssueDescription1: 'VID',
  insulationResistanceIssueDescription1: 'MID',
}
