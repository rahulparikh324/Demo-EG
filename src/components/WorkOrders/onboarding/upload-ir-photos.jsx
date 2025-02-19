import React, { useState, useRef } from 'react'
import usePostData from 'hooks/post-data'

import { PopupModal } from 'components/common/others'
import UploadedPreview from 'components/WorkOrders/onboarding/uploaded-preview'
import UploadedPhotosPreview from 'components/WorkOrders/onboarding/uploaded-photos-preview'
import { MinimalButton } from 'components/common/buttons'
import { Toast } from 'Snackbar/useToast'
import { MinimalStatusSelector } from 'components/Assets/components'

import { AppBar, Drawer } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'

import { isEmpty, chunk } from 'lodash'
import enums from 'Constants/enums'
import { FormTitle } from 'components/Maintainance/components'

const UploadIrPhotos = ({ open, onClose, workOrderID, manualWoNumber, isDisable, cameraType, imageType }) => {
  //
  const uploadTabs = { UPLOAD: 'UPLOAD', ASSET_UPLOADED: 'ASSET_UPLOADED', UPLOADED_PHOTOS: 'UPLOADED_PHOTOS' }
  const [selectedTab, setTab] = useState(uploadTabs.UPLOAD)
  const [isUploading, setIsUploading] = useState(false)
  const [isChunkFail, setChunkFail] = useState(false)
  const [photoType, setPhotoType] = useState('IR ONLY')
  const uploadRef = useRef(null)
  //

  const handleSuccess = res => {
    if (res.success !== 1) {
      setChunkFail(true)
    }
  }

  const handleError = formData => {
    setChunkFail(true)
  }

  const { loading, mutate } = usePostData({ executer: onBoardingWorkorder.uploadIrPhoto, postError: handleError, postSuccess: handleSuccess, hideMessage: true })
  const uploadPhotos = async files => {
    setIsUploading(true)
    const fileChunks = chunk(files, enums.UPLOAD_IRPHOTO_CHUNK_SIZE)
    for (const chunk of fileChunks) {
      const formData = new FormData()
      chunk.forEach((file, i) => {
        formData.append(`file-${i}`, file, file.name)
      })
      formData.append('manual_wo_number', manualWoNumber)
      formData.append('wo_id', workOrderID)

      if (cameraType === enums.CAMERA_TYPE.FLUKE) {
        formData.append('ir_visual_image_type', photoType === 'IR ONLY' ? enums.PHOTO_TYPE.IR_ONLY : enums.PHOTO_TYPE.VISUAL_ONLY)
      }
      await mutate(formData)
    }
    setIsUploading(false)
    if (isChunkFail) {
      Toast.error('Some files failed to upload. Please try again.')
    } else Toast.success('IR Images uploaded successfully!')
    setTab(uploadTabs.ASSET_UPLOADED)
  }
  const handleUpload = () => uploadRef.current && uploadRef.current.click()
  const addPhotos = e => {
    e.preventDefault()
    if (!e.target.files.length) return
    const files = [...e.target.files]
    const invalidExtensions = files.map(d => ['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(d.name.split('.').slice(-1).pop())).filter(d => d === false)
    if (!isEmpty(invalidExtensions)) return Toast.error('Invalid Image format !')
    else uploadPhotos(files)
    e.target.value = null
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Visual/IR Photos' closeFunc={onClose} style={{ width: '100%', minWidth: '700px' }} />
      <div style={{ height: 'calc(100vh - 65px)', width: '1200px' }} id='style-1' className='table-responsive'>
        <div style={{ padding: '10px 0 10px 10px' }}>
          <div className='assets-box-wraps customtab'>
            <AppBar position='static' color='inherit'>
              <Tabs id='controlled-tab-example' activeKey={selectedTab} onSelect={k => setTab(k)}>
                <Tab eventKey={uploadTabs.UPLOAD} title='Upload' tabClassName='font-weight-bolder small-tab'></Tab>
                <Tab eventKey={uploadTabs.ASSET_UPLOADED} title='Asset Photos' tabClassName='font-weight-bolder small-tab'></Tab>
                <Tab eventKey={uploadTabs.UPLOADED_PHOTOS} title='Uploaded Photos' tabClassName='font-weight-bolder small-tab'></Tab>
              </Tabs>
            </AppBar>
          </div>
        </div>
        {selectedTab === uploadTabs.UPLOAD && (
          <>
            {isUploading && (
              <div className='d-flex align-items-center m-2 alert alert-warning' role='alert'>
                Warning: Upload in progress. Navigating away or refreshing the page will interrupt the upload.
              </div>
            )}
            <div className='d-flex flex-column align-items-start p-2' style={{ height: '450px' }}>
              {/* <PhotoLibraryOutlinedIcon style={{ fontSize: '64px', color: '#12121250' }} /> */}
              <input key='input' ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhotos} multiple />
              {cameraType === enums.CAMERA_TYPE.FLUKE && <MinimalStatusSelector label='Select Camera Type' options={['IR Only', 'Visual Only']} value={photoType} onChange={setPhotoType} w={40} />}
              {/* <MinimalStatusSelector label='Select Photo Type' options={['FLIR', 'FLUKE']} value={cameraType} onChange={setCameraType} w={100} /> */}
              <MinimalButton loading={loading} disabled={loading || isDisable} loadingText='Uploading...' size='small' startIcon={<PublishOutlinedIcon />} text='UPLOAD PHOTOS' onClick={handleUpload} variant='contained' color='primary' baseClassName='my-2' />
            </div>
          </>
        )}
        {selectedTab === uploadTabs.ASSET_UPLOADED && <UploadedPreview workOrderID={workOrderID} manualWoNumber={manualWoNumber} imageType={imageType} />}
        {selectedTab === uploadTabs.UPLOADED_PHOTOS && <UploadedPhotosPreview workOrderID={workOrderID} manualWoNumber={manualWoNumber} imageType={imageType} />}
      </div>
    </Drawer>
  )
}

export default UploadIrPhotos
