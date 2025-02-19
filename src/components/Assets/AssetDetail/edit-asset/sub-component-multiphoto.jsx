import React, { useState, useRef } from 'react'

import AddIcon from '@material-ui/icons/Add'

import { PopupModal } from 'components/common/others'
import { MinimalButton } from 'components/common/buttons'
import { MinimalAutoComplete } from 'components/Assets/components'
import { AssetImage, photoTypeCategory, photoTypes } from 'components/WorkOrders/onboarding/utils'
import ImagePreview from 'components/common/image-preview'

import { Toast } from 'Snackbar/useToast'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { get, isEmpty } from 'lodash'
import heic2any from 'heic2any'

export const AssetSubComponentMultiplePhotoPop = ({ open, onClose, data, savePhotos, readOnly = false }) => {
  const [loading, setLoading] = useState(false)
  const uploadPhotoRef = useRef(null)
  const subcomponentassetImageList = isEmpty(get(data, 'subcomponentassetImageList', [])) ? [] : get(data, 'subcomponentassetImageList', [])
  const [uploadedImages, setUploadedImages] = useState(subcomponentassetImageList)
  const [selectedImageType, setSelectedImageType] = useState(null)
  const [randomValue, setRandomValue] = useState(Math.random())
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [imageOrder, setImageOrder] = useState(0)
  //

  const uploadPhoto = async file => {
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)
    try {
      const res = await onBoardingWorkorder.component.uploadPhoto(formData)
      if (res.success < 1) Toast.error('Error uploading image, Try Again Later !')
      else {
        setSelectedImageType(null)
        setUploadedImages([
          ...uploadedImages,
          {
            assetPhotoUrl: res.data.fileUrl,
            assetPhoto: res.data.filename,
            assetPhotoType: get(selectedImageType, 'value', 0),
            assetProfileImagesId: null,
            isDeleted: false,
            assetThumbnailPhoto: res.data.thumbnailFileUrl,
          },
        ])
      }
    } catch (error) {
      Toast.error('Error uploading image,Try Again Later !')
    }
    setLoading(false)
  }
  // const handleUploadPhoto = async e => {
  //   e.preventDefault()
  //   setLoading(true)

  //   const input = e.target // Save a reference to the input element
  //   e.persist() // Persist the event to prevent nullification

  //   if (!input.files[0]) return

  //   const file = input.files[0]
  //   const extension = file.name.split('.').slice(-1).pop().toLowerCase()

  //   if (!['jpg', 'jpeg', 'png', 'gif', 'eps', 'heic', 'heif'].includes(extension)) {
  //     Toast.error('Invalid Image format!')
  //     input.value = '' // Reset the input value safely
  //     return
  //   }

  //   let processedFile = file

  //   // Convert HEIC/HEIF to JPG using heic2any
  //   if (['heic', 'heif'].includes(extension)) {
  //     try {
  //       const blob = await heic2any({
  //         blob: file,
  //         toType: 'image/jpeg',
  //         quality: 0.8, // Adjust quality as needed
  //       })

  //       // Create a new File object for the converted image
  //       processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
  //         type: 'image/jpeg',
  //         lastModified: file.lastModified,
  //       })
  //     } catch (error) {
  //       console.error('HEIC to JPG conversion failed:', error)
  //       Toast.error('Failed to process HEIC/HEIF image!')
  //       input.value = '' // Reset the input value safely
  //       return
  //     }
  //   }

  //   // Read the processed file and upload it
  //   const reader = new FileReader()
  //   reader.onload = () => {
  //     uploadPhoto(processedFile)
  //   }
  //   reader.readAsDataURL(processedFile)

  //   input.value = '' // Reset the input value safely
  // }

  const handleUploadPhoto = e => {
    e.preventDefault()
    if (!e.target.files[0]) return

    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF', 'HEIC', 'HEIF', 'heic', 'heif'].includes(extension)) Toast.error('Invalid Image format !')
      else uploadPhoto(file)
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }

  const handleSavePhotos = () => {
    const photoDetails = { data: uploadedImages, id: data.id }
    savePhotos(photoDetails)
  }

  const handleAddPhoto = () => {
    if (!isEmpty(selectedImageType)) {
      uploadPhotoRef.current && uploadPhotoRef.current.click()
    } else {
      Toast.error('Please select category')
    }
  }

  const removeImage = image => {
    const images = [...uploadedImages]
    const imageToDelete = images.find(img => img.assetPhoto === image.assetPhoto)
    if (isEmpty(imageToDelete.assetProfileImagesId)) {
      const actualUploadedImageList = uploadedImages.filter(e => e !== imageToDelete)
      setUploadedImages(actualUploadedImageList)
    } else {
      imageToDelete.isDeleted = true
      setUploadedImages(images)
    }
  }

  return (
    <>
      <PopupModal open={open} onClose={onClose} title='Photo(s)' width={38} handleSubmit={handleSavePhotos} noActions={readOnly} tblResponsive>
        <div>
          {!readOnly && (
            <div className='d-flex'>
              <input ref={uploadPhotoRef} type='file' style={{ display: 'none' }} onChange={e => handleUploadPhoto(e)} />
              <MinimalAutoComplete value={selectedImageType} onChange={value => setSelectedImageType(value)} placeholder='Select Category' options={photoTypeCategory} isClearable w={50} />
              <MinimalButton startIcon={<AddIcon />} text='Add Photo' variant='contained' color='primary' style={{ height: '42px' }} onClick={handleAddPhoto} loading={loading} disabled={loading || isEmpty(selectedImageType)} loadingText='Adding...' />
            </div>
          )}
        </div>
        <div className='scrollbar_style' style={{ overflowY: 'auto', maxHeight: '50vh', minHeight: '15vh' }}>
          {!isEmpty(uploadedImages) && uploadedImages.some(d => !d.isDeleted && d.assetPhotoType === photoTypes.nameplate) && (
            <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '16px' }}>
              <div className='d-flex ' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                <div className='text-bold'>Nameplate</div>
              </div>
              <div style={{ padding: '16px', overflowX: 'auto' }} className='scrollbar_style'>
                <div className='pt-3 d-flex' style={{ whiteSpace: 'nowrap' }} id='style-1'>
                  {uploadedImages
                    .filter(d => d.assetPhotoType === photoTypes.nameplate)
                    .map((d, i) => !d.isDeleted && <AssetImage readOnly={readOnly} onRemove={() => removeImage(d)} onClick={() => (setImageOrder(i), setPreview([true, photoTypes.profile]))} key={`asset-image-${d.assetPhoto}`} url={`${d.assetPhotoUrl}?value=${randomValue}`} style={{ marginRight: '20px' }} randomValue />)}
                </div>
              </div>
            </div>
          )}
          {!isEmpty(uploadedImages) && uploadedImages.some(d => !d.isDeleted && d.assetPhotoType === photoTypes.profile) && (
            <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '16px' }}>
              <div className='d-flex' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                <div className='text-bold'>Profile</div>
              </div>
              <div style={{ padding: '16px', overflowX: 'auto' }} className='scrollbar_style'>
                <div className='pt-3 d-flex' style={{ whiteSpace: 'nowrap' }} id='style-1'>
                  {uploadedImages
                    .filter(d => d.assetPhotoType === photoTypes.profile)
                    .map((d, i) => !d.isDeleted && <AssetImage readOnly={readOnly} onClick={() => (setImageOrder(i), setPreview([true, photoTypes.profile]))} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.assetPhotoUrl}?value=${randomValue}`} style={{ marginRight: '20px' }} randomValue />)}
                </div>
              </div>
            </div>
          )}
          {!isEmpty(uploadedImages) && uploadedImages.some(d => !d.isDeleted && d.assetPhotoType === photoTypes.additional) && (
            <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '16px' }}>
              <div className='d-flex' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                <div className='text-bold'>Additional</div>
              </div>
              <div style={{ padding: '16px', overflowX: 'auto' }} className='scrollbar_style'>
                <div className='pt-3 d-flex' style={{ whiteSpace: 'nowrap' }} id='style-1'>
                  {uploadedImages
                    .filter(v => v.assetPhotoType === photoTypes.additional)
                    .map((d, i) => !d.isDeleted && <AssetImage readOnly={readOnly} onRemove={() => removeImage(d)} onClick={() => (setImageOrder(i), setPreview([true, photoTypes.additional]))} key={`asset-image-${d.assetPhoto}`} url={`${d.assetPhotoUrl}?value=${randomValue}`} style={{ marginRight: '20px' }} randomValue />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </PopupModal>
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={uploadedImages.filter(d => d.assetPhotoType === isPreviewOpen[1])} urlKey='assetPhotoUrl' reFetch={() => setRandomValue(Math.random())} />}
    </>
  )
}
