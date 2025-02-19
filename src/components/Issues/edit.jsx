import React, { useState, useRef, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import Drawer from '@material-ui/core/Drawer'
import enums from 'Constants/enums'
import AddIcon from '@material-ui/icons/Add'
import { useTheme } from '@material-ui/core/styles'

import { FormTitle, FormAccordian } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'
import { MinimalButton, MinimalButtonGroup, FloatingButton } from 'components/common/buttons'
import { PopupModal } from 'components/common/others'

import { snakifyKeys, camelizeKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'
import { priorityOptions, typeOptions, validate, createPayload } from './utlis'
import { AssetImage, AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'
import { Toast } from 'Snackbar/useToast'

import issues from 'Services/issues'
import { MAX_IMG_UPLOAD } from 'components/Assets/tree/constants'
import heic2any from 'heic2any'

const Edit = ({ open, onClose, obj, afterSubmit, isEdit, isForMaintenance, install = () => {}, workOrderID, tempAsset = {} }) => {
  const title = isEdit ? 'Edit Issue' : 'Create Issue'
  const [error, setError] = useState({})
  const [isProcessing, setIsProcessing] = useState('')
  const [issue, setIssue] = useState({ issueTitle: '', issueDescription: '', backOfficeNote: '', priority: priorityOptions[0].value, issueType: null, issueStatus: enums.ISSUE.STATUS.OPEN, issueImageList: [], asset: null })
  const uploadPhotosRef = useRef(null)
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [reason, setReason] = useState('')
  const [isResolveOpen, setResolvedOpen] = useState(false)
  // const { loading, data: assetOptions } = useFetchData({ fetch: getAllAssetForTree, payload: {}, formatter: d => formatOptions(camelizeKeys(d)), defaultValue: [] })
  const formatAssetOptions = d => {
    if (isForMaintenance) {
      const mainList = get(d, 'data.mainAssets', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
      const tempList = get(d, 'data.tempAssets', []).map(d => ({ ...d, label: d.assetName, value: d.woonboardingassetsId, isTemp: true }))
      return [...tempList, ...mainList]
    } else {
      const data = get(d, 'data.list', []) || []
      const options = data.map(d => ({ ...d, label: d.name, value: d.assetId }))
      return options
      // return get(d, 'data', []).map(d => ({ ...d, label: d.name, value: d.assetId }))
    }
  }

  const request = { pagesize: 0, pageindex: 0, site_id: [], status: 1, asset_id: [], internal_asset_id: [], model_name: [], model_year: [], show_open_issues: 0, search_string: null, option_search_string: null, company_id: [] }

  const { loading, data: assetOptions } = useFetchData({ fetch: isForMaintenance ? issues.getAssetList : issues.getAssetListOptions, payload: isForMaintenance ? { woId: workOrderID } : request, formatter: d => formatAssetOptions(camelizeKeys(d)), defaultValue: [] })

  const [photoErrorType, setPhotoErrorType] = useState('')
  const inspectionTypes = [
    { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
    { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
    { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
  ]
  const theme = useTheme()
  //
  useEffect(() => {
    if (isEdit) {
      setIssue({
        ...obj,
        issueType: typeOptions.find(d => d.value === obj.issueType),
        asset: assetOptions.find(d => d.value === obj.assetId),
      })
    }
    if (!isEmpty(tempAsset)) {
      setIssue(p => ({
        ...p,
        ...tempAsset,
        asset: assetOptions.find(d => d.value === tempAsset.woonboardingassetsId),
      }))
    }
  }, [assetOptions])
  //
  const handleInputChange = (name, value) => setIssue({ ...issue, [name]: value })
  const handleUpload = type => {
    setError({ ...error, photos: null })
    setPhotoErrorType(type)
    uploadPhotosRef.current && uploadPhotosRef.current.click()
  }
  // const addPhoto = async event => {
  //   event.preventDefault()
  //   setPhotoUploading(true)

  //   // Clone `event.target` and save the files array before any asynchronous operation
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
  //     const extension = file.name.split('.').pop().toLowerCase()

  //     if (!validExtensions.includes(extension)) {
  //       setError(prevError => ({
  //         ...prevError,
  //         photos: { error: true, msg: 'Invalid Image format!' },
  //       }))
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
  //           quality: 0.8,
  //         })

  //         // Create a new File object for the converted image
  //         processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
  //           type: 'image/jpeg',
  //           lastModified: file.lastModified,
  //         })
  //       } catch (error) {
  //         console.error('HEIC to JPG conversion failed:', error)
  //         setError(prevError => ({
  //           ...prevError,
  //           photos: { error: true, msg: 'HEIC/HEIF conversion failed!' },
  //         }))
  //         hasImgError = true
  //         continue
  //       }
  //     }

  //     formData.append('file', processedFile)

  //     const reader = new FileReader()
  //     reader.onload = () => {
  //       if (!hasImgError && index === files.length - 1) {
  //         setError(prevError => ({
  //           ...prevError,
  //           photos: null,
  //         }))
  //         uploadPhoto(formData, photoErrorType)
  //       }
  //     }
  //     reader.readAsDataURL(processedFile)
  //   }

  //   // Safely reset the input field after processing
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
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eps', 'heic', 'heif']

    files.forEach((file, index) => {
      const extension = file.name.split('.').slice(-1).pop().toLowerCase()
      if (!validExtensions.includes(extension)) {
        setError({ ...error, photos: { error: true, msg: 'Invalid Image format!' } })
        hasImgError = true
        return
      }
      formData.append('file', file)
      const reader = new FileReader()
      reader.onload = d => {
        if (!hasImgError && index === files.length - 1) {
          setError({ ...error, photos: null })
          uploadPhoto(formData, photoErrorType)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = null
  }

  const uploadPhoto = async (formData, type) => {
    setPhotoUploading(true)
    try {
      const res = await issues.uploadPhoto(formData)
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
              assetIssueImageMappingId: get(obj, 'assetIssueImageMappingId', null),
              imageDurationTypeId: type,
            }
          })
          setIssue({ ...issue, issueImageList: [...get(issue, 'issueImageList', []), ...imgList] })
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
    if (isEmpty(imageToDelete.assetIssueImageMappingId)) {
      const actualIssueImageList = issueImageList.filter(e => e !== imageToDelete)
      setIssue({ ...issue, issueImageList: actualIssueImageList })
    } else {
      imageToDelete.isDeleted = true
      setIssue({ ...issue, issueImageList })
    }
  }
  //validate
  const validateForm = async () => {
    const isValid = await validate({ ...issue, asset: get(issue, 'asset.value', ''), issueType: get(issue, 'issueType.value', ''), resolutionType: get(issue, 'resolutionType.value', '') }, isForMaintenance)
    setError(isValid)
    if (isValid === true) submitData('SAVE')
  }
  const submitData = async TYPE => {
    const payload = createPayload({ issue, isForMaintenance, reason, workOrderID, type: TYPE })
    let data = {}
    try {
      setIsProcessing(TYPE)
      const res = isForMaintenance ? await issues.createTempIssue(snakifyKeys(payload)) : await issues.addUpdate(snakifyKeys(payload))
      if (res.success > 0) {
        data = snakifyKeys({ ...res.data, inspectionType: get(issue, 'resolutionType.value', '') })
        Toast.success(`Issue ${isEdit ? 'Updated' : 'Created'} Successfully !`)
      } else Toast.error(res.message || `Error ${isEdit ? 'updating' : 'Creating'} Issue. Please try again !`)
      setIsProcessing('')
    } catch (error) {
      Toast.error(`Error ${isEdit ? 'updating' : 'Creating'} Issue. Please try again !`)
      setIsProcessing('')
    }
    if (TYPE === 'RESOLVE') setResolvedOpen(false)
    if (!isForMaintenance) onClose()
    afterSubmit(data)
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={title} closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalAutoComplete value={get(issue, 'issueType', '') || ''} onChange={value => handleInputChange('issueType', value)} error={error.issueType} placeholder='Select type' options={typeOptions} label='Type' isClearable w={100} onFocus={() => setError({ ...error, issueType: null })} isRequired />
            {isForMaintenance && (
              <MinimalAutoComplete
                placeholder='Select a resolution type'
                value={get(issue, 'resolutionType', '') || ''}
                onChange={v => handleInputChange('resolutionType', v)}
                options={inspectionTypes}
                w={100}
                label='Resolution Type'
                error={error.resolutionType}
                onFocus={() => setError({ ...error, resolutionType: null })}
                isClearable
                baseStyles={{ zIndex: '5' }}
                isRequired
              />
            )}
            <div className='d-flex'>
              <MinimalAutoComplete
                isLoading={loading}
                value={get(issue, 'asset', '')}
                onChange={v => handleInputChange('asset', v)}
                options={assetOptions}
                label='Linked Asset'
                placeholder='Select Asset'
                w={100}
                isClearable
                onFocus={() => setError({ ...error, asset: null })}
                error={error.asset}
                baseStyles={!isForMaintenance ? { marginRight: 0 } : {}}
                isRequired={!isForMaintenance}
              />
              {isForMaintenance && <FloatingButton onClick={() => install(issue)} icon={<AddIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px', borderRadius: '8px' }} />}
            </div>
            <MinimalInput value={get(issue, 'issueTitle', '') || ''} onChange={value => handleInputChange('issueTitle', value)} error={error.issueTitle} label='Title' placeholder='Add title' onFocus={() => setError({ ...error, issueTitle: null })} baseStyles={{ marginRight: 0 }} isRequired />
            <MinimalTextArea rows={3} value={get(issue, 'issueDescription', '') || ''} onChange={e => handleInputChange('issueDescription', e.target.value)} placeholder='Add description ..' label='Description' w={100} baseStyles={{ marginBottom: 0 }} />
            <MinimalButtonGroup label='Priority' value={get(issue, 'priority', null)} onChange={value => handleInputChange('priority', value)} options={priorityOptions} w={100} />
            {/* <MinimalTextArea rows={3} value={get(issue, 'backOfficeNote', '') || ''} onChange={e => handleInputChange('backOfficeNote', e.target.value)} placeholder='Add Back Office Note ..' label='Back Office Note' w={100} baseStyles={{ marginBottom: 0 }} /> */}
          </div>
        </div>
        <div style={{ padding: '0 10px' }}>
          <FormAccordian title='Before Photos' style={{ borderRadius: '4px', background: '#fff' }} bg>
            {!isEmpty(error.photos) && photoErrorType === 1 && <div style={{ fontWeight: 800, color: 'red', margin: '10px 16px' }}>{error.photos.msg}</div>}
            <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 1} disabled={isPhotoUploading} onClick={() => handleUpload(1)} style={{ marginLeft: '15px' }} />
            <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
            <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '450px' }} id='style-1'>
              {get(issue, 'issueImageList', []).map(d => !d.isDeleted && d.imageDurationTypeId === 1 && <AssetImage onRemove={() => removeImage(d)} key={`asset-image-${d.imageFileName}`} url={d.imageFileNameUrl} randomValue />)}
            </div>
          </FormAccordian>
        </div>
        <div style={{ padding: '0 10px', marginTop: '10px' }}>
          <FormAccordian title='After Photos' style={{ borderRadius: '4px', background: '#fff' }} bg>
            {!isEmpty(error.photos) && photoErrorType === 2 && <div style={{ fontWeight: 800, color: 'red', margin: '10px 16px' }}>{error.photos.msg}</div>}
            <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 2} disabled={isPhotoUploading} onClick={() => handleUpload(2)} style={{ marginLeft: '15px' }} />
            <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
            <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '450px' }} id='style-1'>
              {get(issue, 'issueImageList', []).map(d => !d.isDeleted && d.imageDurationTypeId === 2 && <AssetImage onRemove={() => removeImage(d)} key={`asset-image-${d.imageFileName}`} url={d.imageFileNameUrl} randomValue />)}
            </div>
          </FormAccordian>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <div>
          {isEdit && <MinimalButton variant='contained' color='primary' text='Resolve' onClick={() => setResolvedOpen(true)} baseClassName='mr-2' />}
          <MinimalButton variant='contained' color='primary' text={isEdit ? 'Update' : 'Create'} loadingText={isEdit ? 'Updating...' : 'Creating...'} loading={isProcessing === 'SAVE'} disabled={isProcessing === 'SAVE'} onClick={validateForm} />
        </div>
      </div>
      {isResolveOpen && (
        <PopupModal cta='Resolve' loadingText='Resolving...' open={isResolveOpen} loading={isProcessing === 'RESOLVE'} handleSubmit={() => submitData('RESOLVE')} onClose={() => setResolvedOpen(false)} title='Resolve Issue'>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter reason here..' w={100} />
        </PopupModal>
      )}
    </Drawer>
  )
}

export default Edit
