import React, { useState, useRef } from 'react'
import { get, isEmpty, startCase } from 'lodash'
import { MinimalButton } from 'components/common/buttons'
import { ElipsisWithTootip, FormSection, LabelVal } from 'components/common/others'
import {
  AssetImage,
  SectionTab,
  codeComplianceOptions,
  fedByColumns,
  locationOptions,
  necVoilationOptions,
  oshaVoilationOptions,
  photoDuration,
  photoTypes,
  physicalConditionOptions,
  sectionNames,
  subComponentColumns,
  thermalAnomalyLocationOptions,
  thermalAnomalyRecommendationOptions,
  conductorTypesOptions,
  racewayTypesOptions,
  thermalClassificationOptions,
  maintenanceOptions,
  PanelOptions,
} from 'components/WorkOrders/onboarding/utils'
import enums from 'Constants/enums'
import QRCode from 'qrcode'
import { getFormatedDate } from 'helpers/getDateTime'
import ImagePreview from 'components/common/image-preview'
import { FloatingButton } from 'components/common/buttons'
import PhotoLibraryOutlined from '@material-ui/icons/PhotoLibraryOutlined'
import { useTheme } from '@material-ui/core/styles'
import { SubComponentMultiplePhotoPop } from 'components/WorkOrders/onboarding/components'

