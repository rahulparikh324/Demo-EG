import React, { useState, useRef } from 'react'
import usePostData from 'hooks/post-data'

import PersonOutlineOutlinedIcon from '@material-ui/icons/PersonOutlineOutlined'
import DomainOutlinedIcon from '@material-ui/icons/DomainOutlined'
import MailOutlineOutlinedIcon from '@material-ui/icons/MailOutlineOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import { StatusComponent, PopupModal, LabelVal } from 'components/common/others'
import { InformationContainer, Avatar, Info, NewInformationContainer } from 'components/User/profile/components'
import { ActionButton, MinimalButton } from 'components/common/buttons'
import { MinimalInput, MinimalAutoComplete, MinimalCountryCodePhoneInput } from 'components/Assets/components'
import { AssetImage, AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'

import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { handleNewRole } from 'helpers/handleNewRole'
import { get, isEmpty } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { validate, validateWithMobile } from 'components/User/profile/utils'
import enums from 'Constants/enums'

import user from 'Services/User'
import heic2any from 'heic2any'
import getDomainName from 'helpers/getDomainName'
import URL from 'Constants/apiUrls'

const Profile = () => {
  const userInfo = camelizeKeys(JSON.parse(localStorage.getItem('loginData')))
  const defaultSelectedCompany = get(userInfo, 'clientCompany', []).find(d => d.clientCompanyName === localStorage.getItem('clientCompanyName'))
  const defaultFacilityOptions = get(defaultSelectedCompany, 'clientCompanyUsersites', []).map(d => ({ ...d, label: d.siteName, value: d.siteId }))
  const [isEditMode, setEditMode] = useState(false)
  const [defaultSite, setDefault] = useState({ label: localStorage.getItem('defaultSiteName'), value: localStorage.getItem('defaultSiteId') })
  const [errors, setErrors] = useState({})
  const uploadPhotoRef = useRef(null)
  const uploadSignatureRef = useRef(null)
  const [imageSRC, setImageSRC] = useState('')
  const [imageSignatureSRC, setImageSignatureSRC] = useState('')
  const [isCropMode, setCropMode] = useState(false)
  const [isCropSignatureMode, setCropSignatureMode] = useState(false)
  const [crop, setCrop] = useState()
  const [cropSignature, setCropSignature] = useState()
  const imageRef = useRef(null)
  const signatureRef = useRef(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [signatureUploading, setSignatureUploading] = useState(false)
  const userObj = isEmpty(JSON.parse(localStorage.getItem('userObj')))
    ? { firstname: get(userInfo, 'firstname', ''), lastname: get(userInfo, 'lastname', ''), jobTitle: get(userInfo, 'jobTitle', ''), fileUrl: get(userInfo, 'profilePictureUrl', ''), filename: get(userInfo, 'profilePictureName', ''), mobileNumber: get(userInfo, 'mobileNumber', '') }
    : JSON.parse(localStorage.getItem('userObj'))
  const [photoData, setPhotoData] = useState(isEmpty(JSON.parse(localStorage.getItem('userObj'))) ? { fileUrl: get(userInfo, 'profilePictureUrl', ''), filename: get(userInfo, 'profilePictureName', '') } : { fileUrl: get(userObj, 'profilePictureUrl', ''), filename: get(userObj, 'profilePictureName', '') })
  const [signatureData, setSignatureData] = useState(isEmpty(JSON.parse(localStorage.getItem('userObj'))) ? { fileUrl: get(userInfo, 'signatureUrl', '') } : { fileUrl: get(userObj, 'signatureUrl', '') })
  const [firstName, setFirstName] = useState(get(userObj, 'firstname', ''))
  const [lastName, setLastName] = useState(get(userObj, 'lastname', ''))
  const [jobTitle, setJobTitle] = useState(get(userObj, 'jobTitle', ''))
  const [countryCode, setCountryCode] = useState(get(userObj, 'mobileNumber', null) ? get(userObj, 'mobileNumber', '').slice(0, -10) : '+1')
  const [mobileNumber, setMobileNumber] = useState(get(userObj, 'mobileNumber', null) ? get(userObj, 'mobileNumber', '').slice(-10) : get(userObj, 'mobileNumber', ''))
  const [isSignature, setSignature] = useState(false)
  const [heifUploading, setHeifUploading] = useState(false)

  const countryCodeOptions = [
    {
      id: 1,
      type: 'button',
      text: '+1',
      onClick: () => setCountryCode('+1'),
      show: true,
      seperatorBelow: URL.BASE.split('.').length !== 3,
    },
  ]

  if (URL.BASE.split('.').length !== 3 || getDomainName() === 'democompany' || getDomainName() === 'acme') {
    countryCodeOptions.push({
      id: 2,
      type: 'button',
      text: '+91',
      onClick: () => setCountryCode('+91'),
      show: true,
      seperatorBelow: false,
    })
  }

  //
  const postSuccess = () => {
    const payload = {
      firstname: firstName,
      lastname: lastName,
      profilePictureName: get(photoData, 'filename', ''),
      profilePictureUrl: get(photoData, 'fileUrl', ''),
      signatureUrl: get(signatureData, 'fileUrl', ''),
      jobTitle: jobTitle,
      mobileNumber: mobileNumber ? `${countryCode}${mobileNumber}` : null,
    }
    localStorage.setItem('userObj', JSON.stringify(payload))
    localStorage.setItem('defaultSiteName', defaultSite.label)
    localStorage.setItem('defaultSiteId', defaultSite.value)
    setEditMode(false)
    window.dispatchEvent(new Event('storage'))
  }
  const postError = () => {
    setEditMode(false)
  }
  const { loading, mutate } = usePostData({ executer: user.profile.update, postError, postSuccess, message: { success: 'Profile Updated !', error: 'Something went wrong' } })
  const renderChips = ({ list = [], label, key }) => (
    <div className='d-flex mt-1' style={{ flexWrap: 'wrap' }}>
      {list.map(d => (
        <div className='px-2 py-1 mr-2 mb-2' style={{ border: '1px dashed', width: 'fit-content', borderRadius: '4px' }} key={d[key]}>
          {d[label]}
        </div>
      ))}
    </div>
  )
  const handleUpload = () => uploadPhotoRef.current && uploadPhotoRef.current.click()

  const handleUploadSignature = () => uploadSignatureRef.current && uploadSignatureRef.current.click()

  // const addSignature = async e => {
  //   e.preventDefault()
  //   setHeifUploading(true)

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

  //   // Create an object URL for the processed file and set the state
  //   setImageSignatureSRC(window.URL.createObjectURL(processedFile))
  //   setCropSignatureMode(true)
  //   setHeifUploading(false)

  //   // Reset the input value
  //   if (inputElement && inputElement.value) {
  //     inputElement.value = null
  //   }
  // }

  const addSignature = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else {
        setImageSignatureSRC(window.URL.createObjectURL(file))
        setCropSignatureMode(true)
      }
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }

  const handleCloseSignaturePopUp = () => {
    setCropSignatureMode(false)
    setCropSignature()
    setImageSignatureSRC('')
    setSignature(false)
  }

  const onSignatureLoad = e => {
    const { width, height } = e.currentTarget
    setCropSignature({ width: 150, height: 70, x: (width - 150) / 2, y: (height - 80) / 2, unit: 'px' })
    setSignature(true)
  }

  const uploadSignature = async () => {
    const image = signatureRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const cropX = cropSignature.x * scaleX // Apply scale to crop position
    const cropY = cropSignature.y * scaleY
    const cropWidth = cropSignature.width * scaleX
    const cropHeight = cropSignature.height * scaleY

    const canvas = new OffscreenCanvas(cropWidth, cropHeight)
    canvas.width = Math.floor(cropWidth)
    canvas.height = Math.floor(cropHeight)

    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)

    const blob = await canvas.convertToBlob({ type: 'image/png' })
    uploadPhoto(blob)
  }

  // const addPhoto = async e => {
  //   e.preventDefault()
  //   setPhotoUploading(true)
  //   setSignatureUploading(true)

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
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else {
        setImageSRC(window.URL.createObjectURL(file))
        setCropMode(true)
      }
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }

  const handleClosePopUp = () => {
    setCropMode(false)
    setCrop()
    setImageSRC('')
  }
  const onImageLoad = e => {
    const { width, height } = e.currentTarget
    setCrop({ width: 100, height: 100, x: width / 2 - 50, y: height / 2 - 50, unit: 'px' })
  }
  const uploadImage = async () => {
    const image = imageRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const canvas = new OffscreenCanvas(crop.width * scaleX, crop.height * scaleY)
    canvas.width = Math.floor(crop.width * scaleX)
    canvas.height = Math.floor(crop.height * scaleY)
    const ctx = canvas.getContext('2d')
    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2
    ctx.save()
    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight)
    const blob = await canvas.convertToBlob({ type: 'image/png' })
    uploadPhoto(blob)
  }
  const uploadPhoto = async file => {
    const formData = new FormData()
    formData.append('file', file)
    setPhotoUploading(true)
    setSignatureUploading(true)
    try {
      const res = await user.profile.uploadPhoto(formData)
      if (res.success) {
        if (isSignature) {
          setSignatureData(res.data)
        } else {
          setPhotoData(res.data)
        }
        handleClosePopUp()
        handleCloseSignaturePopUp()
      } else {
        Toast.error(res.message || 'Error Uploading Image !')
        handleClosePopUp()
        handleCloseSignaturePopUp()
      }
    } catch (error) {
      Toast.error('Error Uploading Image !')
      handleClosePopUp()
      handleCloseSignaturePopUp()
    }
    setPhotoUploading(false)
    setSignatureUploading(false)
  }
  //
  const validateProfile = async () => {
    const playload = { firstName, lastName, mobileNumber, defaultSite: get(defaultSite, 'value', '') }
    const isValid = userInfo.isMfaEnabled ? await validateWithMobile(playload) : await validate(playload)

    setErrors(isValid)
    if (isValid === true) updateProfile()
  }
  const updateProfile = async () => {
    const payload = {
      ...userInfo,
      firstname: firstName,
      lastname: lastName,
      acDefaultSite: get(defaultSite, 'value', ''),
      acActiveSite: get(defaultSite, 'value', ''),
      profilePictureName: get(photoData, 'filename', ''),
      signatureUrl: get(signatureData, 'fileUrl', ''),
      jobTitle: jobTitle,
      mobileNumber: mobileNumber ? `${countryCode}${mobileNumber}` : null,
    }
    mutate(snakifyKeys(payload))
  }
  const renderChip = value => {
    if (!value) return
    const { label } = enums.USER_STATUS_CHIPS.find(d => d.value === value)
    return label
  }
  const handleCloseEdit = () => {
    setEditMode(false)
    setJobTitle(get(userObj, 'jobTitle', ''))
    setSignatureData(isEmpty(JSON.parse(localStorage.getItem('userObj'))) ? { fileUrl: get(userInfo, 'signatureUrl', '') } : { fileUrl: get(userObj, 'signatureUrl', '') })
    setPhotoData(isEmpty(JSON.parse(localStorage.getItem('userObj'))) ? { fileUrl: get(userInfo, 'profilePictureUrl', ''), filename: get(userInfo, 'profilePictureName', '') } : { fileUrl: get(userObj, 'profilePictureUrl', ''), filename: get(userObj, 'profilePictureName', '') })
    setDefault({ label: localStorage.getItem('defaultSiteName'), value: localStorage.getItem('defaultSiteId') })
    setFirstName(get(userObj, 'firstname', ''))
    setLastName(get(userObj, 'lastname', ''))
    setMobileNumber(get(userObj, 'mobileNumber', ''))
  }

  const handleOnChange = e => {
    if (e) {
      const num = e.replace(/\D/g, '')
      setMobileNumber(num)
    } else setMobileNumber('')
  }

  //
  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '20px', background: '#fff' }}>
      <div className='d-flex mt-3'>
        <div style={{ width: '40%', height: 'fit-content', border: '1px solid #A6A6A660', borderRadius: '4px', position: 'relative', padding: '20px' }} className='ml-3'>
          <NewInformationContainer label='Personal Information' icon={<PersonOutlineOutlinedIcon />} style={{ position: 'absolute', top: '-40px', left: 30 }} />
          {!isEditMode && <MinimalButton text='Edit' onClick={() => setEditMode(true)} size='small' startIcon={<EditOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ position: 'absolute', right: 20, top: '-15px' }} />}
          <div className='d-flex align-items-center p-2 mt-3'>
            {isEmpty(photoData.filename) ? (
              isEditMode ? (
                <AssetImageUploadButton onClick={handleUpload} isOld loading={photoUploading} />
              ) : (
                <Avatar firstName={get(userObj, 'firstname', '')} lastName={get(userObj, 'lastname', '')} style={{ minWidth: '85px' }} />
              )
            ) : (
              <AssetImage width='85px' readOnly={!isEditMode ? true : false} url={get(photoData, 'fileUrl', '')} onRemove={() => setPhotoData({})} style={{ minWidth: '85px' }} randomValue />
            )}
            <input key='input' ref={uploadPhotoRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
            <div>
              {!isEditMode && (
                <div className='text-bold' style={{ fontSize: '18px', marginLeft: '11px' }}>
                  {get(userObj, 'firstname', '')} {get(userObj, 'lastname', '')}
                </div>
              )}
              {isEditMode && (
                <div className='d-flex align-items-center mt-3 ml-2'>
                  <MinimalInput onFocus={() => setErrors({ ...errors, firstName: null })} error={errors.firstName} value={firstName} onChange={setFirstName} label='First Name' w={100} />
                  <MinimalInput onFocus={() => setErrors({ ...errors, lastName: null })} error={errors.lastName} value={lastName} onChange={setLastName} label='Last Name' w={100} />
                </div>
              )}

              <div className='d-flex align-items-center mt-2'>
                <div className='d-flex align-items-center flex-wrap'>
                  {get(userInfo, 'userroles', []).map(d => (
                    <div key={d.roleId} className='ml-2 mb-2'>
                      <StatusComponent color='#848484' label={handleNewRole(d.roleName)} size='small' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='p-2'>
            <div className='text-bold d-flex align-items-center' style={{ fontSize: '16px', color: '#778899' }}>
              <PersonOutlineOutlinedIcon style={{ color: '#778899' }} /> Details
            </div>
            <div className='mt-3' style={{ display: 'grid', gridTemplateColumns: '2fr 4fr' }}>
              <div className='text-bold mb-3' style={{ fontSize: '14px' }}>
                Email:
              </div>
              <div className='mb-3' style={{ fontSize: '14px' }}>
                {get(userInfo, 'email', '')}
              </div>
              <div className='text-bold mb-3' style={{ fontSize: '14px' }}>
                Status:
              </div>
              <div className='mb-3' style={{ fontSize: '14px' }}>
                <StatusComponent color='#3941F1' label={renderChip(get(userInfo, 'status', ''))} size='small' />
              </div>

              {!isEditMode && (
                <>
                  <div className='text-bold mb-3' style={{ fontSize: '14px' }}>
                    Mobile Number:
                  </div>
                  <div className='mb-3' style={{ fontSize: '14px' }}>
                    {get(userObj, 'mobileNumber', '')}
                  </div>
                  <div className='text-bold mb-3' style={{ fontSize: '14px' }}>
                    Job Title:
                  </div>
                  <div className='mb-3' style={{ fontSize: '14px' }}>
                    {get(userObj, 'jobTitle', '')}
                  </div>
                  <div className='text-bold mb-3' style={{ fontSize: '14px' }}>
                    Default Facility:
                  </div>
                  <div className='mb-3' style={{ fontSize: '14px' }}>
                    {get(defaultSite, 'label', '')}
                  </div>
                  <div className='text-bold mb-3' style={{ fontSize: '14px' }}>
                    Signature:
                  </div>
                  <div style={{ border: '1px dashed', width: '180px', borderRadius: '6px', height: '72px' }} className=' d-flex align-items-center justify-content-center'>
                    {!isEmpty(signatureData.fileUrl) ? (
                      <div style={{ backgroundImage: `url(${encodeURI(get(signatureData, 'fileUrl', ''))})`, backgroundSize: 'cover', width: '178px', height: '70px', backgroundPosition: 'center', display: 'inline-block', borderRadius: '4px' }}></div>
                    ) : (
                      <div className='text-bold' style={{ color: '#848484' }}>
                        Signature Not Uploaded
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {isEditMode && (
              <>
                <div className='mb-2'>
                  <MinimalCountryCodePhoneInput onFocus={() => setErrors({ ...errors, mobileNumber: '' })} error={errors.mobileNumber} dropDownMenuOptions={countryCodeOptions} btnText={countryCode} label='Mobile Number' value={mobileNumber} onChange={e => handleOnChange(e)} w={98} type='tel' />
                </div>
                <div className='mb-3'>
                  <MinimalInput value={jobTitle} onChange={setJobTitle} label='Job Title' />
                </div>
                <div className='mb-3'>
                  <MinimalAutoComplete onFocus={() => setErrors({ ...errors, defaultSite: null })} error={errors.defaultSite} options={defaultFacilityOptions} value={defaultSite} onChange={value => setDefault(value)} label='Default Facility' baseStyles={{ marginTop: '8px' }} />
                </div>
                <div className=' mb-3 d-flex align-items-center flex-wrap'>
                  <LabelVal
                    label='Signature'
                    value={
                      <div style={{ border: '1px dashed', width: '180px', height: '73px', borderRadius: '6px' }} className=' d-flex align-items-center justify-content-center'>
                        {!isEmpty(signatureData.fileUrl) ? (
                          <div
                            style={{
                              backgroundImage: `url(${encodeURI(get(signatureData, 'fileUrl', ''))})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              width: '178px',
                              height: '70px',
                              display: 'inline-block',
                              borderRadius: '4px',
                            }}
                          ></div>
                        ) : (
                          <div className='text-bold' style={{ color: '#848484' }}>
                            Signature Not Uploaded
                          </div>
                        )}
                      </div>
                    }
                    size='small'
                  />
                  <div className='d-flex flex-column ml-3 mt-4'>
                    <MinimalButton variant='contained' text='Remove' color='primary' baseClassName='mb-2' onClick={() => setSignatureData({})} disabled={isEmpty(signatureData.fileUrl)} style={{ height: '30px' }} />
                    <input key='input' ref={uploadSignatureRef} type='file' style={{ display: 'none' }} onChange={addSignature} />
                    <MinimalButton variant='contained' text='Upload New' color='primary' onClick={handleUploadSignature} style={{ height: '30px' }} loading={heifUploading} loadingText='processing...' />
                  </div>
                </div>
              </>
            )}
          </div>
          {isEditMode && (
            <div className='d-flex align-items-center mt-2 ml-2'>
              <MinimalButton variant='contained' color='default' text='Cancel' onClick={handleCloseEdit} baseClassName='mr-2' />
              <MinimalButton variant='contained' text='Update' loading={loading} disabled={loading} loadingText='Updating...' color='primary' onClick={validateProfile} />
            </div>
          )}
        </div>
        <div style={{ width: '60%', height: 'fit-content', border: '1px solid #A6A6A660', borderRadius: '4px', position: 'relative', padding: '20px' }} className='mx-3'>
          <NewInformationContainer label='Client Companies & Facilities' icon={<DomainOutlinedIcon />} style={{ position: 'absolute', top: '-40px', left: 30 }} />
          <div className='mt-3' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className='text-bold ml-2' style={{ fontSize: '16px' }}>
              Client Companies
            </div>
            <div className='text-bold ml-2' style={{ fontSize: '16px' }}>
              Facilities
            </div>
          </div>
          {get(userInfo, 'clientCompany', []).map(clientCompany => {
            return (
              <div className='mt-3' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} key={clientCompany.clientCompanyId}>
                <div className='text-bold ml-2' style={{ fontSize: '14px' }}>
                  {clientCompany.clientCompanyName}
                </div>
                <div className='ml-2'>{renderChips({ list: get(clientCompany, 'clientCompanyUsersites', []), label: 'siteName', key: 'siteId' })}</div>
              </div>
            )
          })}
        </div>
        {isCropMode && (
          <PopupModal open={isCropMode} onClose={handleClosePopUp} loading={photoUploading} cta='Upload' loadingText='Uploading' title='Profile Image' handleSubmit={uploadImage} isFixed>
            <ReactCrop aspect={1} crop={crop} onChange={c => setCrop(c)}>
              <img ref={imageRef} src={imageSRC} onLoad={onImageLoad} style={{ height: 'calc(100vh - 350px)', objectFit: 'cover' }} />
            </ReactCrop>
          </PopupModal>
        )}
        {isCropSignatureMode && (
          <PopupModal open={isCropSignatureMode} onClose={handleCloseSignaturePopUp} loading={signatureUploading} cta='Upload' loadingText='Uploading' title='Signature Image' handleSubmit={uploadSignature} isFixed>
            <ReactCrop aspect={5 / 2} crop={cropSignature} onChange={c => setCropSignature(c)}>
              <img ref={signatureRef} src={imageSignatureSRC} onLoad={onSignatureLoad} style={{ height: 'calc(100vh - 350px)', objectFit: 'cover' }} />
            </ReactCrop>
          </PopupModal>
        )}
      </div>
    </div>
  )
}

export default Profile
