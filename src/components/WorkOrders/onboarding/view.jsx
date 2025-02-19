import React, { useState, useRef } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import PhotoLibraryOutlined from '@material-ui/icons/PhotoLibraryOutlined'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import { nanoid } from 'nanoid'

import URL from 'Constants/apiUrls'

import { FormTitle } from 'components/Maintainance/components'
import { LabelVal, FormSection, ElipsisWithTootip } from 'components/common/others'
import ImagePreview from 'components/common/image-preview'
import { FloatingButton } from 'components/common/buttons'

import { get, isEmpty, startCase } from 'lodash'
import {
  AssetImage,
  locationOptions,
  SectionTab,
  sectionNames,
  thermalClassificationOptions,
  thermalAnomalyProbableCauseOptions,
  thermalAnomalyRecommendationOptions,
  necVoilationOptions,
  oshaVoilationOptions,
  physicalConditionOptions,
  codeComplianceOptions,
  subComponentColumns,
  fedByColumns,
  photoTypes,
  photoDuration,
  maintenanceOptions,
  UltrasonicAnomalyOptions,
  severityCriteriaOptions,
  PanelOptions,
  nfpa70bOption,
} from './utils'
import { getFormatedDate } from 'helpers/getDateTime'
import { conductorTypesOptions, racewayTypesOptions } from './utils'

import QRCode from 'qrcode'
import enums from 'Constants/enums'
import { SubComponentMultiplePhotoPop } from './components'

const useStyles = makeStyles({
  table: {
    borderRadius: '5px',
    '& th': {
      fontWeight: 'bold',
      border: '1px solid rgba(224, 224, 224, 1)',
      padding: '10px 8px 5px 10px',
    },
    '& td': {
      border: '1px solid rgba(224, 224, 224, 1)',
      textAlign: 'center',
      padding: '10px 0px 0px 10px',
    },
  },
})