const ViewAssetDetails = ({ onClose, onPrevious, onNext, installWoLineDetailObj }) => {
  const theme = useTheme()
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [isPreviewOpenForIr, setPreviewIr] = useState([false, 0])
  const [isPreviewOpenForSubCompImages, setPreviewOpenForSubCompImages] = useState(false)
  const [subCompImage, setSubCompImage] = useState([])
  const [qr, setQR] = useState('')
  const scrollableDiv = useRef(null)
  const formDiv = useRef(null)
  const formSectionNames = sectionNames(true, get(installWoLineDetailObj, 'componentLevelTypeId', 0) === enums.COMPONENT_TYPE.SUB_COMPONENT)
  const [activeSectionName, setActiveSectionName] = useState(formSectionNames[0])
  const [imageOrder, setImageOrder] = useState(0)
  const [isSubComponentPopupOpen, setSubComponentPopupOpen] = useState(false)
  const [subComponentPhotoInfo, setSubComponentPhotoInfo] = useState({})
  const nameplateInformation = JSON.parse(get(installWoLineDetailObj, `formNameplateInfo`, '{}'))
  const flaggedRepairIssue = get(installWoLineDetailObj, 'wolineIssueList', []).find(d => d.issueType === enums.ISSUE.TYPE.REPAIR)
  const flaggedReplaceIssue = get(installWoLineDetailObj, 'wolineIssueList', []).find(d => d.issueType === enums.ISSUE.TYPE.REPLACE)
  const flaggedOtherIssue = get(installWoLineDetailObj, 'wolineIssueList', []).find(d => d.issueType === enums.ISSUE.TYPE.OTHER)

  if (get(installWoLineDetailObj, 'qrCode', null)) {
    QRCode.toDataURL(get(installWoLineDetailObj, 'qrCode', null))
      .then(url => setQR(url))
      .catch(err => console.error(err))
  }
  const checkDate = date => {
    if (!date) return 'N/A'
    return getFormatedDate(date.split('T')[0])
  }
  const findEnumString = (type, value) => {
    if (!value) return 'N/A'
    let options = []
    if (type === 'LOC') options = locationOptions
    if (type === 'PCA') options = thermalAnomalyLocationOptions
    if (type === 'REC') options = thermalAnomalyRecommendationOptions
    if (type === 'NEC') options = necVoilationOptions
    if (type === 'OSHA') options = oshaVoilationOptions
    if (type === 'THM') options = thermalClassificationOptions
    if (type === 'PAC') options = physicalConditionOptions
    if (type === 'CCP') options = codeComplianceOptions
    const data = options.find(d => d.value === value)
    if (!data) return 'N/A'
    return data.label
  }
  const parseValue = label => {
    const x = get(installWoLineDetailObj, [label], '')
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
  const Photos = ({ label, type, duration = 0, list = [], urlKey = 'assetPhoto' }) => {
    const handleClick = index => {
      setPreview([true, type])
      setImageOrder(index)
    }
    return (
      <div className='mt-3'>
        <div className='text-bold'>{label}</div>
        <div className='d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
          {isEmpty(list) ? (
            <div className='p-2' style={{ fontWeight: 800, borderRadius: '4px', background: '#00000014', width: '-webkit-fill-available', textAlign: 'center' }}>
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

  const profilePhotos = get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.profile)

  return (
    <>
      <div className='d-flex' id='style-1' style={{ height: 'calc(100% - 98px)', padding: '0 14px 14px 14px' }}>
        <div style={{ padding: '0 0 14px 14px' }}>
          <div style={{ padding: '16px', width: '200px', height: '100%', background: '#fff', borderRadius: '4px' }}>
            {formSectionNames.map((name, index) => (
              <SectionTab isActive={activeSectionName === name} onClick={() => changeSection(name)} key={name} title={name === 'SUB-COMPONENTS' ? "SUB-COMPONENTS (OCP'S)" : name} top={30 * index + 180} />
            ))}
          </div>
        </div>
        <div onScroll={handleScroll} ref={scrollableDiv} className='table-responsive dashboardtblScroll d-flex' id='style-1' style={{ height: 'calc(100% - 14px)' }}>
          <div style={{ padding: '0 10px 10px 10px', width: '100%' }}>
            <div ref={formDiv} style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              {/* basic info */}
              <FormSection id='basic-info' title='BASIC INFO' keepOpen>
                <LabelVal label='Asset Name' value={get(installWoLineDetailObj, 'assetName', 'N/A')} />
                <div style={{ fontWeight: 800, margin: '10px 0' }}>Asset Photos :</div>
                <div>
                  <div className='d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                    {/* {get(installWoLineDetailObj, 'assetImageList', [])
                      .filter(d => d.assetPhotoType === photoTypes.profile)
                      .map((d, index) => (
                        <AssetImage onClick={() => (setPreview([true, photoTypes.profile]), setImageOrder(index))} readOnly key={`asset-image-${d.assetPhoto}`} url={d.assetPhoto} randomValue />
                      ))} */}
                    {isEmpty(profilePhotos) ? (
                      <div className='p-2' style={{ fontWeight: 800, borderRadius: '4px', background: '#00000014', width: '-webkit-fill-available', textAlign: 'center' }}>
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
                <LabelVal label='Asset Class Code' value={get(installWoLineDetailObj, 'assetClassCode', 'N/A')} />
                <LabelVal label='Asset Class' value={get(installWoLineDetailObj, 'assetClassName', 'N/A')} />
                <LabelVal label='QR Code' value={get(installWoLineDetailObj, 'qrCode', 'N/A')} />
                {isEmpty(qr) ? '' : <img alt='qr-code' src={qr} style={{ width: '140px', height: '140px', marginLeft: '-16px' }} />}
                <LabelVal label='Back Office Note' value={get(installWoLineDetailObj, 'backOfficeNote', 'N/A')} />
                {/* <Photos label='Exterior Photos' type={photoTypes.exterior} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.exterior)} /> */}
              </FormSection>
              {/* nameplate photos */}
              <FormSection id='nameplate-information' title='NAMEPLATE INFORMATION' keepOpen>
                <LabelVal label='Commission Date' value={checkDate(get(installWoLineDetailObj, 'commisiionDate', 'T'))} />
                {isEmpty(nameplateInformation) ? (
                  <></>
                ) : (
                  Object.keys(nameplateInformation).map(d => {
                    const val = isEmpty(get(nameplateInformation, [d, 'value'], null)) ? get(nameplateInformation, [d], '') : get(nameplateInformation, [d, 'value'], '')
                    const x = isEmpty(get(val, ['value'], null)) ? val : val['value']
                    return <LabelVal key={d} label={startCase(d)} value={x || 'N/A'} />
                  })
                )}
                <Photos label='Nameplate Photos' type={photoTypes.nameplate} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.nameplate)} />
              </FormSection>
              {/* component */}
              <FormSection id='sub-components' title="SUB-COMPONENTS (OCP's)" keepOpen>
                {isEmpty(get(installWoLineDetailObj, 'woObAssetSublevelcomponentMapping', [])) ? (
                  <div className='p-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                    No Sub Components (OCP's) Present !
                  </div>
                ) : (
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
                      {installWoLineDetailObj.woObAssetSublevelcomponentMapping.map(d => (
                        <div className='d-flex align-items-center pb-0 px-2 pt-2' key={d.wolineSublevelcomponentMappingId}>
                          <div style={{ width: '25%' }}>
                            <ElipsisWithTootip title={get(d, 'sublevelcomponentAssetName', '') || 'N/A'} size={15} />
                          </div>
                          <div style={{ width: '25%' }}>
                            <ElipsisWithTootip title={get(d, 'sublevelcomponentAssetClassCode', '') || 'N/A'} size={8} />
                          </div>
                          <div style={{ width: '25%' }}>
                            <ElipsisWithTootip title={get(d, 'circuit', '') || 'N/A'} size={15} />
                          </div>
                          <div style={{ width: '25%' }}>
                            {/* <AssetImage onClick={() => viewSubCompImage(d)} readOnly url={!isEmpty(d.imageUrl) ? d.imageUrl : URL.noImageAvailable} width='42px' baseMargin='0px' randomValue /> */}
                            <FloatingButton onClick={() => handleSubComponentPhoto(d)} icon={<PhotoLibraryOutlined fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px', marginBottom: '8px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </FormSection>
              {/* fed by */}
              {get(installWoLineDetailObj, 'componentLevelTypeId', 0) === enums.COMPONENT_TYPE.TOP_LEVEL && (
                <FormSection id='electrical-connections' title='ELECTRICAL CONNECTIONS' keepOpen>
                  {isEmpty(get(installWoLineDetailObj, 'woObAssetFedByMapping', [])) ? (
                    <div className='p-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                      No Source Assets Present !
                    </div>
                  ) : (
                    installWoLineDetailObj.woObAssetFedByMapping.map(({ woObAssetFedById, parentAssetName, fedByUsageTypeId, length, style, viaSubcomponantAssetName, conductorTypeId, racewayTypeId, numberOfConductor, fedByViaSubcomponentAssetName }) => (
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
                  <Photos label='Panel Schedule Photos' type={photoTypes.schedule} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.schedule)} />
                </FormSection>
              )}
              {/* location */}
              <FormSection id='location' title='LOCATION' keepOpen>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <LabelVal label='Building' value={get(installWoLineDetailObj, 'building', '') || get(installWoLineDetailObj, 'tempBuilding', 'N/A')} />
                  <LabelVal label='Floor' value={get(installWoLineDetailObj, 'floor', '') || get(installWoLineDetailObj, 'tempFloor', 'N/A')} />
                  <LabelVal label='Room' value={get(installWoLineDetailObj, 'room', '') || get(installWoLineDetailObj, 'tempRoom', 'N/A')} />
                  <LabelVal label='Section' value={get(installWoLineDetailObj, 'section', '') || get(installWoLineDetailObj, 'tempSection', 'N/A')} />
                  <LabelVal label='Location' value={findEnumString('LOC', get(installWoLineDetailObj, 'location', 'N/A'))} />
                </div>
              </FormSection>
              {/* condition */}
              <FormSection id='condition' title='CONDITION' keepOpen>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <LabelVal label='Condition of Maintenance' value={handleMaintenanceType(installWoLineDetailObj?.maintenanceIndexType)} />
                  <LabelVal label='Operating Conditions' value={get(installWoLineDetailObj, 'conditionIndexTypeName', 'N/A') || 'N/A'} />
                  <LabelVal label='Criticality' value={get(installWoLineDetailObj, 'criticalityIndexTypeName', 'N/A') || 'N/A'} />
                  <LabelVal label='Panel Schedule' value={handlePanelType(installWoLineDetailObj?.tempAssetDetails.panelSchedule)} />
                  <LabelVal label='Arc Flash Label Valid' value={installWoLineDetailObj?.tempAssetDetails.arcFlashLabelValid === 1 ? 'Yes' : installWoLineDetailObj?.tempAssetDetails.arcFlashLabelValid === 2 ? 'No' : 'Missing'} />
                </div>
                {get(installWoLineDetailObj, 'flagIssueThermalAnamolyDetected', false) && (
                  <FormSection title='Thermal Anomaly' keepOpen>
                    <div className='mb-2'>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <LabelVal label='Thermal Classification' value={findEnumString('THM', parseValue('thermalClassificationId'))} />
                        <LabelVal label="Sub-Component (OCP's)" value={parseValue('thermalAnomalySubComponant')} />
                        <LabelVal label='Issue Location' value={parseValue('thermalAnomalyLocation')} />
                        <LabelVal label='Measured Temp.' value={parseValue('thermalAnomalyMeasuredTemps')} />
                        <LabelVal label='Reference Temp.' value={parseValue('thermalAnomalyRefrenceTemps')} />
                        <LabelVal label='Measured Amps' value={parseValue('thermalAnomalyMeasuredAmps')} />
                        <LabelVal label='Probable Cause' value={findEnumString('PCA', parseValue('thermalAnomalyProbableCause'))} />
                        <LabelVal label='Recommendation' value={findEnumString('REC', parseValue('thermalAnomalyRecommendation'))} />
                        <LabelVal label='Additional IR Photo #' value={parseValue('thermalAnomalyAdditionalIrPhoto')} />
                      </div>
                      <Photos label='Before Photos' type={photoTypes.thermal} duration={photoDuration.before} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.thermal && d.imageDurationTypeId === photoDuration.before)} />
                      <LabelVal label='Resolved ?' value={get(installWoLineDetailObj, 'isThermalAnomalyResolved', false) ? 'Yes' : 'No'} />
                      <Photos label='After Photos' type={photoTypes.thermal} duration={photoDuration.after} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.thermal && d.imageDurationTypeId === photoDuration.after)} />
                    </div>
                  </FormSection>
                )}
                {get(installWoLineDetailObj, 'flagIssueNecViolation', false) && (
                  <FormSection title='NEC Violation' keepOpen>
                    <div className='mb-2'>
                      <LabelVal label='Code Violation' value={findEnumString('NEC', parseValue('necViolation'))} />
                    </div>
                    <Photos label='Before Photos' type={photoTypes.nec} duration={photoDuration.before} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.nec && d.imageDurationTypeId === photoDuration.before)} />
                    <LabelVal label='Resolved ?' value={get(installWoLineDetailObj, 'isNecViolationResolved', false) ? 'Yes' : 'No'} />
                    <Photos label='After Photos' type={photoTypes.nec} duration={photoDuration.after} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.nec && d.imageDurationTypeId === photoDuration.after)} />
                  </FormSection>
                )}
                {get(installWoLineDetailObj, 'flagIssueOshaViolation', false) && (
                  <FormSection title='OSHA Violation' keepOpen>
                    <div className='mb-2'>
                      <LabelVal label='Code Violation' value={findEnumString('OSHA', parseValue('oshaViolation'))} />
                    </div>
                    <Photos label='Before Photos' type={photoTypes.osha} duration={photoDuration.before} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.osha && d.imageDurationTypeId === photoDuration.before)} />
                    <LabelVal label='Resolved ?' value={get(installWoLineDetailObj, 'isOshaViolationResolved', false) ? 'Yes' : 'No'} />
                    <Photos label='After Photos' type={photoTypes.osha} duration={photoDuration.after} list={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === photoTypes.osha && d.imageDurationTypeId === photoDuration.after)} />
                  </FormSection>
                )}
                {!isEmpty(flaggedRepairIssue) && (
                  <FormSection title='Repair Needed' keepOpen>
                    <div className='mb-2'>
                      <LabelVal label='Issue Title' value={get(flaggedRepairIssue, 'issueTitle', 'NA')} />
                      <LabelVal label='Issue Description ' value={get(flaggedRepairIssue, 'issueDescription', 'NA')} />
                    </div>
                    <Photos label='Before Photos' type={photoTypes.repair} duration={photoDuration.before} list={get(flaggedRepairIssue, 'wolineIssueImageList', []).filter(d => d.imageDurationTypeId === photoDuration.before)} urlKey='imageFileName' />
                    <LabelVal label='Resolved ?' value={get(flaggedRepairIssue, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                    <Photos label='After Photos' type={photoTypes.repair} duration={photoDuration.after} list={get(flaggedRepairIssue, 'wolineIssueImageList', []).filter(d => d.imageDurationTypeId === photoDuration.after)} urlKey='imageFileName' />
                  </FormSection>
                )}
                {!isEmpty(flaggedReplaceIssue) && (
                  <FormSection title='Replacement Needed' keepOpen>
                    <div className='mb-2'>
                      <LabelVal label='Issue Title' value={get(flaggedReplaceIssue, 'issueTitle', 'NA')} />
                      <LabelVal label='Issue Description ' value={get(flaggedReplaceIssue, 'issueDescription', 'NA')} />
                    </div>
                    <Photos label='Before Photos' type={photoTypes.repair} duration={photoDuration.before} list={get(flaggedReplaceIssue, 'wolineIssueImageList', []).filter(d => d.imageDurationTypeId === photoDuration.before)} urlKey='imageFileName' />
                    <LabelVal label='Resolved ?' value={get(flaggedReplaceIssue, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                    <Photos label='After Photos' type={photoTypes.repair} duration={photoDuration.after} list={get(flaggedReplaceIssue, 'wolineIssueImageList', []).filter(d => d.imageDurationTypeId === photoDuration.after)} urlKey='imageFileName' />
                  </FormSection>
                )}
                {!isEmpty(flaggedOtherIssue) && (
                  <FormSection title='Other' keepOpen>
                    <div className='mb-2'>
                      <LabelVal label='Issue Title' value={get(flaggedOtherIssue, 'issueTitle', 'NA')} />
                      <LabelVal label='Issue Description ' value={get(flaggedOtherIssue, 'issueDescription', 'NA')} />
                    </div>
                    <Photos label='Before Photos' type={photoTypes.other} duration={photoDuration.before} list={get(flaggedOtherIssue, 'wolineIssueImageList', []).filter(d => d.imageDurationTypeId === photoDuration.before)} urlKey='imageFileName' />
                    <LabelVal label='Resolved ?' value={get(flaggedOtherIssue, 'isIssueLinkedForFix', false) ? 'Yes' : 'No'} />
                    <Photos label='After Photos' type={photoTypes.other} duration={photoDuration.after} list={get(flaggedOtherIssue, 'wolineIssueImageList', []).filter(d => d.imageDurationTypeId === photoDuration.after)} urlKey='imageFileName' />
                  </FormSection>
                )}
              </FormSection>
              {/* others */}
              <FormSection id='other' title='OTHER' keepOpen baseMargin>
                <LabelVal label='Other Comments' value={parseValue('otherNotes')} />
                <LabelVal label='Field Note' value={parseValue('fieldNote')} />
              </FormSection>
              {/* white space */}
              <div style={{ height: '175px' }}></div>
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <div>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='default' text='Previous' onClick={onPrevious} baseClassName='ml-2' />
        </div>
        <MinimalButton variant='contained' color='primary' text='Next' onClick={onNext} />
      </div>
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={get(installWoLineDetailObj, 'assetImageList', []).filter(d => d.assetPhotoType === isPreviewOpen[1])} urlKey='assetPhoto' hideRotateButton />}
      {isPreviewOpenForIr[0] && <ImagePreview open={isPreviewOpenForIr[0]} onClose={() => setPreviewIr([false, 0])} images={get(installWoLineDetailObj, 'obIrImageLabelList', [])} urlKey='visualImageLabelUrl' isForIR={true} forIrIndex={isPreviewOpenForIr[1]} hideRotateButton />}
      {isPreviewOpenForSubCompImages && <ImagePreview open={isPreviewOpenForSubCompImages} onClose={() => setPreviewOpenForSubCompImages(false)} images={subCompImage} urlKey='imageUrl' hideRotateButton />}
      {isSubComponentPopupOpen && <SubComponentMultiplePhotoPop data={subComponentPhotoInfo} open={isSubComponentPopupOpen} onClose={() => setSubComponentPopupOpen(false)} readOnly />}
    </>
  )
}

export default ViewAssetDetails
