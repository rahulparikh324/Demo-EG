import React, { useState, useRef } from 'react'

import AddIcon from '@material-ui/icons/Add'

import { PopupModal } from 'components/common/others'
// import { AssetImage } from 'components/WorkOrders/onboarding//utils'
import { MinimalButton } from 'components/common/buttons'
import DialogPrompt from 'components/DialogPrompt'
import { MinimalAutoComplete } from 'components/Assets/components'
import ImagePreview from 'components/common/image-preview'

import { Toast } from 'Snackbar/useToast'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { get, isEmpty } from 'lodash'

import { AssetImage, photoTypeCategory, photoTypes } from './utils'
import heic2any from 'heic2any'

export const SubComponentPhotoPop = ({ open, onClose, data, uploadNew, keepPhoto, uploadRef }) => {
  const [loading, setLoading] = useState(false)
  const [isDiscardOpen, setDiscardOpen] = useState(false)
  const uploadNewPhotoRef = useRef(null)
  const [currentData, setCurrentData] = useState(data)

  //
  const handleKeepPhoto = async () => {
    const formData = new FormData()
    formData.append('file', currentData.file)
    setLoading(true)
    try {
      const res = await onBoardingWorkorder.component.uploadPhoto(formData)
      if (res.success < 1) Toast.error('Error uploading image, Try Again Later !')
      else keepPhoto({ data: res.data, id: data.id })
    } catch (error) {
      Toast.error('Error uploading image,Try Again Later !')
    }
    setLoading(false)
  }
  const handleDiscardPhoto = () => {
    setDiscardOpen(false)
    if (isEmpty(currentData.file.fileUrl)) return onClose()
    keepPhoto({ data: null, id: data.id })
  }
  const handleUploadNew = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      console.log(extension)
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else setCurrentData({ file, id: data.id })
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }

  return (
    <>
      <PopupModal open={open} onClose={onClose} title='NP Photo' noActions width='310px' isFixed>
        <div className='d-flex justify-content-between align-items-center'>
          {/* <AssetImage readOnly url={isEmpty(currentData.file.filename) ? URL.createObjectURL(currentData.file) : currentData.file.fileUrl} width='150px' /> */}
          <div
            style={{
              backgroundImage: `url(${encodeURI(isEmpty(currentData.file.filename) ? URL.createObjectURL(currentData.file) : currentData.file.fileUrl)}), url(${URL.invalidImage})`,
              backgroundSize: 'cover',
              width: '150px',
              marginRight: '12px',
              height: '150px',
              display: 'inline-block',
              borderRadius: '4px',
              position: 'relative',
              cursor: 'pointer',
              flex: '0 0 auto',
            }}
          ></div>
          <div className='d-flex flex-column'>
            <MinimalButton variant='contained' color='primary' text='Discard' onClick={() => setDiscardOpen(true)} baseClassName='mb-3' />
            <MinimalButton variant='contained' color='primary' text='Keep' loadingText='Keeping..' disabled={loading || !isEmpty(currentData.file.fileUrl)} loading={loading} onClick={handleKeepPhoto} baseClassName='mb-3' />
            <input ref={uploadNewPhotoRef} type='file' style={{ display: 'none' }} onChange={e => handleUploadNew(e)} />
            <MinimalButton variant='contained' color='primary' text='Upload New' onClick={() => uploadNewPhotoRef.current && uploadNewPhotoRef.current.click()} />
          </div>
        </div>
      </PopupModal>
      <DialogPrompt title='Discard Photo' text='Are you sure you want to discard the photo ?' open={isDiscardOpen} ctaText='Discard' action={handleDiscardPhoto} handleClose={() => setDiscardOpen(false)} />
    </>
  )
}

