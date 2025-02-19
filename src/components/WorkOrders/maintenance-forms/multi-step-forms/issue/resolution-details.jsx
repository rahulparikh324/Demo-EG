import React, { useContext, useState, useRef } from 'react'

import $ from 'jquery'

import usePostData from 'hooks/post-data'
import useFetchData from 'hooks/fetch-data'
import issueContext from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/context'

import { FormAccordian } from 'components/Maintainance/components'
import { LabelVal, PhotosSection } from 'components/common/others'
import { MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'
import { LinkedIssueTable, validateResolutionDetails } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'
import { MinimalButton, FloatingButton } from 'components/common/buttons'
import DialogPrompt from 'components/DialogPrompt'
import CreateFedBy from 'components/WorkOrders/onboarding/create-fed-by'

import { filter, get, has, isEmpty, set } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { camelizeKeys } from 'helpers/formatters'

import enums from 'Constants/enums'
import { repairResolutionOptions, replacementResolutionOptions, issueResolutionOptions } from 'components/WorkOrders/maintenance-forms/utils'
// import { priorityOptions, typeOptions } from 'components/Issues/utlis.js'
import { photoDuration } from 'components/WorkOrders/onboarding/utils.js'
import { validateReceivedPhoto } from 'components/WorkOrders/maintenance-forms/multi-step-forms/common/utils.js'
import { makePayload } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/make-payload'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import issues from 'Services/issues'
import assetInfo from 'Services/assets'

import AddIcon from '@material-ui/icons/Add'
import { useTheme } from '@material-ui/core/styles'
import heic2any from 'heic2any'

const ResolutionDetails = ({ onPrevious, onClose, workOrderID, afterSubmit, classCodeOptions, isQuote }) => {
  const theme = useTheme()
  const {
    data: { issueDetails, assetDetails },
    updateIssueDetails,
  } = useContext(issueContext)
  // console.log('asset details ', assetDetails)
  const isRepair = get(issueDetails, 'resolutionType.value', 0) === enums.MWO_INSPECTION_TYPES.REPAIR
  const isReplace = get(issueDetails, 'resolutionType.value', 0) === enums.MWO_INSPECTION_TYPES.REPLACE
  const isGeneral = get(issueDetails, 'resolutionType.value', 0) === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK
  const showSolution = (isRepair || isReplace) && (get(issueDetails, 'repairResolution.value', '') || get(issueDetails, 'replacementResolution.value', '')) !== 2
  const showFurtherDetails = (isRepair || isReplace) && (get(issueDetails, 'repairResolution.value', '') || get(issueDetails, 'replacementResolution.value', '')) === 2
  const [uploadingPhotoType, setUploadingPhotoType] = useState({})
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [showAssetChangeWarning, setAssetChangeWarning] = useState(false)
  const [changedAsset, setChangedAsset] = useState({})
  const uploadRef = useRef(null)
  const [isSaving, setIsSaving] = useState(0)
  const isEdit = get(issueDetails, 'isEdit', false) === true ? true : false
  const [isCreateAssetOpen, setCreateAssetOpen] = useState(false)
  const [repleceAssetOptions, setReplaceAssetOptions] = useState([])
  //
  const [errors, setErrors] = useState({})
  const formatAssetOptions = d => {
    const mainList = get(d, 'data.mainAssets', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
    const tempList = get(d, 'data.tempAssets', []).map(d => ({ ...d, label: d.assetName, value: d.woonboardingassetsId, isTemp: true }))
    const isExistingAsset = issueDetails.isAnExistingIssue || get(issueDetails, 'asset.type', '') === 'ADD_EXISTING'
    if (isExistingAsset) {
      const asset = get(issueDetails, 'asset.linkedAsset.isTemp', false) ? tempList.find(d => d.value === assetDetails.woonboardingassetsId) : mainList.find(d => d.value === assetDetails.assetId)
      asset.label = assetDetails.assetName
      asset.assetName = assetDetails.assetName
      if (isReplace && issueDetails.isEdit) {
        const asset = get(issueDetails, 'asset.replacedByAsset.isTemp', false) ? tempList.find(d => d.value === issueDetails.replacedAssetId) : mainList.find(d => d.value === issueDetails.replacedAssetId)
        if (!isEmpty(asset)) {
          issueDetails.replacedByAsset = asset
        }
      }
    } else tempList.push(get(issueDetails, 'asset.linkedAsset', {}))
    setReplaceAssetOptions([...tempList, ...mainList])
    return [...tempList, ...mainList]
  }
  const { loading: assetOptionsLoading, data: assetOptions } = useFetchData({ fetch: issues.getAssetList, payload: { woId: workOrderID }, formatter: d => formatAssetOptions(camelizeKeys(d)), defaultValue: [] })
  const postError = () => {
    onClose()
  }
  const postSuccess = d => {
    onClose()
    afterSubmit()
  }
  const { loading: isProcessing, mutate } = usePostData({ executer: isEdit ? issues.multiStep.update : issues.multiStep.add, postError, postSuccess, message: { success: 'Work Order line added successfully !', error: 'Error adding Work Order line, Please Try again' } })
  // photo handlers
  // const addPhoto = async e => {
  //   e.preventDefault()
  //   setPhotoUploading(true)

  //   // Clone the target to avoid React's synthetic event pooling issues
  //   const inputElement = e.target
  //   const files = Array.from(inputElement.files)

  //   if (files.length === 0) {
  //     return // No files selected
  //   }

  //   const formData = new FormData()
  //   const validExtensions = ['heic', 'heif', 'jpg', 'jpeg', 'png', 'gif', 'eps']
  //   let hasImgError = false

  //   for (const [index, file] of files.entries()) {
  //     const extension = file.name.split('.').slice(-1).pop().toLowerCase()

  //     // Validate file extension
  //     if (!validExtensions.includes(extension)) {
  //       Toast.error('Invalid Image format!')
  //       hasImgError = true
  //       continue
  //     }

  //     try {
  //       let processedFile = file

  //       // Convert HEIC/HEIF to JPG using heic2any
  //       if (['heic', 'heif'].includes(extension)) {
  //         const blob = await heic2any({
  //           blob: file,
  //           toType: 'image/jpeg',
  //         })

  //         processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
  //       }

  //       formData.append('file', processedFile)

  //       const reader = new FileReader()
  //       reader.onload = () => {
  //         // Upload the photo after the last file is processed and no errors exist
  //         if (!hasImgError && index === files.length - 1) {
  //           uploadPhoto(formData)
  //         }
  //       }
  //       reader.readAsDataURL(processedFile)
  //     } catch (error) {
  //       console.error('Error converting HEIC/HEIF to JPG:', error)
  //       Toast.error('Failed to process HEIC/HEIF format!')
  //       hasImgError = true
  //     }
  //   }

  //   // Reset the input field safely after processing
  //   if (inputElement && 'value' in inputElement) {
  //     inputElement.value = null
  //   }
  // }

  const addPhoto = e => {
    e.preventDefault()
    const files = Array.from(e.target.files)
    const formData = new FormData()

    let hasImgError = false
    const validExtensions = ['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF', 'HEIC', 'HEIF', 'heic', 'heif']
    files.forEach((file, index) => {
      const extension = file.name.split('.').slice(-1).pop().toLowerCase()

      if (!validExtensions.includes(extension)) {
        Toast.error('Invalid Image format!')
        hasImgError = true
        return
      }
      formData.append('file', file)
      const reader = new FileReader()
      reader.onload = d => {
        if (!hasImgError && index === files.length - 1) {
          uploadPhoto(formData)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = null
  }

  const handleUpload = ({ type, duration }) => {
    setUploadingPhotoType({ type, duration })
    uploadRef.current && uploadRef.current.click()
  }
  const uploadPhoto = async formData => {
    setPhotoUploading(true)
    try {
      const res = await onBoardingWorkorder.uploadPhoto(formData)
      if (res.success) {
        if (!isEmpty(res.data.imageList)) {
          const imgList = res.data.imageList.map(d => {
            return {
              url: d.fileUrl,
              imageFileNameUrl: d.fileUrl,
              imageFileName: d.filename,
              isDeleted: false,
              imageThumbnailFileNameUrl: d.thumbnailFileUrl,
              imageThumbnailFileName: d.thumbnailFilename,
              imageDurationTypeId: uploadingPhotoType.duration,
              assetPhotoType: uploadingPhotoType.type,
            }
          })
          updateIssueDetails('issueDetails', { ...issueDetails, issueImageList: [...get(issueDetails, 'issueImageList', []), ...imgList] })
        } else Toast.error(res.message)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setPhotoUploading(false)
  }
  const removeImage = image => {
    const issueImageList = [...get(issueDetails, 'issueImageList', [])]
    const imageToDelete = issueImageList.find(img => img.imageThumbnailFileName === image.imageThumbnailFileName)
    if (isEmpty(imageToDelete.woonboardingassetsimagesmappingId)) {
      const actualIssueImageList = issueImageList.filter(e => e !== imageToDelete)
      updateIssueDetails('issueDetails', { ...issueDetails, issueImageList: actualIssueImageList })
    } else {
      imageToDelete.isDeleted = true
      updateIssueDetails('issueDetails', { ...issueDetails, issueImageList })
    }
  }
  //asset change
  const handleAssetChange = (key, asset) => {
    if (asset.assetId !== get(issueDetails, 'asset.linkedAsset.value', '')) {
      setAssetChangeWarning(true)
      setChangedAsset(asset)
    }
  }
  const onContinueAfterAssetChange = async () => {
    const asset = { type: changedAsset.value === 'TEMP-ID' ? 'CREATE_NEW' : 'ADD_EXISTING', linkedAsset: changedAsset }
    updateIssueDetails('issueDetails', { ...issueDetails, asset })
    try {
      $('#pageLoading').show()
      const assetId = get(asset, 'type', '') === 'ADD_EXISTING' && !get(asset, 'linkedAsset.isTemp', false) ? get(asset, 'linkedAsset.assetId', null) : null
      const woonboardingassetsId = get(asset, 'linkedAsset.isTemp', false) ? get(asset, 'linkedAsset.woonboardingassetsId', null) : null
      const assetDetails = await assetInfo.temp.getDetails({ assetId, woonboardingassetsId, woId: workOrderID })
      updateIssueDetails('other', get(assetDetails, 'data', {}))
      onPrevious()
      $('#pageLoading').hide()
    } catch (error) {
      $('#pageLoading').hide()
    }
  }
  //
  const validateForm = async status => {
    const isValid = await validateResolutionDetails({ linkedAsset: get(issueDetails, 'asset.linkedAsset.value', null) || '', issueDescription: get(issueDetails, 'issueDescription', '') || '', replacedByAsset: get(issueDetails, 'replacedByAsset.value', '') }, isReplace)
    setErrors(isValid)
    if (isValid === true) {
      setIsSaving(status)
      const payload = makePayload({ issueDetails, assetDetails, woId: workOrderID, status })
      mutate(payload)
    }
  }
  const handleFocus = d => setErrors({ ...errors, [d]: null })
  const handleInputChange = (key, value) => {
    const data = structuredClone(issueDetails)
    set(data, key, value)
    updateIssueDetails('issueDetails', data)
  }

  const createAsset = async id => {
    try {
      const assetNameOpts = await issues.getAssetList({ woId: workOrderID })
      const mainList = get(assetNameOpts, 'data.mainAssets', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
      const tempList = get(assetNameOpts, 'data.tempAssets', []).map(d => ({ ...d, label: d.assetName, value: d.woonboardingassetsId, isTemp: true }))
      const options = [...mainList, ...tempList]
      const newAsset = options.find(item => item.value === id)
      handleInputChange('replacedByAsset', newAsset)
      setReplaceAssetOptions([...mainList, ...tempList])
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - 98px)`, padding: '0 14px 14px 14px' }}>
        <div style={{ padding: '6px 14px 14px 14px', background: '#fff', borderRadius: '4px', marginBottom: '14px' }}>
          <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
          <LabelVal label='Resolution Type' value={get(issueDetails, 'resolutionType.label', 'N/A')} inline />
          <MinimalAutoComplete
            isLoading={assetOptionsLoading}
            placeholder='Select an asset'
            value={get(issueDetails, 'asset.linkedAsset', null) || null}
            onChange={v => handleAssetChange('asset.linkedAsset', v)}
            options={assetOptions}
            w={100}
            label='Asset'
            baseStyles={{ zIndex: '5', marginTop: '8px' }}
            isRequired
            error={errors.linkedAsset}
            onFocus={() => handleFocus('linkedAsset')}
            isDisabled={issueDetails.isAnExistingIssue}
          />
          <LinkedIssueTable title={get(issueDetails, 'issueTitle', 'N/A')} type={get(issueDetails, 'issueType.label', 'N/A')} />
        </div>
        <div className='d-flex'>
          <div style={{ padding: '14px', background: '#fff', borderRadius: '4px', marginBottom: '14px', width: isGeneral ? '100%' : '50%' }}>
            <div className='d-flex'>
              {isReplace && (
                <>
                  <MinimalAutoComplete
                    value={get(issueDetails, 'replacedByAsset', '')}
                    onChange={v => handleInputChange('replacedByAsset', v)}
                    options={filter(repleceAssetOptions, obj => obj.value !== 'TEMP-ID' && obj.value !== get(issueDetails, 'asset.linkedAsset.value', null))}
                    label='To be Replaced'
                    placeholder='Select Asset'
                    w={100}
                    error={errors.replacedByAsset}
                    isClearable
                    onFocus={() => setErrors({ ...errors, replacedByAsset: null })}
                    isRequired
                  />
                  <FloatingButton onClick={() => setCreateAssetOpen(true)} icon={<AddIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px', borderRadius: '8px' }} />
                </>
              )}
            </div>
            <MinimalTextArea
              rows={3}
              value={get(issueDetails, 'issueDescription', '') || ''}
              onChange={e => handleInputChange('issueDescription', e.target.value)}
              placeholder='Add description ..'
              label='Problem Description'
              w={100}
              baseStyles={{ margin: 0 }}
              isRequired
              error={errors.issueDescription}
              onFocus={() => handleFocus('issueDescription')}
            />
            {isGeneral && <MinimalAutoComplete value={get(issueDetails, 'issueResolution', '')} onChange={v => handleInputChange('issueResolution', v)} options={issueResolutionOptions} label='Resolution' placeholder='Select Resolution' w={100} />}
          </div>
          {!isGeneral && (
            <div style={{ padding: '14px', background: '#fff', borderRadius: '4px', marginBottom: '14px', width: '50%', marginLeft: '14px' }}>
              {isRepair && (
                <MinimalAutoComplete value={get(issueDetails, 'repairResolution', '')} onChange={v => handleInputChange('repairResolution', v)} options={repairResolutionOptions} label='Repair Resolution' placeholder='Select Resolution' w={100} error={errors.repairResolution} onFocus={() => setErrors({ ...errors, repairResolution: null })} />
              )}
              {isReplace && <MinimalAutoComplete value={get(issueDetails, 'replacementResolution', '')} onChange={v => handleInputChange('replacementResolution', v)} options={replacementResolutionOptions} label='Replacement Resolution' placeholder='Select Resolution' w={100} />}
              {showSolution && <MinimalTextArea rows={3} value={get(issueDetails, 'solutionDescription', '') || ''} onChange={e => handleInputChange('solutionDescription', e.target.value)} placeholder='Describe here ...' label='Please describe the Solution' w={100} />}
              {showFurtherDetails && <MinimalTextArea rows={3} value={get(issueDetails, 'inspectionFurtherDetails', '') || ''} onChange={e => handleInputChange('inspectionFurtherDetails', e.target.value)} placeholder='Details ...' label='Please provide further details' w={100} />}
            </div>
          )}
        </div>
        <div className='d-flex'>
          <div style={{ width: isGeneral ? '100%' : '50%' }}>
            <FormAccordian title={`${isGeneral ? '' : 'Before '} Photo(s)`} style={{ borderRadius: '4px', background: '#fff', marginBottom: '14px' }} bg keepOpen>
              <div className='pt-0 pb-3 px-3'>
                <PhotosSection urlKey='imageFileNameUrl' images={get(issueDetails, 'issueImageList', [])} onRemove={removeImage} uploadingPhotoType={uploadingPhotoType} isPhotoUploading={isPhotoUploading} handleUpload={handleUpload} duration={photoDuration.before} />
              </div>
            </FormAccordian>
          </div>
          {!isGeneral && (
            <div style={{ width: '50%', marginLeft: '14px' }}>
              <FormAccordian title='After Photo(s)' style={{ borderRadius: '4px', background: '#fff', marginBottom: '14px' }} bg keepOpen>
                <div className='pt-0 pb-3 px-3'>
                  <PhotosSection urlKey='imageFileNameUrl' images={get(issueDetails, 'issueImageList', [])} onRemove={removeImage} uploadingPhotoType={uploadingPhotoType} isPhotoUploading={isPhotoUploading} handleUpload={handleUpload} duration={photoDuration.after} />
                </div>
              </FormAccordian>
            </div>
          )}
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <div>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='default' text='Previous' onClick={onPrevious} baseClassName='ml-2' />
        </div>
        <div>
          <MinimalButton
            variant='contained'
            color='primary'
            text='Save'
            loadingText='Saving...'
            onClick={() => validateForm(isQuote ? enums.woTaskStatus.Open : enums.woTaskStatus.InProgress)}
            loading={isQuote ? isSaving === enums.woTaskStatus.Open : isSaving === enums.woTaskStatus.InProgress && isProcessing}
            disabled={isQuote ? isSaving === enums.woTaskStatus.Open : isSaving === enums.woTaskStatus.InProgress && isProcessing}
            baseClassName='mr-2'
          />
          {!isQuote && (
            <MinimalButton
              variant='contained'
              color='primary'
              text='Submit'
              loadingText='Submitting...'
              onClick={() => validateForm(enums.woTaskStatus.ReadyForReview)}
              loading={isSaving === enums.woTaskStatus.ReadyForReview && isProcessing}
              disabled={isSaving === enums.woTaskStatus.ReadyForReview && isProcessing}
              style={{ background: '#37d482' }}
            />
          )}
        </div>
      </div>
      <DialogPrompt title='Asset Changed !' text={`Important: Your choice of a different asset may lead to data loss for the previous one. Take a moment to review. Do you wish to proceed ?`} open={showAssetChangeWarning} ctaText='Continue' action={onContinueAfterAssetChange} handleClose={() => setAssetChangeWarning(false)} />
      {isCreateAssetOpen && <CreateFedBy open={isCreateAssetOpen} onClose={() => setCreateAssetOpen(false)} afterSubmit={createAsset} classCodeOptions={classCodeOptions} woId={workOrderID} issueAsset />}
    </>
  )
}

export default ResolutionDetails
