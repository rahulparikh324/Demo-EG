import enums from 'Constants/enums'
import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import _ from 'lodash'

export const workOrderTypesPath = {
  [enums.woType.Acceptance]: { label: 'Acceptance Test', path: 'workorders/details' },
  [enums.woType.Maintainance]: { label: 'Maintenance', path: 'workorders/details' },
  [enums.woType.OnBoarding]: { label: 'Onboarding', path: 'workorders/onboarding' },
  [enums.woType.InfraredScan]: { label: 'Infrared Scan', path: 'workorders/infrared-scan' },
}

export const timeCategoty = [
  { label: 'Labor', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.LABOR },
  { label: 'Materials', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.MATERIALS },
  { label: 'Subcontracts', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.SUBCONTRACTS },
  { label: 'Indirect Labor Cost', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.INDIRECT_LABOR_COST },
  { label: 'Indirect Job Cost', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.INDIRECT_JOB_COST },
  { label: '3rd Party Rental', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.THIRD_PARTY_RENTAL },
  { label: 'Miscellaneous', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.MISCELLANEOUS },
]
export const quantityType = [
  { label: 'Unit', value: enums.QUOTES.TIME_MATERIAL_UNIT.UNIT },
  { label: 'Feet', value: enums.QUOTES.TIME_MATERIAL_UNIT.FEET },
  { label: 'Blank', value: enums.QUOTES.TIME_MATERIAL_UNIT.BLANK },
]

export const burdenTypeOptions = [
  { label: '$', value: enums.QUOTES.BURDEN_TYPE.DOLLAR },
  { label: '%', value: enums.QUOTES.BURDEN_TYPE.PERCENTAGE },
]

export const statusOptions = [
  { label: 'All', value: null },
  { label: 'Labor', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.LABOR },
  { label: 'Materials', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.MATERIALS },
  { label: 'Subcontracts', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.SUBCONTRACTS },
  { label: 'Indirect Labor Cost', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.INDIRECT_LABOR_COST },
  { label: 'Indirect Job Cost', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.INDIRECT_JOB_COST },
  { label: '3rd Party Rental', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.THIRD_PARTY_RENTAL },
  { label: 'Miscellaneous', value: enums.QUOTES.TIME_MATERIAL_CATEGORY.MISCELLANEOUS },
]

export const photoTypeOptions = [
  { label: 'IR Only', value: enums.PHOTO_TYPE.IR_ONLY },
  { label: 'IR + Visual Separate', value: enums.PHOTO_TYPE.IR_VISUAL_SEPARATE },
]

export const reminderOptions = [
  { label: 'Days', value: enums.REMINDER_DURATION.DAY },
  { label: 'Hours', value: enums.REMINDER_DURATION.HOURS },
]

export const validateAddAsset = async payload => {
  const schema = yup.object().shape({
    groupString: yup.string().required('Testing Group Name is required !').max(100, 'Testing Group Name can not be more than 100 characters !'),
    assetClassCode: yup.string().required('Asset Class is required !').max(100, 'Asset Name can not be more than 100 characters !'),
  })
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const TitleCount = ({ title, count, bg, color }) => (
  <div className='d-flex align-items-center'>
    {title}
    <span className='ml-2 d-flex align-items-center justify-content-center' style={{ height: '21px', width: '21px', padding: '4px', background: bg || '#a6a6a6', color: color || '#fff', borderRadius: '16px', fontSize: '9px' }}>
      {count}
    </span>
  </div>
)

export const validateTimeMaterials = async payload => {
  const schema = yup.object().shape({
    quantity: yup.number().typeError('Quantity is required !').min(0.1, 'Quantity should be more than 0'),
    quantityUnitType: yup.string().required('Unit is required !'),
    itemCode: yup.string().required('Item Code is required !'),
    timeMaterialCategoryType: yup.string().required('Category is required !'),
    rate: yup.number().typeError('Rate is required !').min(0.1, 'Rate should be more than 0'),
    markup: yup
      .number()
      .transform(value => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .min(0, 'Markup percentage should be between 0 and 100')
      .max(100, 'Markup percentage should be between 0 and 100'),
    burden: yup
      .number()
      .transform(value => (isNaN(value) || value === null || value === undefined ? 0 : value))
      .when('burdenType.value', {
        is: 1,
        then: yup.number().min(0, 'Burden should be more than 0'),
        otherwise: yup.number().min(0, 'Burden percentage should be between 0 and 100').max(100, 'Burden percentage should be between 0 and 100'),
      }),
  })

  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const normalizeString = str => {
  if (!str) return ''
  return _.toLower(_.trim(str))
}
