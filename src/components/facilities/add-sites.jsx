import React, { useEffect, useState, useRef } from 'react'

import Drawer from '@material-ui/core/Drawer'

import usePostData from 'hooks/post-data'
import useFetchData from 'hooks/fetch-data'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea } from 'components/Assets/components'
import { MinimalButtonGroup, MinimalButton } from 'components/common/buttons'
import { MinimalAutoComplete } from 'components/Assets/components'
import { AssetImage, AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'

import { statusOptions, allowAddAsset } from './utils'

import facilities from 'Services/facilities/index'
import getProjectManagerList from 'Services/User/getProjectManagerList'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'

import { get } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import ImagePreview from 'components/common/image-preview'
import heic2any from 'heic2any'

const AddSites = ({ open, onClose, isEdit, reFetch, clientCompanyId, anchorObj }) => {
  const [siteData, setSiteData] = useState({
    siteName: '',
    siteCode: '',
    status: statusOptions[0].value,
    isAddAssetClassEnabled: allowAddAsset[0].value,
    customer: '',
    customerAddress: '',
    siteProjectmanagerList: [],
    profileImage: null,
  })
  const [newManagerItem, setNewManagerItem] = useState([])
  const [error, setError] = useState('')
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [isPreviewOpen, setPreview] = useState(false)
  const [randomValue, setRandomValue] = useState(0)

  const uploadPhotosRef = useRef(null)

  const handleInputChange = (name, value) => {
    setSiteData({ ...siteData, [name]: value })
  }

  const handleManagerFormatter = data => {
    const options = data.map(v => ({ ...v, label: `${v.firstname} ${v.lastname} - ${v.email}`, value: v.uuid }))
    return options
  }

  const { loading: projectMamagerLoading, data: managerOptions } = useFetchData({ fetch: getProjectManagerList, formatter: d => handleManagerFormatter(get(d, 'list', [])) })

  const compareManagerArray = (arr1, arr2) => {
    const userMap = new Set(arr1.map(item => item.userId))

    const removedItemsArray = arr2.filter(item => !userMap.has(item.userId)).map(removedItem => ({ ...removedItem, isDeleted: true }))

    const newItemsArray = newManagerItem.map(newItem => ({
      ...newItem,
      isDeleted: false,
      siteProjectmanagerMappingId: null,
      userId: newItem.value,
    }))

    return [...removedItemsArray, ...newItemsArray]
  }

  const validateForm = async () => {
    const schema = yup.object().shape({
      siteName: yup.string().required('Facilities Name is required !'),
      siteCode: yup.string().required('Facilities Code is required !'),
      customer: yup.string().required('Customer Name is required !'),
      customerAddress: yup.string().required('Customer Address is required !'),
    })
    const isValid = await validateSchema(siteData, schema)
    setError(isValid)
    if (isValid === true) submitData(siteData)
  }

  const postSuccess = () => {
    onClose()
    reFetch()
    // setAfterFilterSite(true)
  }

  const { loading: isLoading, mutate: sites } = usePostData({ executer: facilities.site.create, postSuccess, message: { success: !isEdit ? 'Facility Create Successfully!' : 'Facility Update successfully!', error: 'Something went wrong' } })
  const submitData = async payload => {
    const newManagerValue = compareManagerArray(siteData.siteProjectmanagerList, get(anchorObj, 'siteProjectmanagerList', []))

    const obj = {
      ...payload,
      status: siteData.status,
      isAddAssetClassEnabled: !!parseInt(siteData.isAddAssetClassEnabled),
      companyId: localStorage.getItem('defaultCompanyId'),
      clientCompanyId: clientCompanyId,
    }
    if (isEdit) {
      sites({ ...obj, siteId: get(anchorObj, 'siteId', ''), siteProjectmanagerList: newManagerValue ? newManagerValue.map(d => ({ userId: d.userId, isDeleted: d.isDeleted, siteProjectmanagerMappingId: d.siteProjectmanagerMappingId })) : [] })
    } else {
      sites({ ...obj, siteProjectmanagerList: siteData.siteProjectmanagerList ? siteData.siteProjectmanagerList.map(d => ({ userId: d.value, isDeleted: false, siteProjectmanagerMappingId: null })) : [] })
    }
  }

  useEffect(() => {
    if (isEdit) {
      setSiteData({
        siteName: get(anchorObj, 'siteName', ''),
        siteCode: get(anchorObj, 'siteCode', ''),
        status: get(anchorObj, 'status', 1),
        isAddAssetClassEnabled: anchorObj.isAddAssetClassEnabled === true ? '1' : '0',
        customer: get(anchorObj, 'customer', ''),
        customerAddress: get(anchorObj, 'customerAddress', ''),
        siteProjectmanagerList: get(anchorObj, 'siteProjectmanagerList', []).map(d => ({ ...d, label: `${d.name} - ${d.email}`, value: d.userId, isDeleted: false })),
        profileImage: get(anchorObj, 'profileImage', null),
      })
    }
  }, [anchorObj, isEdit])

  const handleManager = selectedManagers => {
    setSiteData(prevState => ({
      ...prevState,
      siteProjectmanagerList: selectedManagers,
    }))
    const newAddedItem = selectedManagers.filter(d => !siteData.siteProjectmanagerList.some(e => e.userId === d.value))
    setNewManagerItem(newAddedItem)
  }

  const handleUpload = () => {
    uploadPhotosRef.current && uploadPhotosRef.current.click()
  }
  // const addPhoto = async e => {
  //   e.preventDefault()
  //   setPhotoUploading(true)

  //   // Get the file from the event target
  //   const inputElement = e.target
  //   const file = inputElement.files[0]

  //   if (!file) return // No file selected

  //   const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eps', 'heif', 'heic', 'JPEG', 'JPG', 'GIF', 'PNG', 'HEIF', 'HEIC']
  //   const extension = file.name.split('.').slice(-1).pop().toLowerCase()

  //   // Check if the file extension is valid
  //   if (!validExtensions.includes(extension)) {
  //     Toast.error('Invalid Image format!')
  //     return
  //   }

  //   // Convert HEIC/HEIF files to JPG using heic2any
  //   let processedFile = file
  //   if (['heic', 'heif'].includes(extension)) {
  //     try {
  //       const blob = await heic2any({
  //         blob: file,
  //         toType: 'image/jpeg',
  //       })

  //       processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
  //         type: 'image/jpeg',
  //       })
  //     } catch (error) {
  //       console.error('Error converting HEIC/HEIF to JPG:', error)
  //       Toast.error('Failed to process HEIC/HEIF format!')
  //       return
  //     }
  //   }

  //   // Proceed to upload the processed file
  //   const reader = new FileReader()
  //   reader.onload = () => {
  //     uploadPhoto(processedFile) // Upload the final file
  //   }
  //   reader.readAsDataURL(processedFile)

  //   // Reset the file input value
  //   if (inputElement && inputElement.value) {
  //     inputElement.value = null
  //   }
  // }

  const addPhoto = e => {
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

  const uploadPhoto = async file => {
    const fileData = new FormData()
    fileData.append('file', file)
    fileData.append('site_id', get(anchorObj, 'siteId', null))
    fileData.append('company_id', localStorage.getItem('companyId'))
    setPhotoUploading(true)
    try {
      const res = await facilities.site.uploadPhoto(fileData)
      if (res.success === 1) setSiteData({ ...siteData, profileImage: res.data.fileUrl })
      else Toast.error(res.message || 'Error uploading Image !')
    } catch (error) {
      Toast.error('Error uploading Image !')
    }
    setPhotoUploading(false)
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={!isEdit ? 'Add Facilities' : 'Edit Facilities'} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalInput value={get(siteData, 'siteName', '') || ''} onChange={value => handleInputChange('siteName', value)} error={error.siteName} onFocus={() => setError({ ...error, siteName: null })} label='Facilities Name' placeholder='Enter Facilities Name' w={100} />
            <MinimalInput value={get(siteData, 'siteCode', '') || ''} onChange={value => handleInputChange('siteCode', value)} error={error.siteCode} onFocus={() => setError({ ...error, siteCode: null })} label='Facilities Code' placeholder='Enter Facilities Code' w={100} />
            <MinimalButtonGroup label='Status' value={get(siteData, 'status', '') || ''} onChange={value => handleInputChange('status', value)} options={statusOptions} w={100} />
            <MinimalButtonGroup label='Is Allowed to Add Asset Class?' value={get(siteData, 'isAddAssetClassEnabled', '') || ''} onChange={value => handleInputChange('isAddAssetClassEnabled', value)} options={allowAddAsset} w={100} />
            <MinimalAutoComplete placeholder='Select Managers' label='Project Managers' value={siteData.siteProjectmanagerList.filter(d => !d.isDeleted)} onChange={v => handleManager(v)} options={managerOptions} isClearable w={100} isMulti isLoading={projectMamagerLoading} />
            <MinimalInput value={get(siteData, 'customer', '') || ''} onChange={value => handleInputChange('customer', value)} error={error.customer} onFocus={() => setError({ ...error, customer: null })} label='Customer Name' placeholder='Enter Customer Name' w={100} />
            <MinimalTextArea
              rows={3}
              value={get(siteData, 'customerAddress', '') || ''}
              onChange={e => handleInputChange('customerAddress', e.target.value)}
              error={error.customerAddress}
              onFocus={() => setError({ ...error, customerAddress: null })}
              placeholder='Enter Customer Address'
              label='Customer Address'
              w={100}
              baseStyles={{ marginBottom: 0 }}
            />
            <div style={{ marginTop: '4px' }}>
              <div className='d-flex justify-content-between'>
                <div className='text-bold'>Photo</div>
                <AssetImageUploadButton loading={isPhotoUploading} disabled={isPhotoUploading} onClick={handleUpload} />
              </div>
              <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
              {siteData.profileImage != null && (
                <div className='pt-3 mb-2 d-flex'>
                  <AssetImage onClick={() => setPreview(true)} onRemove={() => setSiteData(prev => ({ ...prev, profileImage: null }))} url={get(siteData, 'profileImage', null)} randomValue />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text={!isEdit ? 'Add' : 'Update'} loadingText={!isEdit ? 'Adding...' : 'Updating...'} onClick={validateForm} disabled={isLoading} loading={isLoading} style={{ marginLeft: '10px' }} />
      </div>

      {isPreviewOpen && <ImagePreview open={isPreviewOpen} onClose={() => setPreview(false)} imageIndex={0} images={[{ imageFileNameUrl: siteData.profileImage }]} urlKey='imageFileNameUrl' reFetch={() => setRandomValue(Math.random())} />}
    </Drawer>
  )
}

export default AddSites
