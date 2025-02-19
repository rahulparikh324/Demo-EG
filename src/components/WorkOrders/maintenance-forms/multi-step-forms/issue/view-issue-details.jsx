import React, { useState } from 'react'
import { get } from 'lodash'
import { MinimalButton } from 'components/common/buttons'
import { StatusComponent } from 'components/common/others'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'
import ImagePreview from 'components/common/image-preview'
import { getChip, priorityOptions, typeOptions } from 'components/Issues/utlis'
import { CheckBox } from '@material-ui/icons'
import { NEW_ISSUE_ASSET_TYPE, resolutionTypes } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'

const ViewIssueDetails = ({ onClose, onNext, detailObj, isAssetDetails }) => {
  const isVerifyInField = get(detailObj, 'issueDetails.newIssueAssetType', 0) === NEW_ISSUE_ASSET_TYPE.VERIFY_ON_FIELD ? true : false
  const { color: priorityColor, label: priorityLabel } = getChip(get(detailObj, 'issueDetails.priority', 0), priorityOptions)
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [imageOrder, setImageOrder] = useState(0)
  const [randomValue, setRandomValue] = useState(Math.random())
  return (
    <>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 98px)', padding: `${isVerifyInField ? '14px' : '0'} 14px 14px 14px` }}>
        <div style={{ background: '#fff', height: 'calc(100vh - 258px)', borderRadius: '4px', padding: '20px', minHeight: '450px' }}>
          {isVerifyInField && (
            <div className='d-flex align-items-center' style={{ marginBottom: '24px' }}>
              <CheckBox color='primary' size='small' checked={true} disabled={true} /> <div className='text-bold ml-2'>Verify In Field</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '10% 90%', rowGap: '24px' }}>
            <div className='text-bold'>Type</div>
            <div>{findEnumString('ISSUE', get(detailObj, 'issueDetails.issueType', null))}</div>
            <div className='text-bold'>Resolution Type</div>
            <div>{findEnumString('RESOLUTION', get(detailObj, 'issueDetails.inspectionType', null))}</div>
            <div className='text-bold'>Linked Asset</div>
            <div>
              {isAssetDetails ? (
                detailObj.issueDetails?.selectedAssetName
              ) : get(detailObj, 'issueDetails.selectedAssetId', null) ? (
                get(detailObj, 'issueDetails.isSelectedAssetIdMain', false) ? (
                  <div onClick={e => window.open(`/assets/details/${detailObj.issueDetails.selectedAssetId}`)} className='text-bold' style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                    {detailObj.issueDetails.selectedAssetName}
                  </div>
                ) : (
                  detailObj.issueDetails.selectedAssetName
                )
              ) : (
                'NA'
              )}
            </div>
            <div className='text-bold'>Title</div>
            <div>{get(detailObj, 'issueDetails.issueTitle', 'N/A')}</div>
            <div className='text-bold'>Description</div>
            <div>{get(detailObj, 'issueDetails.problemDescription', 'N/A')}</div>
            <div className='text-bold'>Priority</div>
            <div>
              <StatusComponent color={priorityColor} label={priorityLabel} size='medium' />
            </div>
            <div className='text-bold'>Photo(s)</div>
            <div className='pb-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
              {get(detailObj, 'issueWolineDetails.assetImageList', [])
                .filter(d => d.imageDurationTypeId === 1)
                .map((d, index) => (
                  <AssetImage readOnly onClick={() => (setPreview([true, 1]), setImageOrder(index))} key={`asset-image-${d.woonboardingassetsimagesmappingId}`} url={d.assetPhoto} randomValue />
                ))}
            </div>
          </div>
          {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={get(detailObj, 'issueWolineDetails.assetImageList', []).filter(d => d.imageDurationTypeId === isPreviewOpen[1])} urlKey='assetPhoto' hideRotateButton={true} reFetch={() => setRandomValue(Math.random())} />}
        </div>
      </div>
      {!isVerifyInField && (
        <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='primary' text='Next' onClick={onNext} loadingText='Next' />
        </div>
      )}
    </>
  )
}

export default ViewIssueDetails

const findEnumString = (type, value) => {
  if (!value) return 'N/A'
  let options = []
  if (type === 'ISSUE') options = typeOptions
  if (type === 'RESOLUTION') options = resolutionTypes
  const data = options.find(d => d.value === value)
  if (!data) return 'N/A'
  return data.label
}
