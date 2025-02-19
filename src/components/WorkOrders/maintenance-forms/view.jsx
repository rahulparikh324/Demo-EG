import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTheme } from '@material-ui/core/styles'

import { FormTitle, FormAccordian } from 'components/Maintainance/components'
import { LabelVal } from 'components/common/others'
import ImagePreview from 'components/common/image-preview'

import { get, isEmpty } from 'lodash'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'
import { getFormatedDate } from 'helpers/getDateTime'
import { camelizeKeys } from 'helpers/formatters'
import enums from 'Constants/enums'

import { inspectionStatusOptions, repairResolutionOptions, replacementResolutionOptions, recommendedActionOptions, actionScheduleOptions, issueResolutionOptions, linkedIssueDetails } from './utils'
import { typeOptions } from 'components/Issues/utlis'

const View = ({ open, onClose, obj, isOnboarding }) => {
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [imageOrder, setImageOrder] = useState(0)
  const [expand, setExpand] = useState(false)
  const theme = useTheme()
  const viewObj = camelizeKeys(obj)
  const isRepair = viewObj.inspectionType === enums.MWO_INSPECTION_TYPES.REPAIR
  const isReplace = viewObj.inspectionType === enums.MWO_INSPECTION_TYPES.REPLACE
  const isTroubleCall = viewObj.inspectionType === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK
  const showSolution = (isRepair || isReplace) && (get(viewObj, 'formData.data.repairResolution', '') || get(viewObj, 'formData.data.replacementResolution', '')) !== 2
  const showFurtherDetails = (isRepair || isReplace) && (get(viewObj, 'formData.data.repairResolution', '') || get(viewObj, 'formData.data.replacementResolution', '')) === 2
  const linkedMainIssues = get(viewObj, 'formData.data.linkedIssues.mainIssueList', []) || []
  const linkedTempIssues = get(viewObj, 'formData.data.linkedIssues.tempIssueList', []) || []
  const linkedIssues = [...linkedMainIssues, ...linkedTempIssues]
  const [rendomValue, setRendomValue] = useState()

  const checkDate = date => {
    if (!date) return 'NA'
    return getFormatedDate(date.split('T')[0])
  }
  const findEnumString = (type, value) => {
    if (!value) return 'N/A'
    let options = []
    if (type === 'STATUS') options = inspectionStatusOptions
    if (type === 'REPR') options = repairResolutionOptions
    if (type === 'RPLR') options = replacementResolutionOptions
    if (type === 'RAC') options = recommendedActionOptions
    if (type === 'RACS') options = actionScheduleOptions
    if (type === 'GIR') options = issueResolutionOptions
    const data = options.find(d => d.value === value)
    if (!data) return 'N/A'
    return data.label
  }
  const getFedBy = () => <div>{isEmpty(get(viewObj, 'formData.data.woObAssetFedByMapping', [])) ? 'N/A' : get(viewObj, 'formData.data.woObAssetFedByMapping', []).map(d => <div key={d.parentAssetId}>{d.parentAssetName}</div>)}</div>
  const parseValue = label => {
    const data = get(viewObj, 'formData.data', {})
    const x = get(data, [label], '')
    if (!x) return 'N/A'
    return x
  }

  const handleGetIssueType = val => {
    const type = typeOptions.find(q => q.value === val)
    return type.label
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View Asset Info' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '450px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <LabelVal label='Asset Name' value={get(viewObj, 'assetName', '')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <LabelVal label='Asset Class Code' value={get(viewObj, 'assetClassCode', '')} />
              <LabelVal label='Asset Class' value={get(viewObj, 'assetClassName', 'N/A')} />
            </div>
            {isReplace && <LabelVal label='To be Replaced' value={get(viewObj, 'formData.data.replacedAssetName', null)} />}
            {!get(viewObj, 'formData.data.isWoLineForExisitingAsset', true) && <LabelVal label='Fed By' value={getFedBy()} />}
            <div style={{ borderRadius: '4px', marginTop: '8px', background: '#efefef' }}>
              <div className={`form-acc-title pointer py-2 px-3 flex-row justify-content-between align-items-center ${!expand ? 'd-flex' : 'd-none'}`} style={{ borderRadius: '4px' }} onClick={() => setExpand(!expand)}>
                <span className='acc-cont-title'>{`Room: ${get(viewObj, 'formData.data.room', 'N/A')}`}</span>
                {!expand && (
                  <span className='acc-cont-icon' style={{ background: theme.palette.primary.main }}>
                    <ExpandMoreIcon fontSize='small' onClick={() => setExpand(!expand)} style={{ color: '#fff' }} />
                  </span>
                )}
              </div>
              <div className={`active-${expand} ponter`}>
                <div style={{ display: 'grid', gridTemplateColumns: '17fr 13fr 2fr' }} className='px-3 mb-1 pt-2'>
                  <LabelVal label='Building' value={get(viewObj, 'formData.data.building', 'N/A')} inline />
                  <LabelVal label='Floor' value={get(viewObj, 'formData.data.floor', 'N/A')} inline />
                  <div className='mt-2'>
                    <span className='acc-cont-icon' style={{ background: theme.palette.primary.main }}>
                      <ExpandLessIcon fontSize='small' onClick={() => setExpand(!expand)} style={{ color: '#fff' }} />
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className='pl-3 pb-2'>
                  <LabelVal label='Room' value={get(viewObj, 'formData.data.room', 'N/A')} inline />
                  <LabelVal label='Section:' value={get(viewObj, 'formData.data.section', 'N/A')} inline />
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '8px' }}>
            <div className='text-bold text-sm'>Linked Issue(s)</div>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', width: '100%' }}>
              <div className='d-flex align-items-center p-2' style={{ borderBottom: '1px solid #d9d9d9' }}>
                {linkedIssueDetails.map(({ label, width }) => (
                  <div key={label} className='text-bold' style={{ width }}>
                    {label}
                  </div>
                ))}
              </div>
              {isEmpty(linkedIssues) ? (
                <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                  No Issues Linked !
                </div>
              ) : (
                linkedIssues.map(({ issueTitle, issueType }, index) => (
                  <div className='d-flex align-items-start p-2' key={index}>
                    <div style={{ width: '50%' }}>{issueTitle}</div>
                    <div style={{ width: '50%' }}>{handleGetIssueType(issueType)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '8px' }}>
            <LabelVal label='Problem Description' value={parseValue('problemDescription')} />
          </div>

          <FormAccordian title={!isTroubleCall ? 'Before Photos' : 'Photos'} style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg>
            <div className='p-3 mb-2'>
              <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                {get(viewObj, 'formData.data.assetImageList', [])
                  .filter(d => [d.assetPhotoType, d.imageDurationTypeId].includes(1))
                  .map((d, index) => (
                    <AssetImage onClick={() => (setPreview([true, 1]), setImageOrder(index))} readOnly key={`asset-image-${d.assetPhoto}`} url={`${d.assetPhoto}?value=${rendomValue}`} randomValue />
                  ))}
              </div>
            </div>
          </FormAccordian>

          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '8px' }}>
            {isRepair && <LabelVal label='Repair Resolution' value={findEnumString('REPR', get(viewObj, 'formData.data.repairResolution', null))} />}
            {isReplace && <LabelVal label='Replacement Resolution' value={findEnumString('RPLR', get(viewObj, 'formData.data.replacementResolution', null))} />}
            {showSolution && <LabelVal label='Solution Description' value={get(viewObj, 'formData.data.solutionDescription', 'N/A')} />}
            {showFurtherDetails && <LabelVal label='Further Details' value={get(viewObj, 'formData.data.inspectionFurtherDetails', 'N/A')} />}

            {isTroubleCall && <LabelVal label='Issue Resolution' value={findEnumString('GIR', get(viewObj, 'formData.data.generalIssueResolution', null))} />}
            {/* {isTroubleCall && get(viewObj, 'formData.data.recommendedAction', null) !== 4 && <LabelVal label='Recommended Action Schedule' value={findEnumString('RACS', get(viewObj, 'formData.data.recommendedActionSchedule', null))} />} */}
          </div>
          {!isTroubleCall && (
            <FormAccordian title={!isTroubleCall ? 'After Photos' : 'Photos'} style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg>
              <div className='p-3 mb-2'>
                <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                  {get(viewObj, 'formData.data.assetImageList', [])
                    .filter(d => d.imageDurationTypeId === 2)
                    .map((d, index) => d.imageDurationTypeId === 2 && <AssetImage onClick={() => (setPreview([true, 2]), setImageOrder(index))} readOnly key={`asset-image-${d.assetPhoto}`} url={`${d.assetPhoto}?value=${rendomValue}`} randomValue />)}
                </div>
              </div>
            </FormAccordian>
          )}
        </div>
      </div>
      {isPreviewOpen[0] && (
        <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={get(viewObj, 'formData.data.assetImageList', []).filter(d => [d.imageDurationTypeId, d.assetPhotoType].includes(isPreviewOpen[1]))} urlKey='assetPhoto' hideRotateButton reFetch={() => setRendomValue(Math.random())} />
      )}
    </Drawer>
  )
}

export default View