export const SubComponentMultiplePhotoPop = ({ open, onClose, data, savePhotos, readOnly = false }) => {
  const [loading, setLoading] = useState(false)
  const uploadPhotoRef = useRef(null)
  const subcomponentImageList = isEmpty(get(data, 'subcomponentImageList', [])) ? [] : get(data, 'subcomponentImageList', [])
  const [uploadedImages, setUploadedImages] = useState(subcomponentImageList)
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
            imageUrl: res.data.fileUrl,
            imageName: res.data.filename,
            imageType: get(selectedImageType, 'value', 0),
            woonboardingassetsimagesmappingId: null,
            isDeleted: false,
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
    // data.subcomponentImageList = uploadedImages
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
    const imageToDelete = images.find(img => img.imageName === image.imageName)
    if (isEmpty(imageToDelete.woonboardingassetsimagesmappingId)) {
      const actualUploadedImageList = uploadedImages.filter(e => e !== imageToDelete)
      setUploadedImages(actualUploadedImageList)
    } else {
      imageToDelete.isDeleted = true
      setUploadedImages(images)
    }
  }

  return (
    <>
      <PopupModal open={open} onClose={onClose} title='Photo(s)' width={39} handleSubmit={handleSavePhotos} noActions={readOnly}>
        <div>
          {!readOnly && (
            <div className='d-flex'>
              <input ref={uploadPhotoRef} type='file' style={{ display: 'none' }} onChange={e => handleUploadPhoto(e)} />
              <MinimalAutoComplete value={selectedImageType} onChange={value => setSelectedImageType(value)} placeholder='Select Category' options={photoTypeCategory} isClearable w={50} />
              <MinimalButton startIcon={<AddIcon />} text='Add Photo' variant='contained' color='primary' style={{ height: '42px' }} onClick={handleAddPhoto} loading={loading} disabled={loading || isEmpty(selectedImageType)} loadingText='Adding...' />
            </div>
          )}
        </div>
        <div className='scrollbar_style' style={{ overflowY: 'auto', maxHeight: '42vh' }}>
          {!isEmpty(uploadedImages) && uploadedImages.some(d => !d.isDeleted && d.imageType === photoTypes.nameplate) && (
            <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '16px' }}>
              <div className='d-flex ' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                <div className='text-bold'>Nameplate</div>
              </div>
              <div style={{ padding: '16px', overflowX: 'auto' }} className='scrollbar_style'>
                <div className='pt-3 d-flex' style={{ whiteSpace: 'nowrap' }} id='style-1'>
                  {uploadedImages
                    .filter(d => d.imageType === photoTypes.nameplate)
                    .map((d, i) => !d.isDeleted && <AssetImage readOnly={readOnly} onRemove={() => removeImage(d)} onClick={() => (setImageOrder(i), setPreview([true, photoTypes.nameplate]))} key={`asset-image-${d.imageName}`} url={`${d.imageUrl}?value=${randomValue}`} style={{ marginRight: '20px' }} randomValue />)}
                </div>
              </div>
            </div>
          )}
          {!isEmpty(uploadedImages) && uploadedImages.some(d => !d.isDeleted && d.imageType === photoTypes.profile) && (
            <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '16px' }}>
              <div className='d-flex' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                <div className='text-bold'>Profile</div>
              </div>
              <div style={{ padding: '16px', overflowX: 'auto' }} className='scrollbar_style'>
                <div className='pt-3 d-flex' style={{ whiteSpace: 'nowrap' }} id='style-1'>
                  {uploadedImages
                    .filter(d => d.imageType === photoTypes.profile)
                    .map((d, i) => !d.isDeleted && <AssetImage readOnly={readOnly} onRemove={() => removeImage(d)} onClick={() => (setImageOrder(i), setPreview([true, photoTypes.profile]))} key={`asset-image-${d.imageName}`} url={`${d.imageUrl}?value=${randomValue}`} style={{ marginRight: '20px' }} randomValue />)}
                </div>
              </div>
            </div>
          )}
          {!isEmpty(uploadedImages) && uploadedImages.some(d => !d.isDeleted && d.imageType === photoTypes.additional) && (
            <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: '16px' }}>
              <div className='d-flex' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                <div className='text-bold'>Additional</div>
              </div>
              <div style={{ padding: '16px', overflowX: 'auto' }} className='scrollbar_style'>
                <div className='pt-3 d-flex' style={{ whiteSpace: 'nowrap' }} id='style-1'>
                  {uploadedImages
                    .filter(d => d.imageType === photoTypes.additional)
                    .map((d, i) => !d.isDeleted && <AssetImage readOnly={readOnly} onRemove={() => removeImage(d)} onClick={() => (setImageOrder(i), setPreview([true, photoTypes.additional]))} key={`asset-image-${d.imageName}`} url={`${d.imageUrl}?value=${randomValue}`} style={{ marginRight: '20px' }} randomValue />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </PopupModal>
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={uploadedImages.filter(d => d.imageType === isPreviewOpen[1])} urlKey='imageUrl' reFetch={() => setRandomValue(Math.random())} />}
    </>
  )
}
