import React, { useState, useRef, useContext } from 'react'

import usePostData from 'hooks/post-data'
import useFetchData from 'hooks/fetch-data'
import issueContext from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/context'

import { FormAccordian } from 'components/Maintainance/components'
import { MinimalButtonGroup, MinimalButton } from 'components/common/buttons'
import { MinimalCheckbox, PhotosSection } from 'components/common/others'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'

import { assetTypeOfIssue, resolutionTypes, validateIssueDetails } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'
import { priorityOptions, typeOptions } from 'components/Issues/utlis.js'
import { photoDuration } from 'components/WorkOrders/onboarding/utils.js'
import { validateReceivedPhoto } from 'components/WorkOrders/maintenance-forms/multi-step-forms/common/utils.js'
import { makePayload } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/make-payload'

import { get, has, isEmpty, set } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { camelizeKeys } from 'helpers/formatters'
import enums from 'Constants/enums'

import issues from 'Services/issues'
import assetInfo from 'Services/assets'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { MAX_IMG_UPLOAD } from 'components/Assets/tree/constants'
import heic2any from 'heic2any'

const IssueDetails = ({ onClose, onNext, workOrderID, afterSubmit }) => {
  const { data: { issueDetails: issue, other } = {}, updateIssueDetails } = useContext(issueContext)
  const [uploadingPhotoType, setUploadingPhotoType] = useState({})
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const uploadRef = useRef(null)
  const formatAssetOptions = d => {
    const mainList = get(d, 'data.mainAssets', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
    const tempList = get(d, 'data.tempAssets', []).map(d => ({ ...d, label: d.assetName, value: d.woonboardingassetsId, isTemp: true }))
    return [...tempList, ...mainList]
  }
  const shouldShowExistingAsset = !get(issue, 'asset.isVerifyInField', false) && get(issue, 'asset.type', '') === assetTypeOfIssue[1].value
  const { loading: assetOptionsLoading, data: assetOptions } = useFetchData({ fetch: issues.getAssetList, payload: { woId: workOrderID }, formatter: d => formatAssetOptions(camelizeKeys(d)), defaultValue: [], condition: shouldShowExistingAsset })
  const [errors, setErrors] = useState({})
  const isAnExistingIssue = get(issue, 'isAnExistingIssue', false)
  const isVerifyOnFieldChecked = get(issue, 'asset.isVerifyInField', false)
  const isEdit = get(issue, 'isEdit', false) === true ? true : false
  const [isAssetChanged, setIsAssetChanged] = useState(false)
  const [isCreateNewSelected, setIsCreateNewSelected] = useState(false)
  // form value handlers
  const handleInputChange = (key, value) => {
    const data = structuredClone(issue)
    if (key === 'asset.isVerifyInField' && value === false && isEmpty(issue?.asset?.linkedAsset?.value)) {
      data.asset.linkedAsset = null
    }
    if (key === 'asset.type') {
      if (value === 'CREATE_NEW') {
        setIsCreateNewSelected(true)
      } else {
        data.asset.linkedAsset = null
      }
    }
    if (key === 'asset.linkedAsset' && value !== issue?.asset?.linkedAsset?.value) {
      setIsAssetChanged(true)
    }
    set(data, key, value)
    updateIssueDetails('issueDetails', data)
  }
  // photo handlers
  // const addPhoto = async event => {
  //   event.preventDefault()
  //   setPhotoUploading(true)

  //   const inputElement = event.target
  //   const files = Array.from(inputElement.files)

  //   if (!files || files.length === 0) {
  //     return // Handle cases where no files are selected
  //   }

  //   if (files.length > MAX_IMG_UPLOAD) {
  //     Toast.error(`You can upload up to ${MAX_IMG_UPLOAD} images at a time.`)
  //     return
  //   }

  //   const formData = new FormData()
  //   let hasImgError = false
  //   const validExtensions = ['heif', 'heic', 'jpg', 'jpeg', 'png', 'gif', 'eps']

  //   for (const [index, file] of files.entries()) {
  //     const extension = file.name.split('.').slice(-1).pop().toLowerCase()

  //     if (!validExtensions.includes(extension)) {
  //       Toast.error('Invalid Image format!')
  //       hasImgError = true
  //       continue
  //     }

  //     let processedFile = file

  //     // Convert HEIC/HEIF to JPG using heic2any
  //     if (['heic', 'heif'].includes(extension)) {
  //       try {
  //         const blob = await heic2any({
  //           blob: file,
  //           toType: 'image/jpeg',
  //           quality: 0.8, // You can adjust the quality
  //         })

  //         // Create a new File object for the converted image
  //         processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
  //           type: 'image/jpeg',
  //           lastModified: file.lastModified,
  //         })
  //       } catch (error) {
  //         console.error('HEIC to JPG conversion failed:', error)
  //         hasImgError = true
  //         continue
  //       }
  //     }

  //     formData.append('file', processedFile)

  //     const reader = new FileReader()
  //     reader.onload = () => {
  //       if (!hasImgError && index === files.length - 1) {
  //         uploadPhoto(formData)
  //       }
  //     }
  //     reader.readAsDataURL(processedFile)
  //   }

  //   if (inputElement && inputElement.value) {
  //     inputElement.value = null
  //   }
  // }

  const addPhoto = e => {
    e.preventDefault()
    const files = Array.from(e.target.files)

    if (files.length > MAX_IMG_UPLOAD) {
      Toast.error(`You can upload up to ${MAX_IMG_UPLOAD} images at a time.`)
      return
    }

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
            }
          })
          updateIssueDetails('issueDetails', { ...issue, issueImageList: [...get(issue, 'issueImageList', []), ...imgList] })
        } else Toast.error(res.message)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setPhotoUploading(false)
  }
  const removeImage = image => {
    const issueImageList = [...get(issue, 'issueImageList', [])]
    const imageToDelete = issueImageList.find(img => img.imageThumbnailFileName === image.imageThumbnailFileName)
    if (isEmpty(imageToDelete.woonboardingassetsimagesmappingId)) {
      const actualIssueImageList = issueImageList.filter(e => e !== imageToDelete)
      updateIssueDetails('issueDetails', { ...issue, issueImageList: actualIssueImageList })
    } else {
      imageToDelete.isDeleted = true
      updateIssueDetails('issueDetails', { ...issue, issueImageList })
    }
  }
  //console.log(issue)
  const handleFocus = d => setErrors({ ...errors, [d]: null })
  const handleOnNext = async step => {
    const isValid = await validateIssueDetails({ ...issue, issueType: get(issue, 'issueType.value', ''), resolutionType: get(issue, 'resolutionType.value', ''), linkedAsset: get(issue, 'asset.linkedAsset.value', '') })
    setErrors(isValid)
    if (isValid === true) {
      // fetch info for asset if present in step 1
      const isAddedAssetIsExisting = issue.isAnExistingIssue || get(issue, 'asset.type', '') === 'ADD_EXISTING'
      if (isAddedAssetIsExisting && (!has(other, 'proceedNext') || isAssetChanged)) {
        try {
          setLoading(true)
          const assetId = issue.isAnExistingIssue ? get(issue, 'assetId', null) : get(issue, 'asset.type', '') === 'ADD_EXISTING' && !get(issue, 'asset.linkedAsset.isTemp', false) ? get(issue, 'asset.linkedAsset.assetId', null) : null
          const woonboardingassetsId = get(issue, 'asset.linkedAsset.isTemp', false) ? get(issue, 'asset.linkedAsset.woonboardingassetsId', null) : null
          const assetDetails = await assetInfo.temp.getDetails({ assetId, woonboardingassetsId, woId: workOrderID })
          assetDetails.data.proceedNext = true
          updateIssueDetails('other', get(assetDetails, 'data', {}))
          setLoading(false)
        } catch (error) {
          setLoading(false)
        }
      }
      if (isCreateNewSelected && get(issue, 'asset.type') === 'CREATE_NEW') {
        updateIssueDetails('other', {})
        updateIssueDetails('assetDetails', {})
      }
      isVerifyOnFieldChecked ? submitData() : onNext(step)
    }
  }
  //
  const postError = () => {
    onClose()
  }
  const postSuccess = d => {
    onClose()
    afterSubmit()
  }
  const { loading: isProcessing, mutate } = usePostData({ executer: isEdit ? issues.multiStep.update : issues.multiStep.add, postError, postSuccess, message: { success: 'Work Order line added successfully !', error: 'Error adding Work Order line, Please Try again' } })
  const submitData = async () => {
    const payload = makePayload({ issueDetails: issue, assetDetails: {}, woId: workOrderID, status: enums.woTaskStatus.Open })
    delete payload['installWolineDetails']
    mutate(payload)
  }
  return (
    <>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - ${get(issue, 'asset.isVerifyInField', false) ? '63' : '98'}px)`, padding: '0 14px 14px 14px' }}>
        {!isAnExistingIssue && (
          <div style={{ padding: '14px', background: '#fff', borderRadius: '4px', marginBottom: '14px', marginTop: get(issue, 'asset.isVerifyInField', false) ? '14px' : 0 }}>
            <MinimalButtonGroup label='Asset' value={get(issue, 'asset.type', null)} onChange={value => handleInputChange('asset.type', value)} options={assetTypeOfIssue} w={100} />
            <MinimalCheckbox label='Verify In field' onClick={() => handleInputChange('asset.isVerifyInField', !get(issue, 'asset.isVerifyInField', false))} selected={get(issue, 'asset.isVerifyInField', false)} />
            {shouldShowExistingAsset && (
              <MinimalAutoComplete
                placeholder='Select a asset'
                value={get(issue, 'asset.linkedAsset', null) || null}
                onChange={v => handleInputChange('asset.linkedAsset', v)}
                options={assetOptions}
                w={100}
                label='Linked Asset'
                isClearable
                baseStyles={{ marginTop: '8px' }}
                isRequired
                isLoading={assetOptionsLoading}
                error={errors.linkedAsset}
                onFocus={() => handleFocus('linkedAsset')}
              />
            )}
          </div>
        )}
        <div style={{ padding: '14px', background: '#fff', borderRadius: '4px', marginBottom: '14px' }}>
          <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
          <div className='d-flex'>
            <MinimalAutoComplete value={get(issue, 'issueType', '') || ''} onChange={value => handleInputChange('issueType', value)} placeholder='Select type' options={typeOptions} error={errors.issueType} onFocus={() => handleFocus('issueType')} label='Type' isClearable w={100} isDisabled={isAnExistingIssue} isRequired />
            <MinimalAutoComplete
              placeholder='Select a resolution type'
              value={get(issue, 'resolutionType', '') || ''}
              onChange={v => handleInputChange('resolutionType', v)}
              options={resolutionTypes}
              w={100}
              label='Resolution Type'
              isClearable
              baseStyles={{ marginRight: 0 }}
              isRequired
              error={errors.resolutionType}
              onFocus={() => handleFocus('resolutionType')}
            />
            {isAnExistingIssue && <MinimalAutoComplete value={{ label: get(issue, 'assetName', ''), value: get(issue, 'assetId', '') }} options={[{ label: get(issue, 'assetName', ''), value: get(issue, 'assetId', '') }]} w={100} label='Linked Asset' isClearable baseStyles={{ zIndex: '5', marginRight: 0, marginLeft: '10px' }} isDisabled />}
          </div>
          <div className='d-flex'>
            <div style={{ width: '50%', marginRight: '10px' }}>
              <MinimalInput value={get(issue, 'issueTitle', '') || ''} onChange={value => handleInputChange('issueTitle', value)} error={errors.issueTitle} label='Title' placeholder='Add title' onFocus={() => handleFocus('issueTitle')} baseStyles={{ marginRight: 0 }} disabled={isAnExistingIssue} isRequired />
              <MinimalButtonGroup label='Priority' value={get(issue, 'priority', null)} onChange={value => handleInputChange('priority', value)} options={priorityOptions} w={100} />
            </div>
            <MinimalTextArea rows={5} value={get(issue, 'issueDescription', '') || ''} onChange={e => handleInputChange('issueDescription', e.target.value)} placeholder='Add description ..' label='Description' w={50} baseStyles={{ margin: 0 }} />
          </div>
        </div>
        {/* PHOTOS */}
        <FormAccordian title='Photo(s)' style={{ borderRadius: '4px', background: '#fff', marginBottom: '14px' }} bg keepOpen>
          <div className='pt-0 pb-3 px-3'>
            <PhotosSection urlKey='imageFileNameUrl' images={get(issue, 'issueImageList', [])} onRemove={removeImage} uploadingPhotoType={uploadingPhotoType} isPhotoUploading={isPhotoUploading} handleUpload={handleUpload} duration={photoDuration.before} />
          </div>
        </FormAccordian>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text={isVerifyOnFieldChecked ? (isEdit ? 'Save' : 'Create') : 'Next'} onClick={handleOnNext} loadingText={isVerifyOnFieldChecked ? 'Creating' : 'Next'} loading={isLoading || isProcessing} disabled={isLoading || isProcessing} />
      </div>
    </>
  )
}

export default IssueDetails