const View = ({ open, onClose, viewObj, isOnboarding, onEdit, isEdit }) => {
  const theme = useTheme()
  const classes = useStyles()
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [isPreviewOpenForIr, setPreviewIr] = useState([false, 0])
  const [isPreviewOpenForSubCompImages, setPreviewOpenForSubCompImages] = useState(false)
  const [subCompImage, setSubCompImage] = useState([])
  const [qr, setQR] = useState('')
  const scrollableDiv = useRef(null)
  const formDiv = useRef(null)
  const formSectionNames = sectionNames(isOnboarding, viewObj.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT)
  const [activeSectionName, setActiveSectionName] = useState(formSectionNames[0])
  const [imageOrder, setImageOrder] = useState(0)
  const [isSubComponentPopupOpen, setSubComponentPopupOpen] = useState(false)
  const [subComponentPhotoInfo, setSubComponentPhotoInfo] = useState({})
  const nameplateInformation = JSON.parse(get(viewObj, `formNameplateInfo`, '{}'))
  const otherInfo = JSON.parse(get(viewObj, `dynmicFieldsJson`, '{}'))
  const flaggedRepairIssue = get(viewObj, 'wolineIssueList', []).find(d => d.issueType === enums.ISSUE.TYPE.REPAIR)
  const flaggedReplaceIssue = get(viewObj, 'wolineIssueList', []).find(d => d.issueType === enums.ISSUE.TYPE.REPLACE)
  const flaggedOtherIssue = get(viewObj, 'wolineIssueList', []).find(d => d.issueType === enums.ISSUE.TYPE.OTHER)
  const isTopLevelComponent = get(viewObj, 'componentLevelTypeId', '') === enums.COMPONENT_TYPE.TOP_LEVEL
  const [isPreviewConditionOpen, setPreviewCondition] = useState([false, 0])
  const [previewImageList, setPreviewImageList] = useState(0)

  if (get(viewObj, 'qrCode', null)) {
    QRCode.toDataURL(get(viewObj, 'qrCode', null))
      .then(url => setQR(url))
      .catch(err => console.error(err))
  }
  const checkDate = date => {
    if (!date) return 'NA'
    return getFormatedDate(date.split('T')[0])
  }
  const findEnumString = (type, value) => {
    if (!value) return 'N/A'
    let options = []
    if (type === 'LOC') options = locationOptions
    if (type === 'PCA') options = thermalAnomalyProbableCauseOptions
    if (type === 'REC') options = thermalAnomalyRecommendationOptions
    if (type === 'NEC') options = necVoilationOptions
    if (type === 'OSHA') options = oshaVoilationOptions
    if (type === 'THM') options = thermalClassificationOptions
    if (type === 'PAC') options = physicalConditionOptions
    if (type === 'CCP') options = codeComplianceOptions
    if (type === 'ULT') options = UltrasonicAnomalyOptions
    if (type === 'TSC') options = severityCriteriaOptions
    if (type === 'NFPA') options = nfpa70bOption

    const data = options.find(d => d.value === value)
    if (!data) return 'N/A'
    return data.label
  }
  const parseValue = label => {
    const x = get(viewObj, [label], '')
    if (!x) return 'N/A'
    return x
  }
  const changeSection = section => {
    setActiveSectionName(section)
    const id = section.toLowerCase().split(' ').join('-')
    const scrolledElm = document.querySelector(`#${id}`)
    scrolledElm.scrollIntoView({ behavior: 'smooth' })
    scrolledElm.childNodes[0].style.borderColor = '#778798'
    scrolledElm.childNodes[0].style.boxShadow = '0 0 4px #778798'
    setTimeout(() => {
      scrolledElm.childNodes[0].style.borderColor = '#dee2e6'
      scrolledElm.childNodes[0].style.boxShadow = 'none'
    }, 1000)
  }
  const handleScroll = () => {
    const pos = scrollableDiv.current.scrollTop
    const ids = formSectionNames.map(d => d.toLowerCase().split(' ').join('-'))
    ids.forEach(id => {
      const target = document.querySelector(`#${id}`)
      if (target) {
        const offSetTop = target.offsetTop - 180
        if (offSetTop && pos >= offSetTop) {
          const title = ['sub-components'].includes(id) ? id.toUpperCase() : id.toUpperCase().split('-').join(' ')
          setActiveSectionName(title)
        }
      }
    })
  }
  const viewSubCompImage = im => {
    setSubCompImage([im])
    setPreviewOpenForSubCompImages(true)
  }
  const Photos = ({ label, type, duration = 0, list = [], urlKey = 'assetPhoto', isConditionBlock = false }) => {
    const handleClick = index => {
      if (isConditionBlock) {
        setPreviewCondition([true, 0])
        setImageOrder(index)
        setPreviewImageList(list)
      } else {
        setPreview([true, type])
        setImageOrder(index)
      }
    }
    return (
      <div className='mt-3'>
        <div className='text-bold'>{label}</div>
        <div className='d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
          {isEmpty(list) ? (
            <div className='p-2' style={{ fontWeight: 800, borderRadius: '4px', background: '#00000014', width: '650px', textAlign: 'center' }}>
              No {label} found !
            </div>
          ) : (
            list.map((d, index) => <AssetImage onClick={() => handleClick(index)} readOnly key={`asset-image-${d.assetPhoto}`} url={d[urlKey]} randomValue />)
          )}
        </div>
      </div>
    )
  }
  const handleSubComponentPhoto = item => {
    // uploadSubComponentPhotoRef.current[index].current && uploadSubComponentPhotoRef.current[index].current.click()
    setSubComponentPhotoInfo(item)
    setSubComponentPopupOpen(true)
  }

  const handleEncodeURL = url => {
    const parts = url.split('/')

    const secondLastPart = parts[parts.length - 2]
    const encodedSecondLastPart = encodeURIComponent(secondLastPart)

    // Replace the second last part with the encoded value
    parts[parts.length - 2] = encodedSecondLastPart
    const encodedURL = parts.join('/')
    return encodedURL
  }

  const handleConductorMaterial = id => {
    const materials = conductorTypesOptions.find(d => d.value === id)
    return !isEmpty(materials) ? materials.label : 'N/A'
  }
  const handleRacewayType = id => {
    const raceway = racewayTypesOptions.find(d => d.value === id)
    return !isEmpty(raceway) ? raceway.label : 'N/A'
  }

  const handleMaintenanceType = type => {
    const maintenance = maintenanceOptions.find(d => d.value === type)
    return get(maintenance, 'label', 'N/A')
  }
  const handlePanelType = type => {
    const panel = PanelOptions.find(d => d.value === type)
    return get(panel, 'label', 'N/A')
  }

  const profilePhotos = get(viewObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.profile)

  const handleChipLable = d => {
    const visualPhoto = get(d, 'visualImageLabel', '')
    const irPhoto = get(d, 'irImageLabel', '')

    let label = ''
    if (visualPhoto && irPhoto) {
      label = `V: ${visualPhoto}, IR: ${irPhoto}`
    } else if (visualPhoto) {
      label = `V: ${visualPhoto}`
    } else if (irPhoto) {
      label = `IR: ${irPhoto}`
    }

    return label
  }

  const difference = function (num1, num2) {
    return Math.abs(num1 - num2)
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View Asset Info' closeFunc={onClose} style={{ width: '100%', minWidth: '700px' }} onEdit={onEdit} isEdit={isEdit} />
      <div className='d-flex'>
        <div style={{ padding: '10px', position: 'fixed', background: '#efefef', height: 'calc(100vh - 65px)' }}>
          <div style={{ padding: '16px', width: '200px', background: '#fff', borderRadius: '4px', height: '100%' }}>
            {formSectionNames.map((name, index) => (
              <SectionTab isActive={activeSectionName === name} onClick={() => changeSection(name)} key={name} title={name === 'SUB-COMPONENTS' ? "SUB-COMPONENTS (OCP'S)" : name} top={30 * index + 90} />
            ))}
          </div>
        </div>
        <div onScroll={handleScroll} ref={scrollableDiv} className='table-responsive dashboardtblScroll d-flex' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', marginLeft: '210px' }}>
          <div style={{ padding: '10px', width: '700px' }}>
            <div ref={formDiv} style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              {/* basic info */}
              <FormSection id='basic-info' title='BASIC INFO' keepOpen>
                <LabelVal label='Asset Name' value={get(viewObj, 'assetName', 'N/A')} />
                <div style={{ fontWeight: 800, margin: '10px 0' }}>Asset Photos :</div>
                <div>
                  <div className='py-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                    {isEmpty(profilePhotos) ? (
                      <div className='p-2' style={{ fontWeight: 800, borderRadius: '4px', background: '#00000014', width: '650px', textAlign: 'center' }}>
                        No Profile Photo found!
                      </div>
                    ) : (
                      // Render the list of profile photos
                      profilePhotos.map((d, index) => (
                        <AssetImage
                          onClick={() => {
                            setPreview([true, photoTypes.profile])
                            setImageOrder(index)
                          }}
                          readOnly
                          key={`asset-image-${d.assetPhoto}`}
                          url={d.assetPhoto}
                          randomValue
                        />
                      ))
                    )}
                  </div>
                </div>
                <LabelVal label='Asset Class Code' value={get(viewObj, 'assetClassCode', 'N/A')} />
                <LabelVal label='Asset Class' value={get(viewObj, 'assetClassName', 'N/A')} />
                <LabelVal label='QR Code' value={get(viewObj, 'qrCode', 'N/A')} />
                {isEmpty(qr) ? '' : <img alt='qr-code' src={qr} style={{ width: '140px', height: '140px', marginLeft: '-16px' }} />}
                <LabelVal label='Back Office Note' value={get(viewObj, 'backOfficeNote', 'N/A')} />
                {/* <Photos label='Exterior Photos' type={photoTypes.exterior} list={get(viewObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.exterior)} /> */}
              </FormSection>

              {/* asset group */}
              <FormSection id='asset-group' title='ASSET GROUP' keepOpen>
                <LabelVal label='Asset Group' value={get(viewObj, 'assetGroupName', 'N/A')} />
              </FormSection>

              {/* nameplate photos */}
              <FormSection id='nameplate-information' title='NAMEPLATE INFORMATION' keepOpen>
                <LabelVal label='Commission Date' value={checkDate(get(viewObj, 'commisiionDate', 'T'))} />
                {isEmpty(nameplateInformation) ? (
                  <></>
                ) : (
                  Object.keys(nameplateInformation).map(d => {
                    const val = isEmpty(get(nameplateInformation, [d, 'value'], null)) ? get(nameplateInformation, [d], '') : get(nameplateInformation, [d, 'value'], '')
                    const x = isEmpty(get(val, ['value'], null)) ? val : val['value']
                    return <LabelVal label={startCase(d)} value={x || 'N/A'} />
                  })
                )}
                <Photos label='Nameplate Photos' type={photoTypes.nameplate} list={get(viewObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.nameplate)} />
              </FormSection>
              {/* component */}
              <FormSection id={isTopLevelComponent ? 'sub-components' : 'top-level-component'} title={isTopLevelComponent ? "SUB-COMPONENTS (OCP's)" : 'TOP LEVEL COMPONENT'} keepOpen>
                {isEmpty(viewObj.woObAssetSublevelcomponentMapping) && isTopLevelComponent ? (
                  <div className='p-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                    No Sub Components (OCP's) Present !
                  </div>
                ) : isTopLevelComponent ? (
                  <>
                    <div className='text-bold text-sm mt-2'>Sub Components (OCP's)</div>
                    <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                      <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                        {subComponentColumns.slice(0, 4).map(({ label }) => (
                          <div key={label} className='text-bold' style={{ width: '25%' }}>
                            {label}
                          </div>
                        ))}
                      </div>
                      {viewObj.woObAssetSublevelcomponentMapping.map(d => (
                        <div className='d-flex align-items-center pb-0 px-2 pt-2' key={d.wolineSublevelcomponentMappingId}>
                          <div style={{ width: '25%' }}>
                            <ElipsisWithTootip title={get(d, 'sublevelcomponentAssetName', 'N/A') || 'N/A'} size={15} />
                          </div>
                          <div style={{ width: '25%' }}>
                            <ElipsisWithTootip title={get(d, 'sublevelcomponentAssetClassCode', 'N/A') || 'N/A'} size={8} />
                          </div>
                          <div style={{ width: '25%' }}>
                            <ElipsisWithTootip title={get(d, 'circuit', 'N/A') || 'N/A'} size={15} />
                          </div>
                          <div style={{ width: '25%' }}>
                            {/* <AssetImage onClick={() => viewSubCompImage(d)} readOnly url={!isEmpty(d.imageUrl) ? d.imageUrl : URL.noImageAvailable} width='42px' baseMargin='0px' randomValue /> */}
                            <FloatingButton onClick={() => handleSubComponentPhoto(d)} icon={<PhotoLibraryOutlined fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px', marginBottom: '8px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : isEmpty(viewObj.woObAssetToplevelcomponentMapping) ? (
                  <div className='p-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                    No Top Components Present !
                  </div>
                ) : (
                  <LabelVal label='Top Level Component' value={get(viewObj, 'woObAssetToplevelcomponentMapping', []).map(d => d.toplevelcomponentAssetName || 'N/A')} />
                )}
              </FormSection>
              {/* fed by */}
              {viewObj.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL && (
                <FormSection id='electrical-connections' title='ELECTRICAL CONNECTIONS' keepOpen>
                  {isEmpty(viewObj.woObAssetFedByMapping) ? (
                    <div className='p-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                      No Source Assets Present !
                    </div>
                  ) : (
                    viewObj.woObAssetFedByMapping.map(({ woObAssetFedById, parentAssetName, fedByUsageTypeId, length, style, viaSubcomponantAssetName, conductorTypeId, racewayTypeId, numberOfConductor, fedByViaSubcomponentAssetName }) => (
                      <div style={{ border: '1px solid #EAEAEA', borderRadius: '4px', width: '100%', marginBottom: '10px' }} key={woObAssetFedById}>
                        <div className='d-flex align-items-center p-2' style={{ borderBottom: '1px solid #EAEAEA' }}>
                          <LabelVal label='Top-Level Asset' value={parentAssetName} />
                        </div>
                        <div className='d-flex align-items-start p-2' style={{ borderBottom: '1px solid #EAEAEA' }}>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>OCP</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{fedByViaSubcomponentAssetName ? fedByViaSubcomponentAssetName : 'N/A'}</div>
                          </div>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>OCP Main</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{viaSubcomponantAssetName ? viaSubcomponantAssetName : 'N/A'}</div>
                          </div>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>Type</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{fedByUsageTypeId === enums.FED_BY_TYPE.NORMAL ? 'Normal' : fedByUsageTypeId === enums.FED_BY_TYPE.EMERGENCY ? 'Emergency' : 'N/A'}</div>
                          </div>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>Conductor Length</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{length ? length : 'N/A'}</div>
                          </div>
                        </div>
                        <div className='d-flex align-items-start p-2'>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>Conductor Material</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{handleConductorMaterial(conductorTypeId)}</div>
                          </div>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>Conductor Number</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{numberOfConductor ? numberOfConductor : 'N/A'}</div>
                          </div>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>Raceway Type</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{handleRacewayType(racewayTypeId)}</div>
                          </div>
                          <div style={{ width: '25%' }}>
                            <div style={{ fontWeight: 600, minWidth: 'auto' }}>Conductor Size</div>
                            <div style={{ wordWrap: 'break-word', marginLeft: 0 }}>{style ? style : 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <Photos label='Panel Schedule Photos' type={photoTypes.schedule} list={get(viewObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.schedule)} />
                </FormSection>
              )}
              {/* location */}
              <FormSection id='location' title='LOCATION' keepOpen>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <LabelVal label='Building' value={get(viewObj, 'tempMasterBuilding', 'N/A') || get(viewObj, 'building', '')} />
                  <LabelVal label='Floor' value={get(viewObj, 'tempMasterFloor', 'N/A') || get(viewObj, 'floor', '')} />
                  <LabelVal label='Room' value={get(viewObj, 'tempMasterRoom', 'N/A') || get(viewObj, 'room', '')} />
                  <LabelVal label='Section' value={get(viewObj, 'tempMasterSection', 'N/A') || get(viewObj, 'section', '')} />
                  <LabelVal label='Location' value={findEnumString('LOC', get(viewObj, 'location', 'N/A'))} />
                </div>
              </FormSection>
              {/* condition */}
              <FormSection id='condition' title='CONDITION' keepOpen>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <LabelVal label='Condition of Maintenance' value={handleMaintenanceType(viewObj?.maintenanceIndexType)} />
                  <LabelVal label='Operating Conditions' value={get(viewObj, 'conditionIndexTypeName', 'N/A')} />
                  <LabelVal label='Criticality' value={get(viewObj, 'criticalityIndexTypeName', 'N/A')} />
                  <LabelVal label='Panel Schedule' value={handlePanelType(viewObj?.tempAssetDetails.panelSchedule)} />
                  <LabelVal label='Arc Flash Label Valid' value={viewObj?.tempAssetDetails.arcFlashLabelValid === 1 ? 'Yes' : viewObj?.tempAssetDetails.arcFlashLabelValid === 2 ? 'No' : 'Missing'} />
                </div>

                {!isOnboarding &&
                  !isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.THERMAL_ANAMOLY)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='Thermal Anomaly' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Thermal Classification' value={findEnumString('THM', get(d, 'thermalClassificationId', 'N/A'))} inline />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                              <LabelVal label='Issue Location' value={get(d, 'thermalAnomalyLocation', 'N/A')} />
                              <LabelVal label="Sub-Component (OCP's)" value={get(d, 'thermalAnomalySubComponant', 'N/A')} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                              <LabelVal label='Measured Temp.' value={get(d, 'thermalAnomalyMeasuredTemps', 'N/A')} />
                              <LabelVal label='Reference Temp.' value={get(d, 'thermalAnomalyRefrenceTemps', 'N/A')} />
                              <LabelVal label='Difference Temp.' value={difference(+get(d, 'thermalAnomalyMeasuredTemps', 0), +get(d, 'thermalAnomalyRefrenceTemps', 0))} />
                            </div>

                            <LabelVal label='Severity criteria' value={findEnumString('TSC', get(d, 'thermalAnomalySeverityCriteria', 'N/A'))} />
                            <LabelVal label='Problem Description' value={get(d, 'thermalAnomalyProblemDescription', 'N/A')} />
                            <LabelVal label='Corrective Action' value={get(d, 'thermalAnomalyCorrectiveAction', 'N/A')} />

                            <div className='d-flex justify-content-between align-items-center' style={{ margin: '15px 0', width: '100%' }}>
                              <LabelVal label='IR Photos' inline />
                            </div>
                            <div style={{ margin: '10px 5px 10px 5px', width: '100%' }}>
                              {!isEmpty(get(viewObj, 'obIrImageLabelList', [])) &&
                                !isEmpty(get(d, 'wolineIssueImageList', [])) &&
                                get(d, 'wolineIssueImageList', []).map((issueImage, i) => {
                                  let matchedChips = []
                                  get(viewObj, 'obIrImageLabelList', []).forEach((virPhoto, j) => {
                                    if (virPhoto.irwoimagelabelmappingId === issueImage.irwoimagelabelmappingId && !virPhoto.isDeleted && (!isEmpty(virPhoto?.irImageLabel) || !isEmpty(virPhoto?.visualImageLabel))) {
                                      matchedChips.push(<Chip key={nanoid()} label={handleChipLable(virPhoto)} style={{ marginRight: '5px', marginBottom: '5px' }} />)
                                    }
                                  })
                                  return matchedChips.length > 0 ? <>{matchedChips}</> : null
                                })}
                            </div>

                            {/* Phase */}
                            {get(d, 'dynamicFieldJson', []) !== null && (
                              <TableContainer>
                                <Table aria-label='simple table' className={classes.table}>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Phase</TableCell>
                                      <TableCell align='left'>Circuit #</TableCell>
                                      <TableCell align='left'>
                                        Current Rating
                                        <br /> (AMPS)
                                      </TableCell>
                                      <TableCell align='left'>
                                        Current Draw <br />
                                        (AMPS)
                                      </TableCell>
                                      <TableCell align='left'>
                                        Voltage Drop <br />
                                        (Millivolts)
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {JSON.parse(get(d, 'dynamicFieldJson', []))?.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell component='th' scope='row'>
                                          {item.phase}
                                        </TableCell>
                                        <TableCell align='center'>{item.circuit}</TableCell>
                                        <TableCell align='left'>{item.current_draw_amp}</TableCell>
                                        <TableCell align='left'>{item.current_rating_amp}</TableCell>
                                        <TableCell align='left'>{item.voltage_drop_millivolts}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}

                            <Photos label='Before Photos' type={photoTypes.thermal} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.thermal && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                            <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                            <Photos label='After Photos' type={photoTypes.thermal} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.thermal && d.imageDurationTypeId === photoDuration.after)} isConditionBlock />
                          </div>
                        </FormSection>
                      </div>
                    ))}

                {!isOnboarding &&
                  !isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.ULTRASONIC_ANOMALY)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='Ultrasonic Anomaly' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Type of Anomaly' value={findEnumString('ULT', get(d, 'typeOfUltrasonicAnamoly', 'N/A'))} />
                            <LabelVal label='Location of Anomaly' value={get(d, 'locationOfUltrasonicAnamoly', 'N/A')} />
                            <LabelVal label='Size of Anomaly' value={get(d, 'sizeOfUltrasonicAnamoly', 'N/A')} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.ultrasonic} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.ultrasonic && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.ultrasonic} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.ultrasonic && d.imageDurationTypeId === photoDuration.after)} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}

                {!isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.COMPLIANCE)
                    .filter(c => c.issueCausedId === enums.ISSUE.CAUSED.NEC_VIOLATION)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='NEC Violation' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Code Violation' value={findEnumString('NEC', get(d, 'necViolation', 'N/A'))} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.nec} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.nec && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.nec} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.nec && d.imageDurationTypeId === photoDuration.after)} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}
                {!isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.COMPLIANCE)
                    .filter(c => c.issueCausedId === enums.ISSUE.CAUSED.OSHA_VIOLATION)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='OSHA Violation' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Code Violation' value={findEnumString('OSHA', get(d, 'oshaViolation', 'N/A'))} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.osha} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.osha && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.osha} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.osha && d.imageDurationTypeId === photoDuration.after)} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}
                {!isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.COMPLIANCE)
                    .filter(c => c.issueCausedId === enums.ISSUE.CAUSED.NFPA_70B_VIOLATION)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='NFPA 70B Violation' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='NFPA 70B Violation' value={findEnumString('NFPA', get(d, 'nfpa70BViolation', 'N/A'))} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.nfpa70b} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.nfpa70b && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.nfpa70b} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.nfpa70b && d.imageDurationTypeId === photoDuration.after)} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}
                {!isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.REPAIR)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='Repair Needed' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Issue Title' value={get(d, 'issueTitle', 'NA')} />
                            <LabelVal label='Issue Description' value={get(d, 'issueDescription', 'NA')} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.repair} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.repair && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.repair} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.repair && (d.imageDurationTypeId === photoDuration.after || d.imageDurationTypeId === null))} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}

                {!isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.REPLACE)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='Replacement Needed' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Issue Title' value={get(d, 'issueTitle', 'NA')} />
                            <LabelVal label='Issue Description' value={get(d, 'issueDescription', 'NA')} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.replace} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.replace && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.replace} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.replace && (d.imageDurationTypeId === photoDuration.after || d.imageDurationTypeId === null))} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}

                {!isEmpty(viewObj.wolineIssueList) &&
                  get(viewObj, 'wolineIssueList', [])
                    .filter(val => val.issueType === enums.ISSUE.TYPE.OTHER)
                    .map(d => (
                      <div key={d.id}>
                        <FormSection title='Other' keepOpen>
                          <div className='mb-2'>
                            <LabelVal label='Issue Title' value={get(d, 'issueTitle', 'NA')} />
                            <LabelVal label='Issue Description' value={get(d, 'issueDescription', 'NA')} />
                          </div>
                          <Photos label='Before Photos' type={photoTypes.other} duration={photoDuration.before} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.other && (d.imageDurationTypeId === photoDuration.before || d.imageDurationTypeId === null))} isConditionBlock />
                          <LabelVal label='Resolved ?' value={get(d, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                          <Photos label='After Photos' type={photoTypes.other} duration={photoDuration.after} list={get(d, 'wolineIssueImageList', []).filter(d => d.assetPhotoType === photoTypes.other && (d.imageDurationTypeId === photoDuration.after || d.imageDurationTypeId === null))} isConditionBlock />
                        </FormSection>
                      </div>
                    ))}
              </FormSection>
              {/* Estimate */}
              <FormSection id='maintenance-estimate' title='MAINTENANCE ESTIMATE' keepOpen>
                <LabelVal label='PM Plan' value={get(viewObj, 'planName', 'N/A') ?? 'N/A'} inline />
                {isEmpty(get(viewObj, 'pmEstimationList', [])) ? (
                  <div className='p-2 mt-2' style={{ fontWeight: 800, borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                    No PMs Found !
                  </div>
                ) : (
                  get(viewObj, 'pmEstimationList', []).map(d => <LabelVal label={get(d, 'title', '')} value={get(d, 'estimationTime', 'N/A')} />)
                )}
              </FormSection>
              {/* irscan photos */}
              {!isOnboarding && (
                <FormSection id='ir-scan-photos' title='IR SCAN PHOTOS' keepOpen>
                  {isEmpty(get(viewObj, 'obIrImageLabelList', [])) && (
                    <div className='p-2' style={{ fontWeight: 800, borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                      No IR Scan Photos !
                    </div>
                  )}
                  {!isEmpty(get(viewObj, 'obIrImageLabelList', [])) && (
                    <div className='d-flex' style={{ border: '1px solid #dee2e6', borderRadius: '4px 4px 0 0', background: '#00000008' }}>
                      <div style={{ width: '50%', fontWeight: 800, padding: '8px 16px', borderRight: '1px solid #dee2e6' }}>Visual Photo</div>
                      <div style={{ width: '50%', fontWeight: 800, padding: '8px 16px' }}>IR Photo</div>
                    </div>
                  )}
                  {!isEmpty(get(viewObj, 'obIrImageLabelList', [])) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
                      {get(viewObj, 'obIrImageLabelList', []).map((d, i) => (
                        <React.Fragment key={`vir-label-${i}`}>
                          <div className='pt-4 pb-2 d-flex flex-column justify-content-center align-items-center' style={{ border: 'solid #dee2e6', borderWidth: '0 1px 1px 1px' }}>
                            <AssetImage readOnly url={!isEmpty(d.visualImageLabel) ? d.visualImageLabelUrl : URL.noImageAvailable} key={`vs-image-${i}`} baseMargin onClick={() => setPreviewIr([true, i])} randomValue isIrPhotos />
                            <div className='text-bold'>{!isEmpty(d.visualImageLabel) ? get(d, 'visualImageLabel', '').split('.')[0] : 'Image Unavailable'}</div>
                          </div>
                          <div className='pt-4 pb-2 d-flex  flex-column justify-content-center align-items-center' style={{ border: 'solid #dee2e6', borderWidth: '0 1px 1px 0' }}>
                            <AssetImage readOnly url={!isEmpty(d.irImageLabelUrl) ? d.irImageLabelUrl : URL.noImageAvailable} key={`ir-image-${i}`} baseMargin onClick={() => setPreviewIr([true, i])} randomValue isIrPhotos />
                            <div className='text-bold'>{!isEmpty(d.irImageLabel) ? get(d, 'irImageLabel', '').split('.')[0] : 'Image Unavailable'}</div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </FormSection>
              )}
              {/* others */}
              <FormSection id='other' title='OTHER' keepOpen baseMargin>
                <LabelVal label='Other Comments' value={parseValue('otherNotes')} />
                <LabelVal label='Field Note' value={parseValue('fieldNote')} />
                {/* <Photos label='Additional Photos' type={photoTypes.additional} list={get(viewObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.additional)} /> */}
              </FormSection>
              {/* white space */}
              <div style={{ height: '175px' }}></div>
            </div>
          </div>
        </div>
      </div>
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={get(viewObj, 'assetImageList', []).filter(d => d.assetPhotoType === isPreviewOpen[1])} urlKey='assetPhoto' hideRotateButton />}
      {isPreviewOpenForIr[0] && <ImagePreview open={isPreviewOpenForIr[0]} onClose={() => setPreviewIr([false, 0])} images={get(viewObj, 'obIrImageLabelList', [])} urlKey='visualImageLabelUrl' isForIR={true} forIrIndex={isPreviewOpenForIr[1]} hideRotateButton />}
      {isPreviewOpenForSubCompImages && <ImagePreview open={isPreviewOpenForSubCompImages} onClose={() => setPreviewOpenForSubCompImages(false)} images={subCompImage} urlKey='imageUrl' hideRotateButton />}
      {isSubComponentPopupOpen && <SubComponentMultiplePhotoPop data={subComponentPhotoInfo} open={isSubComponentPopupOpen} onClose={() => setSubComponentPopupOpen(false)} readOnly />}
      {isPreviewConditionOpen[0] && <ImagePreview open={isPreviewConditionOpen[0]} onClose={() => setPreviewCondition([false, 0])} imageIndex={imageOrder} images={previewImageList} urlKey='assetPhoto' hideRotateButton />}
    </Drawer>
  )
}

export default View
