import React, { useState } from 'react'
import { FormAccordian } from 'components/Maintainance/components'
import { get, isEmpty } from 'lodash'
import { MinimalButton } from 'components/common/buttons'
import { LabelVal } from 'components/common/others'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'
import enums from 'Constants/enums'
import ImagePreview from 'components/common/image-preview'
import { actionScheduleOptions, inspectionStatusOptions, issueResolutionOptions, linkedIssueDetails, recommendedActionOptions, repairResolutionOptions, replacementResolutionOptions } from 'components/WorkOrders/maintenance-forms/utils'
import { typeOptions } from 'components/Issues/utlis'
import { resolutionTypes } from './utils'

const ViewResolutionDetail = ({ onPrevious, onClose, detailObj }) => {
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [imageOrder, setImageOrder] = useState(0)
  const isRepair = get(detailObj, 'issueDetails.inspectionType', 0) === enums.MWO_INSPECTION_TYPES.REPAIR
  const isReplace = get(detailObj, 'issueDetails.inspectionType', 0) === enums.MWO_INSPECTION_TYPES.REPLACE
  const isTroubleCall = get(detailObj, 'issueDetails.inspectionType', 0) === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK
  const showSolution = (isRepair || isReplace) && (get(detailObj, 'issueWolineDetails.repairResolution', '') || get(detailObj, 'replacementResolution', '')) !== 2
  const showFurtherDetails = (isRepair || isReplace) && (get(detailObj, 'issueWolineDetails.repairResolution', '') || get(detailObj, 'replacementResolution', '')) === 2

  const findEnumString = (type, value) => {
    if (!value) return 'N/A'
    let options = []
    if (type === 'RESOLTYPE') options = resolutionTypes
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

  const handleGetIssueType = val => {
    const type = typeOptions.find(q => q.value === val)
    if (!isEmpty(type)) {
      return type.label
    } else return 'N/A'
  }

  return (
    <>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 98px)', padding: '0 14px 14px 14px' }}>
        <div style={{ height: 'calc(100vh - 345px)', borderRadius: '4px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '10% 90%', rowGap: '24px' }}>
              <div className='text-bold'>Resolution Type</div>
              <div>{findEnumString('RESOLTYPE', get(detailObj, 'issueDetails.inspectionType', null))}</div>
              <div className='text-bold'>Asset Name</div>
              <div>{get(detailObj, 'issueDetails.selectedAssetName', 'N/A')}</div>
            </div>
            <div className='text-bold text-sm' style={{ marginTop: '8px' }}>
              Linked Issue(s)
            </div>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', width: '100%' }}>
              <div className='d-flex align-items-center p-2' style={{ borderBottom: '1px solid #d9d9d9' }}>
                {linkedIssueDetails.map(({ label, width }) => (
                  <div key={label} className='text-bold' style={{ width }}>
                    {label}
                  </div>
                ))}
              </div>
              {isEmpty(detailObj.issueDetails.issueTitle) ? (
                <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                  No Issues Linked !
                </div>
              ) : (
                <div className='d-flex align-items-start p-2'>
                  <div style={{ width: '50%' }}>{get(detailObj, 'issueDetails.issueTitle')}</div>
                  <div style={{ width: '50%' }}>{handleGetIssueType(get(detailObj, 'issueDetails.issueType', null))}</div>
                </div>
              )}
            </div>
          </div>

          <div className='d-flex'>
            <div style={{ width: '50%', marginRight: '10px' }}>
              <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '8px' }}>
                {isReplace && <LabelVal label='To be Replaced' value={get(detailObj, 'issueWolineDetails.replacedAssetName', 'N/A')} />}
                <LabelVal label='Problem Description' value={get(detailObj, 'issueDetails.problemDescription', 'N/A')} />
              </div>
              <FormAccordian title={!isTroubleCall ? 'Before Photos' : 'Photos'} style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg keepOpen>
                <div className='p-3 mb-2'>
                  <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                    {get(detailObj, 'issueWolineDetails.assetImageList', [])
                      .filter(d => d.imageDurationTypeId === 1)
                      .map((d, index) => d.imageDurationTypeId === 1 && <AssetImage onClick={() => (setPreview([true, 1]), setImageOrder(index))} readOnly key={`asset-image-${d.assetPhoto}`} url={d.assetPhoto} randomValue={1} />)}
                  </div>
                </div>
              </FormAccordian>
            </div>
            <div style={{ width: '50%' }}>
              <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '8px' }}>
                {isRepair && <LabelVal label='Repair Resolution' value={findEnumString('REPR', get(detailObj, 'issueWolineDetails.repairResolution', null))} />}
                {isReplace && <LabelVal label='Replacement Resolution' value={findEnumString('RPLR', get(detailObj, 'issueWolineDetails.replacementResolution', null))} />}
                {showSolution && <LabelVal label='Solution Description' value={get(detailObj, 'issueWolineDetails.solutionDescription', 'N/A')} />}
                {showFurtherDetails && <LabelVal label='Further Details' value={get(detailObj, 'issueWolineDetails.inspectionFurtherDetails', 'N/A')} />}

                {isTroubleCall && <LabelVal label='Issue Resolution' value={findEnumString('GIR', get(detailObj, 'issueWolineDetails.generalIssueResolution', null))} />}
                {/* {isTroubleCall && get(viewObj, 'recommendedAction', null) !== 4 && <LabelVal label='Recommended Action Schedule' value={findEnumString('RACS', get(viewObj, 'recommendedActionSchedule', null))} />} */}
              </div>
              {!isTroubleCall && (
                <FormAccordian title={!isTroubleCall ? 'After Photos' : 'Photos'} style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg keepOpen>
                  <div className='p-3 mb-2'>
                    <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                      {get(detailObj, 'issueWolineDetails.assetImageList', [])
                        .filter(d => d.imageDurationTypeId === 2)
                        .map((d, index) => d.imageDurationTypeId === 2 && <AssetImage onClick={() => (setPreview([true, 2]), setImageOrder(index))} readOnly key={`asset-image-${d.assetPhoto}`} url={d.assetPhoto} randomValue={1} />)}
                    </div>
                  </div>
                </FormAccordian>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <div>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='default' text='Previous' onClick={onPrevious} baseClassName='ml-2' />
        </div>
      </div>
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={get(detailObj, 'issueWolineDetails.assetImageList', []).filter(d => d.imageDurationTypeId === isPreviewOpen[1])} urlKey='assetPhoto' hideRotateButton />}
    </>
  )
}

export default ViewResolutionDetail
