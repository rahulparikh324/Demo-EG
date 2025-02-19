import React, { useState, useRef } from 'react'
import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'
import RemoveIcon from '@material-ui/icons/Remove'
import { useTheme } from '@material-ui/core/styles'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'

import { FormTitle } from 'components/Maintainance/components'
import { Header, ImageEmptyState } from 'components/preventative-maintenance/forms/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'
import { MinimalButtonGroup, FloatingButton, MinimalButton } from 'components/common/buttons'
import { AssetImageUploadButton, AssetImage } from 'components/WorkOrders/onboarding/utils'
import { FormSection, PopupModal, LabelVal } from 'components/common/others'
import { Toast } from 'Snackbar/useToast'

import { header, containers, clearPmOptions, additonalPhotosColumns, irScanPhotosColumns, additonalPhotoTypeOptions } from 'components/preventative-maintenance/forms/thermography-data'
import { imageTypeOptions } from 'components/WorkOrders/onboarding/utils'

import { get, isEmpty, set } from 'lodash'
import enums from 'Constants/enums'
import { buckets } from 'Constants/aws-config'
import URL from 'Constants/apiUrls'
import getUserRole from 'helpers/getUserRole'
import { snakifyKeys } from 'helpers/formatters'

import preventativeMaintenance from 'Services/preventative-maintenance'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const ThermographyForm = ({ open, onClose, isView, submisson = {}, afterSubmit = () => {}, obj = {}, canBeSkipped, anyPmList, currentPmIndex, handleSkip, handleCancel, isInReview = false, isQuote, onEdit, isEdit }) => {
  const theme = useTheme()
  const userRole = new getUserRole()
  const [submissionData, setSubmissionData] = useState(submisson || {})
  const [photoKey, setPhotoKey] = useState('')
  const [loadingType, setLoadingType] = useState(0)
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [additionalPhotos, setAdditionalPhotos] = useState(get(submisson, 'footer.additionalPhotos', isView ? [{ caption: '', photo: '', type: null, id: 1 }] : []) || [])
  const [irScanPhotos, setIrScanPhotos] = useState(get(submisson, 'irScanPhotos', isView ? [{ irPhoto: '', visualPhoto: '', type: null }] : []) || [])
  const uploadPhotosRef = useRef(null)
  const readOnlyMode = !isEmpty(submisson) && isView
  //reject
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  if (!isEmpty(obj.assetClassName)) {
    header.subTitle = obj.assetClassName
  } else {
    header.subTitle = ''
  }
  //
  const handleUpload = key => {
    setPhotoKey(key)
    uploadPhotosRef.current && uploadPhotosRef.current.click()
  }
  const addPhoto = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else uploadPhoto(file)
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }
  const uploadPhoto = async file => {
    const formData = new FormData()
    formData.append('file', file)
    setPhotoUploading(true)
    try {
      const res = await preventativeMaintenance.forms.uploadPhoto(formData)
      if (res.success) addPhotoToData(res.data.fileUrl)
      else Toast.error(res.message || 'Error uploading Image !')
    } catch (error) {
      Toast.error('Error uploading Image !')
    }
    setPhotoUploading(false)
  }
  const addPhotoToData = url => {
    if (photoKey.includes('additionalPhotos')) return handleAdditionalPhoto(parseInt(photoKey.split('.')[1]), 'photo', url)
    const data = structuredClone(submissionData)
    const photos = get(data, photoKey, [])
    photos.push(url)
    set(data, photoKey, photos)
    setSubmissionData(data)
  }
  const removePhotos = (index, photoKey) => {
    const data = structuredClone(submissionData)
    const photos = get(data, photoKey, []).filter((d, i) => i !== index)
    set(data, photoKey, photos)
    setSubmissionData(data)
  }
  const Photos = ({ dataKey, photos = [], label }) => {
    return (
      <div>
        <div className='minimal-input-label mt-2'>{label}</div>
        <div className='pt-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
          {!isView && <AssetImageUploadButton loading={isPhotoUploading && photoKey === dataKey} onClick={() => handleUpload(dataKey)} />}
          {photos.map((d, index) => (
            <AssetImage readOnly={isView} onRemove={() => removePhotos(index, dataKey)} key={`asset-image-${d}-${index}`} url={d} randomValue />
          ))}
          {isView && isEmpty(photos) && <ImageEmptyState label='No images present !' />}
        </div>
      </div>
    )
  }
  //
  const handleOnChange = (key, value) => {
    const data = structuredClone(submissionData)
    set(data, key, value)
    setSubmissionData(data)
  }
  const evaluateConditions = (conditions = [], key) => {
    if (isEmpty(conditions)) return true
    let results = []
    conditions.forEach(({ condition, value }) => {
      const fetched = get(submissionData, `${key}.${condition}`, '')
      results.push(fetched === value)
    })
    results = [...new Set([...results])]
    if (results.length !== 1) return false
    else return results[0]
  }
  const handleSelectorChange = (key, value, options = [], label) => {
    const data = structuredClone(submissionData)
    const val = options.find(d => d.value === value)
    const labelKey = key.split('.')[0]
    set(data, key, val)
    set(data, `${labelKey}.label`, label)
    setSubmissionData(data)
  }
  const handleAdditionalPhoto = (index, key, value) => {
    const list = [...additionalPhotos]
    list[index][key] = value
    setAdditionalPhotos(list)
  }
  const handleIrPhoto = (index, key, value) => {
    const list = [...irScanPhotos]
    list[index][key] = value
    setIrScanPhotos(list)
  }
  //
  const handleAddNew = () => {
    const newRow = { type: null, caption: '', photo: '', id: additionalPhotos.length + 1 }
    setAdditionalPhotos([...additionalPhotos, newRow])
  }
  const handleAddNewIR = () => {
    const newRow = { type: imageTypeOptions[0], visualPhoto: '', irPhoto: '', id: irScanPhotos.length + 1 }
    setIrScanPhotos([...irScanPhotos, newRow])
  }
  const handleRemoveRow = id => {
    let list = [...additionalPhotos]
    list = list.filter(component => component.id !== id)
    setAdditionalPhotos(list)
  }
  const handleRemoveRowIR = id => {
    let list = [...irScanPhotos]
    list = list.filter(component => component.id !== id)
    setIrScanPhotos(list)
  }
  //
  const postSuccess = () => {
    setLoadingType(0)
    closeRejectReasonModal()
    onClose()
    afterSubmit(obj)
    if (canBeSkipped) skip()
  }
  const postError = () => {
    setLoadingType(0)
    closeRejectReasonModal()
    onClose()
  }
  const { loading, mutate } = usePostData({ executer: preventativeMaintenance.forms.submit, postError, postSuccess, message: { success: 'Work Order Line Updated !', error: 'Something went wrong' } })
  const validate = async status => {
    if (isEmpty(get(submissionData, 'footer.clearPmItem', {}))) return Toast.error('Please fill all the required fields !')
    const sub = structuredClone(submissionData)
    set(sub, 'footer.additionalPhotos', additionalPhotos)
    irScanPhotos.forEach(d => {
      const url = {}
      if (!isEmpty(d.irPhoto)) url.irPhoto = `https://s3-us-east-2.amazonaws.com//${buckets.irPhotos}/${getApplicationStorageItem('siteId')}/${obj.manualWoNumber}/${d.irPhoto}${d.type.value}`
      if (!isEmpty(d.visualPhoto)) url.visualPhoto = `https://s3-us-east-2.amazonaws.com//${buckets.irPhotos}/${getApplicationStorageItem('siteId')}/${obj.manualWoNumber}/${d.visualPhoto}${d.type.value}`
      d.imageUrls = url
    })
    set(sub, 'irScanPhotos', irScanPhotos)
    setLoadingType(status)
    mutate({ assetPmId: get(obj, 'assetPmId', null), tempAssetPmId: get(obj, 'tempAssetPmId', null), pmFormOutputData: JSON.stringify(sub), status, woonboardingassetsId: obj.woonboardingassetsId })
  }
  const handleClose = () => {
    if (canBeSkipped) handleCancel()
    onClose()
  }
  const skip = () => {
    handleSkip()
    onClose()
  }
  //
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const { loading: rejectLoading, mutate: rejectAsset } = usePostData({ executer: onBoardingWorkorder.updateAssetStatus, postError, postSuccess, message: { success: 'Rejected Successfully !', error: 'Error rejecting. Please try again !' } })
  const reject = () => rejectAsset(snakifyKeys({ taskRejectedNotes: reason, status: enums.woTaskStatus.Reject, woonboardingassetsId: get(obj, 'woonboardingassetsId', null) }))

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <FormTitle title={`${isView ? 'View' : 'Edit'} Form`} closeFunc={handleClose} onEdit={onEdit} isEdit={isEdit} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '620px' }}>
          {/* HEADER */}
          <div key='header-container' style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <input key='input' ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
            <Header title={header.title} subtitle={header.subTitle}>
              {userRole.isManager() && (
                <>
                  <LabelVal label='Building' value={get(obj, 'building', 'N/A')} />
                  <LabelVal label='Floor' value={get(obj, 'floor', 'N/A')} />
                  <LabelVal label='Room' value={get(obj, 'room', 'N/A')} />
                  <LabelVal label='Section' value={get(obj, 'section', 'N/A')} />
                </>
              )}
              {get(header, 'components', []).map(s => {
                const key = `${header.type}.${s.key}`
                const value = get(submissionData, key, '')
                if (s.type === 'input') return <MinimalInput key={key} onChange={value => handleOnChange(key, value)} value={value} type={get(s, 'inputType', 'text')} label={s.label} placeholder={s.label} hasSuffix={!isEmpty(s.suffix)} suffix={s.suffix} baseStyles={{ margin: 0 }} disabled={isView} />
                if (s.type === 'textarea') return <MinimalTextArea rows={3} onChange={e => handleOnChange(key, e.target.value)} key={key} value={value} label={s.label} placeholder={`Add ${s.label}`} baseStyles={{ marginRight: 0 }} disabled={isView} />
                if (s.type === 'select') return <MinimalAutoComplete key={key} onChange={value => handleOnChange(key, value)} value={value} label={s.label} options={get(s, 'values', [])} placeholder={`Select ${s.label}`} isClearable baseStyles={{ marginRight: 0 }} isDisabled={isView} />
                else return ''
              })}
            </Header>
          </div>
          {/* CONTAINERS */}
          {containers.map(container => {
            const cKey = `${container.key}.test`
            const cTest = !isEmpty(get(submissionData, cKey, '')) ? get(submissionData, cKey, '') : {}
            return (
              <div key={`container-${container.key}`} style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
                <MinimalButtonGroup key={cKey} value={get(cTest, 'value', '')} onChange={value => handleSelectorChange(cKey, value, get(container, 'values', []), container.label)} label={container.label} options={get(container, 'values', [])} w={100} baseStyles={{ marginRight: 0 }} disabled={isView} />
                <div style={{ display: container.hasGrid ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {get(container, 'components', []).map(d => {
                    const key = `${container.key}.${d.key}`
                    const show = evaluateConditions(d.show, container.key)
                    const label = !isEmpty(d.dynamicLabel) ? get(container, d.dynamicLabel.split('.').slice(1).join('.'), '') : d.label
                    if (d.type === 'select' && show) return <MinimalAutoComplete key={key} value={get(submissionData, key, '')} onChange={value => handleOnChange(key, value)} label={label} options={get(d, 'values', [])} placeholder={`Select ${label}`} isClearable baseStyles={{ margin: 0 }} isRequired={d.key === 'issueType'} isDisabled={isView} />
                    if (d.type === 'input' && show) return <MinimalInput key={key} onChange={value => handleOnChange(key, value)} value={get(submissionData, key, '')} type={get(d, 'inputType', 'text')} label={label} placeholder={label} hasSuffix={!isEmpty(d.suffix)} suffix={d.suffix} baseStyles={{ margin: 0 }} disabled={isView} />
                    return ''
                  })}
                </div>
                {cTest.value === 'notOk' && <Photos label='Photos' dataKey={`${container.key}.photos`} photos={get(submissionData, `${container.key}.photos`, [])} />}
              </div>
            )
          })}
          {/* IR PHOTOS */}
          <div key='ir-photo-container' style={{ padding: '16px 16px 1px 16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <FormSection title='IR Scan Photos' keepOpen>
              {readOnlyMode ? (
                <>
                  {isEmpty(irScanPhotos) ? (
                    <ImageEmptyState label='No IR Scan Photos' />
                  ) : (
                    <>
                      <div className='d-flex' style={{ border: '1px solid #dee2e6', borderRadius: '4px 4px 0 0', background: '#00000008' }}>
                        <div style={{ width: '50%', fontWeight: 800, padding: '8px 16px', borderRight: '1px solid #dee2e6' }}>IR Photo</div>
                        <div style={{ width: '50%', fontWeight: 800, padding: '8px 16px' }}>Visual Photo</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
                        {irScanPhotos.map((d, i) => (
                          <React.Fragment key={`vir-label-${i}`}>
                            <div className='pt-4 pb-2 d-flex  flex-column justify-content-center align-items-center' style={{ border: 'solid #dee2e6', borderWidth: '0 1px 1px 1px' }}>
                              <AssetImage readOnly url={!isEmpty(d.imageUrls.irPhoto) ? d.imageUrls.irPhoto : URL.noImageAvailable} key={`ir-image-${i}`} baseMargin randomValue />
                              <div className='text-bold'>{!isEmpty(d.irPhoto) ? `${get(d, 'irPhoto', '')}${d.type.value}` : 'Image Unavailable'}</div>
                            </div>
                            <div className='pt-4 pb-2 d-flex flex-column justify-content-center align-items-center' style={{ border: 'solid #dee2e6', borderWidth: '0 1px 1px 0' }}>
                              <AssetImage readOnly url={!isEmpty(d.imageUrls.visualPhoto) ? d.imageUrls.visualPhoto : URL.noImageAvailable} key={`vs-image-${i}`} baseMargin randomValue />
                              <div className='text-bold'>{!isEmpty(d.visualPhoto) ? `${get(d, 'visualPhoto', '')}${d.type.value}` : 'Image Unavailable'}</div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                  <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                    {irScanPhotosColumns.map(({ label, width }) => (
                      <div key={label} className='text-bold' style={{ width }}>
                        {label}
                      </div>
                    ))}
                  </div>
                  {irScanPhotos.map((d, index) => (
                    <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                      <MinimalInput w={36} value={get(irScanPhotos, `[${index}].irPhoto`, '')} onChange={value => handleIrPhoto(index, 'irPhoto', value)} placeholder='IR Photo #' baseStyles={{ margin: 0, marginRight: '10px' }} disabled={isView} />
                      <MinimalInput w={36} value={get(irScanPhotos, `[${index}].visualPhoto`, '')} onChange={value => handleIrPhoto(index, 'visualPhoto', value)} placeholder='Visual Photo #' baseStyles={{ margin: 0, marginRight: '10px' }} disabled={isView} />
                      <MinimalAutoComplete w={25} value={get(irScanPhotos, `[${index}].type`, '')} onChange={value => handleIrPhoto(index, 'type', value)} options={imageTypeOptions} placeholder='Type' baseStyles={{ marginBottom: '8px' }} menuPlacement='top' isDisabled={isView} />
                      <FloatingButton onClick={() => handleRemoveRowIR(d.id)} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', borderRadius: '4px' }} disabled={isView} />
                    </div>
                  ))}
                  {!isView && (
                    <div onClick={handleAddNewIR} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
                      Add New
                    </div>
                  )}
                </div>
              )}
            </FormSection>
          </div>
          {/* FOOTER */}
          <div key='footer-container' style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <MinimalAutoComplete value={get(submissionData, `footer.clearPmItem`, '')} onChange={value => handleOnChange(`footer.clearPmItem`, value)} label='Clear PM Item' options={clearPmOptions} placeholder='Select Clear PM Item' isRequired isClearable baseStyles={{ marginRight: 0 }} isDisabled={isView} />
            <MinimalTextArea rows={3} value={get(submissionData, `footer.comments`, '')} onChange={e => handleOnChange(`footer.comments`, e.target.value)} label='Comments' placeholder='Add Comments' baseStyles={{ marginRight: 0 }} disabled={isView} />
            <FormSection title='Additional Photos' keepOpen>
              <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                  {additonalPhotosColumns.map(({ label, width }) => (
                    <div key={label} className='text-bold' style={{ width }}>
                      {label}
                    </div>
                  ))}
                </div>
                {additionalPhotos.map((d, index) => (
                  <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                    <MinimalAutoComplete w={40} value={get(additionalPhotos, `[${index}].type`, '')} onChange={value => handleAdditionalPhoto(index, 'type', value)} options={additonalPhotoTypeOptions} placeholder={`Select Type`} isClearable baseStyles={{ marginBottom: 0 }} menuPlacement='top' isDisabled={isView} />
                    <MinimalInput w={40} value={get(additionalPhotos, `[${index}].caption`, '')} onChange={value => handleAdditionalPhoto(index, 'caption', value)} placeholder='Add Caption' baseStyles={{ margin: 0, marginRight: isEmpty(get(additionalPhotos, `[${index}].photo`, '')) ? 0 : '10px' }} disabled={isView} />
                    {isEmpty(get(additionalPhotos, `[${index}].photo`, '')) ? (
                      <FloatingButton w={12} onClick={() => handleUpload(`additionalPhotos.${index}.photo`)} icon={<AddAPhotoOutlinedIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} disabled={isView} />
                    ) : (
                      <AssetImage readOnly url={get(additionalPhotos, `[${index}].photo`, '')} width='42px' baseMargin='0px' randomValue />
                    )}
                    <FloatingButton onClick={() => handleRemoveRow(d.id)} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px', marginBottom: '8px' }} disabled={isView} />
                  </div>
                ))}
                {!isView && (
                  <div onClick={handleAddNew} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
                    Add New
                  </div>
                )}
              </div>
            </FormSection>
          </div>
        </div>
      </div>
      {!isView && (
        <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
          <div>
            {isInReview ? (
              <MinimalButton variant='contained' color='primary' text={`Save & Accept`} onClick={() => validate(enums.woTaskStatus.Complete)} disabled={loading && loadingType === enums.woTaskStatus.Complete} loading={loading && loadingType === enums.woTaskStatus.Complete} loadingText='Accepting...' style={{ background: '#37d482' }} />
            ) : (
              <MinimalButton variant='contained' color='default' text='Cancel' onClick={handleClose} />
            )}
            {canBeSkipped && <MinimalButton variant='contained' color='default' text='Skip' onClick={skip} baseClassName='ml-2' />}
          </div>
          <div>
            {isInReview ? (
              <>
                <MinimalButton variant='contained' color='primary' text='Hold' loadingText='Holding...' onClick={() => validate(enums.woTaskStatus.Hold)} loading={loading && loadingType === enums.woTaskStatus.Hold} disabled={loading && loadingType === enums.woTaskStatus.Hold} baseClassName='mr-2 yellow_button' />
                <MinimalButton variant='contained' color='primary' text='Reject' onClick={() => setIsRejectOpen(true)} baseClassName='red_button' />
              </>
            ) : (
              <>
                <MinimalButton
                  variant='contained'
                  color='primary'
                  text='Save'
                  onClick={() => validate(isQuote ? enums.woTaskStatus.Open : enums.woTaskStatus.InProgress)}
                  disabled={loading && isQuote ? loadingType === enums.woTaskStatus.Open : loadingType === enums.woTaskStatus.InProgress}
                  loading={loading && isQuote ? loadingType === enums.woTaskStatus.Open : loadingType === enums.woTaskStatus.InProgress}
                  loadingText='Saving...'
                  baseClassName='mr-2'
                />
                {!isQuote && (
                  <MinimalButton variant='contained' color='primary' text='Submit' onClick={() => validate(enums.woTaskStatus.ReadyForReview)} disabled={loading && loadingType === enums.woTaskStatus.ReadyForReview} loading={loading && loadingType === enums.woTaskStatus.ReadyForReview} loadingText='Submitting...' style={{ background: '#37d482' }} />
                )}
              </>
            )}
          </div>
        </div>
      )}
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={reject}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
    </Drawer>
  )
}

export default ThermographyForm
