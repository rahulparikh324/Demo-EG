import { useEffect, useState } from 'react'
import enums from 'Constants/enums'
import URL from 'Constants/apiUrls'
import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import DialogPrompt from 'components/DialogPrompt'

import AddIcon from '@material-ui/icons/Add'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined'
import { useTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'

import { isEmpty, isObject, get, keys, startCase, without } from 'lodash'
// quote
import { statusChipOptions } from 'components/quotes/utils'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankOutlinedIcon from '@material-ui/icons/CheckBoxOutlineBlankOutlined'
import { ActionButton, MinimalButton } from 'components/common/buttons'
import { Tooltip, withStyles, Chip } from '@material-ui/core'

import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import AccessTimeOutlined from '@material-ui/icons/AccessTimeOutlined'

export const getStatus = status => {
  if (!status) return {}
  const statusObject = enums.WO_STATUS.find(d => d.value === status)
  if (!statusObject) return {}
  const { color, label } = statusObject
  return { color, label }
}

export const getQuoteStatus = status => {
  if (!status) return {}
  const statusObject = statusChipOptions.find(d => d.value === status)
  if (!statusObject) return {}
  const { color, label } = statusObject
  return { color, label }
}

export const validate = async (payload, areLocationsOptional) => {
  const obj = {
    assetName: yup.string().required('Asset Name is required !').max(100, 'Asset Name can not be more than 100 characters !'),
    assetClassCode: yup.string().required('Asset Class Code is required !').max(100, 'Asset Name can not be more than 100 characters !'),
  }
  if (payload.isThermalViolation) {
    obj.thermalClassification = yup.string().required('Thermal Classification is required !')
    obj.thermalAnomalyProbableCause = yup.string().required('Probable Cause is required !')
  }
  if (payload.isNecViolation) {
    obj.necViolation = yup.string().required('Code Violation is required !')
  }
  if (payload.isOshaViolation) {
    obj.oshaViolation = yup.string().required('Code Violation is required !')
  }
  if (payload.isRepairViolation) {
    obj.repairIssueTitle = yup.string().required('Issue Title is required !')
  }
  if (payload.isReplaceViolation) {
    obj.replaceIssueTitle = yup.string().required('Issue Title is required !')
  }
  if (payload.isOtherViolation) {
    obj.otherIssueTitle = yup.string().required('Issue Title is required !')
  }
  if (!areLocationsOptional) {
    obj.building = yup.string().required('Building is required !')
    obj.floor = yup.string().required('Floor is required !')
    obj.room = yup.string().required('Room is required !')
  }
  const schema = yup.object().shape(obj)
  const isValid = await validateSchema(payload, schema)
  return isValid
}

export const AssetImage = ({ url, readOnly, onRemove, onClick, baseMargin, width, height, style, randomValue = false, isDetails = false, action, isIrPhotos = false }) => {
  const [invalidImage, setInvalidImage] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const w = width ? `${width}` : `100px`
  const h = height ? `${height}` : w

  const handleEncodeURL = url => {
    if (!url) return ''
    const parts = url.split('/')
    const secondLastPart = parts[parts.length - 2]
    const encodedSecondLastPart = encodeURIComponent(secondLastPart)
    parts[parts.length - 2] = encodedSecondLastPart
    const encodeName = parts.at(-1).replaceAll(' ', '%20')
    parts[parts.length - 1] = encodeName
    return parts.join('/')
  }

  useEffect(() => {
    const img = new Image()
    img.onload = () => setInvalidImage(false)
    img.onerror = () => setInvalidImage(true)
    img.src = url
  }, [url])

  const fallbackUrl = `${process.env.PUBLIC_URL}/proassets/images/upload-pending.png`

  // console.log(encodeURI(url)) // replace this

  return (
    <div
      onClick={onClick}
      style={{
        backgroundImage: `url(${handleEncodeURL(url)}?value=${!randomValue ? Math.random() : randomValue})${invalidImage ? `, url(${isIrPhotos ? fallbackUrl : URL.invalidImage})` : ''}`,
        backgroundSize: 'cover',
        width: w,
        marginRight: baseMargin ? 0 : '12px',
        height: h,
        display: 'inline-block',
        borderRadius: '4px',
        position: 'relative',
        cursor: 'pointer',
        flex: '0 0 auto',
        ...style,
      }}
      className='hover-photo'
    >
      {!readOnly && (
        <IconButton
          aria-label='close'
          size='small'
          onClick={e => {
            setDeleteOpen(true)
            e.stopPropagation()
          }}
          style={{ background: '#ff2068', position: 'absolute', right: '-12px', top: '-12px' }}
        >
          <DeleteOutlineOutlinedIcon style={{ color: '#fff' }} fontSize='small' />
        </IconButton>
      )}
      {isDetails && (
        <IconButton
          aria-label='view'
          size='small'
          onClick={e => {
            action()
            e.stopPropagation()
          }}
          style={{ background: '#778899', position: 'absolute', right: '20px', top: '-12px' }}
        >
          <VisibilityOutlinedIcon style={{ color: '#fff' }} fontSize='small' />
        </IconButton>
      )}
      {isDeleteOpen && <DialogPrompt title='Delete Photo' text='Are you sure you want to delete this Photo ?' open={isDeleteOpen} ctaText='Delete' action={e => (onRemove(), e.stopPropagation())} handleClose={e => (setDeleteOpen(false), e.stopPropagation())} />}
    </div>
  )
}

export const AssetImageUploadButton = ({ loading, isOld, ...props }) => {
  const theme = useTheme()
  return (
    <>
      {isOld ? (
        <button size='small' {...props} style={{ width: '100px', marginRight: '12px', height: '100px', display: 'inline-block', borderRadius: '4px', border: `2px dotted ${theme.palette.primary.main}`, background: 'none', outline: 'none', flex: '0 0 auto', ...props.style }}>
          {loading ? <CircularProgress size={20} thickness={5} /> : <AddIcon style={{ color: theme.palette.primary.main, width: props.iconSize ? props.iconsize : 'auto' }} fontSize='small' />}
        </button>
      ) : (
        <MinimalButton {...props} text='Upload Photos' startIcon={<AddAPhotoIcon />} variant='contained' color='primary' baseClassName='nf-buttons' loading={loading} loadingText='Uploading...' />
      )}
    </>
  )
}
export const SectionTab = ({ title, isActive, onClick, top = 0 }) => {
  const theme = useTheme()
  return (
    <div onClick={onClick} className='text-bold mb-2' style={{ color: isActive ? theme.palette.primary.main : '#00000040', position: 'fixed', top, cursor: 'pointer' }}>
      {title}
    </div>
  )
}

export const sectionNames = (isOnboarding, isSubComponent, isAsset = false, isIssue = false) => {
  let names = ['BASIC INFO', 'ASSET GROUP', 'NAMEPLATE INFORMATION', isSubComponent ? 'TOP LEVEL COMPONENT' : 'SUB-COMPONENTS', 'ELECTRICAL CONNECTIONS', 'LOCATION', 'CONDITION', 'MAINTENANCE ESTIMATE']
  if (!isOnboarding) names.push('IR SCAN PHOTOS')
  if (isAsset) {
    names[3] = 'COMPONENTS'
    names.pop()
  }
  if (isIssue) names = without(names, 'MAINTENANCE ESTIMATE')
  if (isSubComponent) names = names.filter(d => d !== 'ELECTRICAL CONNECTIONS')
  if (!isAsset) names.push('OTHER')
  return names
}

export const AppendRandomValueToS3Url = s3Url => {
  if (isEmpty(s3Url)) return
  const randomValue = new Date().getTime() // Using timestamp for simplicity

  return `${s3Url}?v=${randomValue}`
}

export const physicalConditionOptions = [
  { label: 'Operating Normally', value: enums.PHYSICAL_CONDITION.OPERATING_NORMALLY, color: enums.CONDITION_INDEX_COLORS.green },
  { label: 'Repair Needed', value: enums.PHYSICAL_CONDITION.REPAIR_NEDDED, color: enums.CONDITION_INDEX_COLORS.yellow },
  { label: 'Replacement Needed', value: enums.PHYSICAL_CONDITION.REPLACEMENT_NEEDED, color: enums.CONDITION_INDEX_COLORS.orange },
  { label: 'Repair Scheduled', value: enums.PHYSICAL_CONDITION.REPAIR_SCHEDULED, color: enums.CONDITION_INDEX_COLORS.lightBlue },
  { label: 'Replacement Scheduled', value: enums.PHYSICAL_CONDITION.REPLACEMENT_SCHEDULED, color: enums.CONDITION_INDEX_COLORS.turquoise },
  { label: 'Decomissioned', value: enums.PHYSICAL_CONDITION.DECOMMISIONED, color: enums.CONDITION_INDEX_COLORS.lightBrown },
  { label: 'Spare', value: enums.PHYSICAL_CONDITION.SPARE, color: enums.CONDITION_INDEX_COLORS.ultramarine },
]
export const maintenanceOptions = [
  { label: 'Serviceable', value: enums.MAINTENANCE_CONDITION.SERVICEABLE, color: '#37d482' },
  { label: 'Limited Service', value: enums.MAINTENANCE_CONDITION.LIMITED_SERVICE, color: '#FF950A' },
  { label: 'Nonserviceable', value: enums.MAINTENANCE_CONDITION.NON_SERVICEABLE, color: '#F64949' },
]
export const conditionOptions = [
  { label: 'Good', value: enums.CONDITION.GOOD, color: '#37d482' },
  { label: 'Average', value: enums.CONDITION.AVERAGE, color: '#ffd41a' },
  { label: 'Corrosive', value: enums.CONDITION.POOR, color: '#ff5f6e' },
  { label: 'Dusty', value: enums.CONDITION.DUSTY, color: '#840404' },
]
export const criticalityOptions = [
  { label: 'Low', value: enums.CRITICALITY.LOW, color: '#37d482' },
  { label: 'Medium', value: enums.CRITICALITY.MEDIUM, color: '#ffd41a' },
  { label: 'High', value: enums.CRITICALITY.HIGH, color: '#ff5f6e' },
]
export const severityCriteriaOptions = [
  { label: 'Similar', value: enums.SEVERITY_CRITERIA.SIMILAR, color: '#37d482' },
  { label: 'Ambient', value: enums.SEVERITY_CRITERIA.AMBIENT, color: '#ffd41a' },
  { label: 'Indirect', value: enums.SEVERITY_CRITERIA.INDIRECT, color: '#ff5f6e' },
]
export const PanelOptions = [
  { label: 'Current', value: enums.PANEL.CURRENT, color: '#37d482' },
  { label: 'Needs Updating', value: enums.PANEL.NEEDS_UPDATING, color: '#ffd41a' },
  { label: 'Missing', value: enums.PANEL.MISSING, color: '#ff5f6e' },
]
export const thermalClassificationOptions = [
  { label: 'OK', value: enums.THERMAL_CLASSIFICATION.OK },
  { label: 'Nominal', value: enums.THERMAL_CLASSIFICATION.NOMINAL },
  { label: 'Intermediate', value: enums.THERMAL_CLASSIFICATION.INTERMIDIATE },
  { label: 'Serious', value: enums.THERMAL_CLASSIFICATION.SERIOUS },
  { label: 'Critical', value: enums.THERMAL_CLASSIFICATION.CRITICAL },
  { label: 'Alert', value: enums.THERMAL_CLASSIFICATION.ALERT },
]
export const UltrasonicAnomalyOptions = [
  { label: 'Crack', value: enums.ULTRASONIC_ANOMALY.CRACK },
  { label: 'Void', value: enums.ULTRASONIC_ANOMALY.VOID },
  { label: 'Delamination', value: enums.ULTRASONIC_ANOMALY.DELAMINATION },
  { label: 'Inclusions', value: enums.ULTRASONIC_ANOMALY.INCLUSIONS },
  { label: 'Corrosion', value: enums.ULTRASONIC_ANOMALY.CORROSION },
  { label: 'Porosity', value: enums.ULTRASONIC_ANOMALY.POROSITY },
]
export const locationOptions = [
  { label: 'Indoor', value: 1 },
  { label: 'Outdoor', value: 2 },
]
export const componentTypeOptions = [
  { label: 'Top Level-Component', value: 1 },
  { label: "Sub-Component (OCP's)", value: 2 },
]
export const subComponentColumns = [
  { label: 'Name', width: '28%' },
  { label: 'Class', width: '28%' },
  { label: 'Circuit(s)', width: '23%' },
  { label: 'Line Side', width: '9%' },
  { label: 'Photo(s)', width: '8%' },
  { label: '', width: '4%' },
]
export const subComponentIssuesColumns = [
  { label: 'Name', width: '31%' },
  { label: 'Class', width: '31%' },
  { label: 'Circuit(s)', width: '28%' },
  { label: 'Line Side', width: '6%' },
  { label: 'Photo(s)', width: '5%' },
  { label: '', width: '3%' },
]
export const fedByColumns = [
  { label: 'Source Asset', width: '36%' },
  { label: 'Length', width: '20%' },
  { label: 'Style', width: '20%' },
  { label: 'Type', width: '16%' },
  { label: 'Action', width: '8%' },
]
export const thermalAnomalySubComponentOptions = [
  { label: 'Blade Hinge', value: 'Blade Hinge' },
  { label: 'Blade Port', value: 'Blade Port' },
  { label: 'Breaker (1P)', value: 'Breaker (1P)' },
  { label: 'Breaker (2P)', value: 'Breaker (2P)' },
  { label: 'Breaker (3P)', value: 'Breaker (3P)' },
  { label: 'Bus Bar', value: 'Bus Bar' },
  { label: 'Connection', value: 'Connection' },
  { label: 'Connection Bar', value: 'Connection Bar' },
  { label: 'Connector', value: 'Connector' },
  { label: 'Contactor (Coil)', value: 'Contactor (Coil)' },
  { label: 'Contactor (Lug)', value: 'Contactor (Lug)' },
  { label: 'Contactor (Poles)', value: 'Contactor (Poles)' },
  { label: 'Fuse', value: 'Fuse' },
  { label: 'Fuse Clip', value: 'Fuse Clip' },
  { label: 'Fuse Screw In', value: 'Fuse Screw In' },
  { label: 'Ground', value: 'Ground' },
  { label: 'Internal', value: 'Internal' },
  { label: 'Lug', value: 'Lug' },
  { label: 'Main', value: 'Main' },
  { label: 'Neutral', value: 'Neutral' },
  { label: 'PT/CT', value: 'PT/CT' },
  { label: 'Refer to Notes', value: 'Refer to Notes' },
  { label: 'Relay', value: 'Relay' },
  { label: 'Splice / Wire Nut', value: 'Splice / Wire Nut' },
  { label: 'Thermal Overload', value: 'Thermal Overload' },
  { label: 'Transformer', value: 'Transformer' },
  { label: 'Wire', value: 'Wire' },
]

export const thermalAnomalyLocationOptions = [
  { label: 'A Phase', value: 'A Phase' },
  { label: 'B Phase', value: 'B Phase' },
  { label: 'C Phase', value: 'C Phase' },
  { label: 'Ground', value: 'Ground' },
  { label: 'N/A', value: 'N/A' },
  { label: 'Neutral', value: 'Neutral' },
]

export const thermalAnomalyProbableCauseOptions = [
  { label: 'Internal Flaw', value: 1 },
  { label: 'Overload', value: 2 },
  { label: 'Poor Connection', value: 3 },
]

export const thermalAnomalyRecommendationOptions = [
  { label: 'Continue to Monitor', value: 1 },
  { label: 'Replace Component', value: 2 },
  { label: 'Verify, Clean and Tighten', value: 3 },
]

export const necVoilationOptions = [
  { label: 'Circuit - Breaker is restricted from freely operating - (NEC 240.8)', value: 1 },
  { label: 'Circuit - Exceeds panel limit - (NEC 408.36)', value: 2 },
  { label: 'Component - Visible Corrosion', value: 3 },
  { label: 'Conduit - Improperly fastened or secured - (NEC 300.11(A))', value: 4 },
  { label: 'Enclosure - Missing dead front, door, cover, etc. - (NEC 110.12(A))', value: 5 },
  { label: 'Enclosure - Must be free of foreign materials - (NEC 110.12(B) / NFPA 70B 13.3.2)', value: 6 },
  { label: 'Enclosure - Unused opening must be sealed - (NEC 110.12 (A) / 312.5(A))', value: 7 },
  { label: 'Fuse - Parallel fuses must match - (NEC 240.8)', value: 8 },
  { label: 'General - Lack of component integrity', value: 9 },
  { label: 'General - Not installed in a proper worklike manner', value: 10 },
  { label: 'Grounding - Need earth connection - (NEC 250.4(A))', value: 11 },
  { label: 'Marking/Labels - Missing or Insufficient information - (NEC 110.21(B) or 408.4)', value: 12 },
  { label: 'Mechanics - Damaged/broken parts', value: 13 },
  { label: 'Missing arc flash and shock hazard warning labels - (NEC 110.16(A))', value: 14 },
  { label: 'Plug Fuse - Exposed energized parts - (NEC 240.50(D))', value: 15 },
  { label: 'Temperature - Inadequate ventilation/cooling for component', value: 16 },
  { label: 'Terminals - Connection made without damaging wire - (NEC 110.14(A))', value: 17 },
  { label: 'Wire - 1 wire per terminal - (NEC 110.14(A))', value: 18 },
  { label: 'Wire - Improper Neutral Conductor - (NEC 200.4(A))', value: 19 },
  { label: 'Wire - Not Protected from damage - (NEC 300.4)', value: 20 },
  { label: 'Wire - Size wrong for load - (NEC 210.19(A))', value: 21 },
  { label: 'Wire - Wire bundle should have listed bushing', value: 22 },
  { label: 'Wire - Wire burned or damaged', value: 23 },
  { label: 'NEC.250.97 Bonding and Grounding', value: 24 },
]

export const oshaVoilationOptions = [
  { label: 'Clearance - Insufficient Access', value: 1 },
  { label: 'Enclosure - Broken locking mechanism', value: 2 },
  { label: 'Enclosure - Damaged', value: 3 },
  { label: 'Enclosure - Should be waterproof', value: 4 },
  { label: 'Equipment - Free of Hazards', value: 5 },
  { label: 'Grounding - Must be permanent & continuous', value: 6 },
  { label: 'Lighting - Inadequate around equipment', value: 7 },
  { label: 'Marking/Labels - Inadequate or missing information on equipment', value: 8 },
  { label: 'Mounting - Should be secure', value: 9 },
  { label: 'Noise - Excessive', value: 10 },
  { label: 'Wire - Exposed', value: 11 },
]

export const nfpa70bOption = [
  { label: 'Chapter 11.3.2 Power and Distribution transformer Cleaning', value: 1 },
  { label: 'Chapter 11.3.1 Visual Inspections', value: 2 },
  { label: 'Chapter 12.3.2 Substations and Switchgear Cleaning', value: 3 },
  { label: 'Chapter 12.3.1 Visual Inspections', value: 4 },
  { label: 'Chapter 13.3.2 Panelboards and Switchboards Cleaning', value: 5 },
  { label: 'Chapter 13.3.1 Visual Inspections', value: 6 },
  { label: 'Chapter 15.3.2 Circuit Breakers Low- and Medium Voltage', value: 7 },
  { label: 'Chapter 15.3.1 Visual Inspections', value: 8 },
  { label: 'Chapter 25.3.2 UPS Cleaning', value: 9 },
  { label: 'Chapter 25.3.1 Visual Inspections', value: 10 },
  { label: 'Chapter 28.3.2 Motor Control Equipment Cleaning', value: 11 },
  { label: 'Chapter 28.3.1 Visual Inspections', value: 12 },
]

export const imageTypeOptions = [
  { label: 'JPG', value: '.jpg' },
  // { label: 'PNG', value: '.png' },
  { label: 'JPEG', value: '.jpeg' },
  // { label: 'GIF', value: '.gif' },
  // { label: 'EPS', value: '.eps' },
]

export const codeComplianceOptions = [
  { label: 'Compliant', value: 1, color: '#0464F4' },
  { label: 'Non-Compliant', value: 2, color: '#848484' },
]

export const fedByTypeOptions = [
  { label: 'N', value: 1, color: '#37D482' },
  { label: 'E', value: 2, color: '#F64949' },
]
export const fedByTypeOptionsName = [
  { label: 'Normal', value: 1, color: '#37D482' },
  { label: 'Emergency', value: 2, color: '#F64949' },
]
export const arcFlashOptionsName = [
  { label: 'Yes', value: 1, color: '#37D482' },
  { label: 'No', value: 2, color: '#ffd41a' },
  { label: 'Missing', value: 3, color: '#F64949' },
]
export const subComponentPosition = [
  { label: 'Line Side', value: enums.SUB_COMPONENT_TYPE.LINE_SIDE, color: '#778899' },
  { label: 'Load Side', value: enums.SUB_COMPONENT_TYPE.LOAD_SIDE, color: '#778899' },
]
export const connectionType = [
  { label: 'Non-Flex Conduit', value: 1, color: '#37d482' },
  { label: 'Flexible Conduit', value: 2, color: '#37d482' },
  { label: 'Cable', value: 3, color: '#37d482' },
  { label: 'Busduct', value: 4, color: '#37d482' },
]
export const materialNonFlexType = [
  { label: 'PVC', value: 1, color: '#37d482' },
  { label: 'EMT', value: 2, color: '#37d482' },
  { label: 'IMC', value: 3, color: '#37d482' },
  { label: 'RMC', value: 4, color: '#37d482' },
  { label: 'Smurf', value: 5, color: '#37d482' },
  { label: 'Flex', value: 6, color: '#37d482' },
  { label: 'SealTight', value: 7, color: '#37d482' },
]
export const conductorTypesOptions = [
  { label: 'Copper', value: 'Copper', color: '#37d482' },
  { label: 'Aluminum', value: 'Aluminum', color: '#37d482' },
]

export const conductorSizeOptions = [
  { label: '18 AWG', value: '18 AWG' },
  { label: '16 AWG', value: '16 AWG' },
  { label: '14 AWG', value: '14 AWG' },
  { label: '12 AWG', value: '12 AWG' },
  { label: '10 AWG', value: '10 AWG' },
  { label: '8 AWG', value: '8 AWG' },
  { label: '6 AWG', value: '6 AWG' },
  { label: '4 AWG', value: '4 AWG' },
  { label: '2 AWG', value: '2 AWG' },
  { label: '1 AWG', value: '1 AWG' },
  { label: '1/0 AWG', value: '1/0 AWG' },
  { label: '2/0 AWG', value: '2/0 AWG' },
  { label: '3/0 AWG', value: '3/0 AWG' },
  { label: '4/0 AWG', value: '4/0 AWG' },
  { label: '250 kcmil', value: '250 kcmil' },
  { label: '300 kcmil', value: '300 kcmil' },
  { label: '400 kcmil', value: '400 kcmil' },
  { label: '500 kcmil', value: '500 kcmil' },
  { label: '600 kcmil', value: '600 kcmil' },
  { label: '750 kcmil', value: '750 kcmil' },
  { label: '1000 kcmil', value: '1000 kcmil' },
]

export const addedAssetTypeOptions = [
  { label: 'Create New Asset', value: 0 },
  { label: 'Use Existing Asset', value: 1 },
]

// export const conductorTypesOptions = [
//   { label: 'Copper', value: 1 },
//   { label: 'Aluminum', value: 2 },
// ]

export const racewayTypesOptions = [
  { label: 'Metallic', value: 1 },
  { label: 'Non Metallic', value: 2 },
]

export const assetStatus = [
  { label: 'Active', value: enums.assetStatus[0].id },
  { label: 'Inactive', value: enums.assetStatus[1].id },
]

export const photoTypes = {
  exterior: 13,
  schedule: 14,
  additional: 15,
  nameplate: 2,
  thermal: 3,
  nec: 4,
  osha: 5,
  repair: 16,
  replace: 17,
  other: 18,
  profile: 1,
  ultrasonic: 21,
  nfpa70b: 22,
}

export const photoDuration = {
  before: 1,
  after: 2,
}

export const resolvedOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

export const photoTypeCategory = [
  { label: 'Nameplate', value: photoTypes.nameplate },
  { label: 'Profile', value: photoTypes.profile },
  { label: 'Additional', value: photoTypes.additional },
]

export const RenderCheckBox = ({ data, selected, handleChange, accessor = 'id' }) => {
  const handleCheckboxClick = e => {
    // Stop event propagation to prevent triggering the parent's handleChange function
    e.stopPropagation()
    handleChange(data)
  }

  if (selected.includes(data[accessor])) {
    return <ActionButton tooltip='DESELECT' icon={<CheckBoxIcon fontSize='small' />} action={handleCheckboxClick} />
  } else {
    return <ActionButton tooltip='SELECT' icon={<CheckBoxOutlineBlankOutlinedIcon fontSize='small' />} action={handleCheckboxClick} />
  }
}

export const criticalityOptionsForAssetGroup = [
  { label: 'Non-Critical', value: enums.CRITICALITY.LOW, color: '#778899' },
  { label: 'Critical', value: enums.CRITICALITY.MEDIUM, color: '#ff5f6e' },
]

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 300,
    maxHeight: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip)

export const OverviewIcons = ({ val }) => {
  let totalCount = 0
  let valueFillCount = 0

  const formNameplateInfo = JSON?.parse(get(val, 'formNameplateInfo', null))
  if (isObject(formNameplateInfo)) {
    const keys = Object.keys(formNameplateInfo)

    for (let i = 0; i < keys.length; i++) {
      totalCount = i + 1
      if (!isEmpty(formNameplateInfo[keys[i]])) {
        valueFillCount++
      }
    }
  }

  const viewIssusList = () => {
    const issues = [...(val.issuesTitleList ?? [])]

    const itemWithcount = issues.map(item => {
      const itemCount = issues.filter(value => value === item).length
      return { name: item, itemCount }
    })

    const uniqueItems = itemWithcount.filter((item, index, self) => index === self.findIndex(t => t.name === item.name))

    return uniqueItems.map((val, countIndex) => (
      <Chip
        size='small'
        key={countIndex}
        label={
          <span className='d-flex'>
            {val.name}
            <span className='ml-2 d-flex align-items-center justify-content-center' style={{ height: '15px', width: '15px', padding: '4px', background: '#a6a6a6', color: '#fff', borderRadius: '16px', fontSize: '9px' }}>
              {val.itemCount}
            </span>
          </span>
        }
        style={{ marginRight: '5px', marginBottom: '5px', fontSize: '12px' }}
        variant='outlined'
      />
    ))
  }

  return (
    <div className='d-flex align-items-center'>
      {valueFillCount !== 0 && totalCount !== valueFillCount ? (
        <span className='text-bold' style={{ minWidth: '35px' }}>
          {valueFillCount} / {totalCount}
        </span>
      ) : (
        <span style={{ minWidth: '35px' }}></span>
      )}
      <HtmlTooltip
        placement='top'
        title={
          valueFillCount === 0
            ? 'No information collected'
            : Object.keys(formNameplateInfo).map((d, i) => (
                <div key={i} className='mb-1'>
                  <span className='text-bold'>{startCase(d)} : </span>
                  <span>{formNameplateInfo[d]}</span>
                </div>
              ))
        }
      >
        <svg width='16' height='14' viewBox='0 0 16 14' fill='none' xmlns='http://www.w3.org/2000/svg' style={{ marginRight: '7px' }}>
          <path
            d='M14.125 0.375H1.875C0.841125 0.375 0 1.21613 0 2.25V11.75C0 12.7839 0.841125 13.625 1.875 13.625H14.125C15.1589 13.625 16 12.7839 16 11.75V2.25C16 1.21613 15.1589 0.375 14.125 0.375ZM14.75 11.75C14.75 12.0946 14.4696 12.375 14.125 12.375H1.875C1.53038 12.375 1.25 12.0946 1.25 11.75V2.25C1.25 1.90538 1.53038 1.625 1.875 1.625H14.125C14.4696 1.625 14.75 1.90538 14.75 2.25V11.75ZM2.53125 5.375H13.5V6.625H2.53125V5.375ZM4.5625 7.84372H11.4688V9.09372H4.5625V7.84372ZM2.1875 3.21875C2.1875 2.87356 2.46731 2.59375 2.8125 2.59375C3.15769 2.59375 3.4375 2.87356 3.4375 3.21875C3.4375 3.56394 3.15769 3.84375 2.8125 3.84375C2.46731 3.84375 2.1875 3.56394 2.1875 3.21875ZM13.8125 3.1875C13.8125 3.53269 13.5327 3.8125 13.1875 3.8125C12.8423 3.8125 12.5625 3.53269 12.5625 3.1875C12.5625 2.84231 12.8423 2.5625 13.1875 2.5625C13.5327 2.5625 13.8125 2.84231 13.8125 3.1875ZM3.4375 10.8125C3.4375 11.1577 3.15769 11.4375 2.8125 11.4375C2.46731 11.4375 2.1875 11.1577 2.1875 10.8125C2.1875 10.4673 2.46731 10.1875 2.8125 10.1875C3.15769 10.1875 3.4375 10.4673 3.4375 10.8125ZM13.8125 10.8125C13.8125 11.1577 13.5327 11.4375 13.1875 11.4375C12.8423 11.4375 12.5625 11.1577 12.5625 10.8125C12.5625 10.4673 12.8423 10.1875 13.1875 10.1875C13.5327 10.1875 13.8125 10.4673 13.8125 10.8125Z'
            fill={valueFillCount === 0 ? '#c1c1c1' : valueFillCount !== totalCount ? '#FF6E00' : '#5BB450'}
          />
        </svg>
      </HtmlTooltip>

      {val.arcFlashLabelValid !== null ? (
        <HtmlTooltip placement='top' title={val.arcFlashLabelValid === 1 ? 'Arc Flash label valid' : val.arcFlashLabelValid === 3 ? 'Arc Flash label missing' : 'Arc Flash label invalid'}>
          <svg width='16' height='12' viewBox='0 0 16 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M15.8881 12.9543L8.74294 0.431273C8.59146 0.165421 8.30669 0 8.00001 0C7.69353 0 7.40886 0.16524 7.25707 0.431262L0.111839 12.9545C-0.0384922 13.2178 -0.037201 13.5445 0.115296 13.8068C0.267794 14.0691 0.551159 14.232 0.854777 14.232H15.1452C15.4489 14.232 15.7322 14.0691 15.8847 13.8068C16.0372 13.5445 16.0385 13.2178 15.8881 12.9543ZM15.1452 13.3918H0.854777C0.843882 13.3918 0.837053 13.3801 0.842441 13.3706L7.98766 0.847375C7.9904 0.842609 7.9952 0.84021 8 0.84021C8.0048 0.84021 8.0096 0.842598 8.01234 0.847375L15.1576 13.3706C15.163 13.3801 15.1561 13.3918 15.1452 13.3918Z'
              fill={val.arcFlashLabelValid === 1 ? '#5BB450' : val.arcFlashLabelValid === 2 ? '#ffd41a' : '#FF0000'}
            />
            <path
              d='M12.8792 12.7009L9.58187 10.6519L11.2776 10.6755L9.62898 10.0631L11.466 9.333L9.36991 9.16814L10.783 8.1554L9.22859 8.55578L10.3826 6.78939L8.47493 7.47239L9.46412 5.3998L7.79193 6.41255L8.33362 4.31641L6.99114 5.54112L6.92049 4.31641L6.40234 6.34189L7.27377 6.10637L6.99114 7.49594L8.16875 6.9307L7.53284 8.46157L8.92242 7.96699L7.95678 9.333L9.11083 9.73339L8.16875 10.2044L9.2757 11.0759L7.90968 10.8403L8.52203 11.594L7.46218 11.5234L8.16875 13.1013L8.26296 12.0179L10.4062 12.8423L9.06372 11.5234L12.8792 12.7009Z'
              fill={val.arcFlashLabelValid === 1 ? '#5BB450' : val.arcFlashLabelValid === 2 ? '#ffd41a' : '#FF0000'}
            />
            <path
              d='M6.12301 8.7062L5.31104 9.0318L6.26296 6.47086L5.47015 6.23828L4.81622 9.23024L4.65625 9.9619L5.04515 9.74701L6.01232 9.21306L5.42963 11.8782V11.8782L5.17462 11.5597L5.24643 12.7167L5.24637 12.7169L5.24645 12.7169L5.26032 12.9404L6.07879 11.8251L5.69188 11.9553L5.69191 11.9552L6.89176 8.72737L6.89196 8.72734L7.03574 8.34036L6.12301 8.7062Z'
              fill={val.arcFlashLabelValid === 1 ? '#5BB450' : val.arcFlashLabelValid === 2 ? '#ffd41a' : '#FF0000'}
            />
          </svg>
        </HtmlTooltip>
      ) : (
        <span style={{ minWidth: '15px' }}></span>
      )}

      <span className='ml-1' style={{ position: 'relative' }}>
        <HtmlTooltip title={val.tempIssuesCount === 0 ? 'No Issues Flagged' : viewIssusList()} placement='top'>
          <svg width='16' height='14' viewBox='0 0 16 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <g clip-path='url(#clip0_22747_574)'>
              <path
                d='M15.7939 12.6984L9.23092 1.8143C8.97236 1.38552 8.5007 1.11914 7.99998 1.11914C7.49926 1.11914 7.02761 1.38552 6.76901 1.81433L0.206108 12.6984C-0.0611112 13.1416 -0.0690175 13.6969 0.185451 14.1475C0.439983 14.5981 0.919545 14.878 1.43705 14.878H14.5629C15.0804 14.878 15.56 14.5981 15.8145 14.1475C16.069 13.6968 16.0611 13.1415 15.7939 12.6984ZM14.9075 13.6352C14.8374 13.7593 14.7054 13.8364 14.5629 13.8364H1.43705C1.29458 13.8364 1.16255 13.7593 1.09251 13.6353C1.02245 13.5112 1.02464 13.3583 1.09817 13.2364L7.66114 2.35223C7.73233 2.2342 7.86217 2.16086 8.00001 2.16086C8.13783 2.16086 8.26767 2.2342 8.33886 2.35223L14.9018 13.2364C14.9754 13.3584 14.9775 13.5112 14.9075 13.6352Z'
                fill={val.tempIssuesCount > 0 ? '#FF0000' : '#c1c1c1'}
              />
              <path
                d='M8.00628 5.40625C7.61003 5.40625 7.30078 5.61887 7.30078 5.99581C7.30078 7.14587 7.43606 8.7985 7.43606 9.94859C7.43609 10.2482 7.69706 10.3738 8.00631 10.3738C8.23825 10.3738 8.56684 10.2482 8.56684 9.94859C8.56684 8.79853 8.70212 7.14591 8.70212 5.99581C8.70212 5.61891 8.38322 5.40625 8.00628 5.40625Z'
                fill={val.tempIssuesCount > 0 ? '#FF0000' : '#c1c1c1'}
              />
              <path d='M8.01372 11.0449C7.5885 11.0449 7.26953 11.3832 7.26953 11.7891C7.26953 12.1854 7.58847 12.5333 8.01372 12.5333C8.40997 12.5333 8.74825 12.1854 8.74825 11.7891C8.74825 11.3832 8.40994 11.0449 8.01372 11.0449Z' fill={val.tempIssuesCount > 0 ? '#FF0000' : '#c1c1c1'} />
            </g>
            <defs>
              <clipPath id='clip0_22747_574'>
                <rect width='16' height='16' fill='white' />
              </clipPath>
            </defs>
          </svg>
        </HtmlTooltip>
        {val.tempIssuesCount > 0 && (
          <span className='d-flex align-items-center justify-content-center text-bold' style={{ backgroundColor: 'red', color: 'white', width: '10px', height: '10px', borderRadius: '50%', fontSize: '6px', position: 'absolute', bottom: '10px', left: '7px', padding: '1px 0 0 0' }}>
            {val.tempIssuesCount}
          </span>
        )}
      </span>
    </div>
  )
}

export const CustomCompanyAndSiteTooltip = ({ list, isTooltipRequireToShow = true, children }) => {
  const viewList = () => {
    return (
      <div
        id='style-1'
        style={{
          padding: '5px 0px 0px 0px',
          maxHeight: '650px',
          width: 'wrap-content',
          backgroundColor: '#fff',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {list.map((val, countIndex) => (
            <Chip
              size='small'
              key={countIndex}
              label={<span className='d-flex'>{get(val, 'label', '')}</span>}
              style={{
                marginRight: '5px',
                marginBottom: '5px',
                maxWidth: '345px',
                overflow: 'hide',
                fontSize: '12px',
              }}
              variant='outlined'
            />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className='d-flex align-items-center'>
      {isTooltipRequireToShow ? (
        <HtmlTooltip title={isEmpty(list) ? 'Facility not Available' : viewList()} placement='top'>
          <div>{children}</div>
        </HtmlTooltip>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}

export const CustomInviteesTooltip = ({ list, isTooltipRequireToShow = true, labelkey, children }) => {
  const viewList = () => {
    return (
      <div style={{ minWidth: '120px', maxHeight: '800px', overflow: 'auto' }}>
        {list.map((val, countIndex) => (
          <div key={countIndex} className='d-flex justify-content-between align-items-center'>
            <div style={{ fontSize: '12px', fontWeight: 500, maxWidth: '330px', padding: '3px 1px', marginLeft: '3px' }} id='style-1'>
              {isEmpty(get(val, 'name', '')) ? get(val, 'contactName', '') : get(val, 'name', '')}
            </div>
            {val.contactInviteStatus === 1 ? (
              <CheckCircleOutlinedIcon style={{ color: '#37D482', width: '18px', height: '18px' }} fontSize='small' />
            ) : val.contactInviteStatus === 2 ? (
              <CloseIcon style={{ width: '18px', height: '18px' }} color='error' fontSize='small' />
            ) : val.contactInviteStatus === 4 ? (
              <HelpOutlineOutlined style={{ width: '18px', height: '18px' }} color='primary' fontSize='small' />
            ) : (
              <AccessTimeOutlined style={{ color: '#FFD41A', width: '18px', height: '18px' }} fontSize='small' />
            )}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className='d-flex align-items-center'>
      {isTooltipRequireToShow ? (
        <HtmlTooltip title={isEmpty(list) ? 'Invite not Available' : viewList()} placement='top'>
          <div>{children}</div>
        </HtmlTooltip>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}

//duplicate Qr
export const getDuplicateQRs = (data, isAcceptance) => {
  const qrCounts = data.reduce((acc, row) => {
    if (isAcceptance ? row.qR_code : row.qRCode !== '') {
      acc[isAcceptance ? row.qR_code : row.qRCode] = (acc[isAcceptance ? row.qR_code : row.qRCode] || 0) + 1
    }
    return acc
  }, {})

  return new Set(Object.keys(qrCounts).filter(qr => qrCounts[qr] > 1))
}
