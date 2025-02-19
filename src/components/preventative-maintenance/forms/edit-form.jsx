import React, { useState, useRef, useEffect } from 'react'
import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'
import RemoveIcon from '@material-ui/icons/Remove'
import { useTheme } from '@material-ui/core/styles'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'
import AddIcon from '@material-ui/icons/Add'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import Checkbox from '@material-ui/core/Checkbox'

import { FormTitle } from 'components/Maintainance/components'
import { Header } from 'components/preventative-maintenance/forms/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'
import { MinimalButtonGroup, FloatingButton, MinimalButton } from 'components/common/buttons'
import { AssetImageUploadButton, AssetImage } from 'components/WorkOrders/onboarding/utils'
import { FormSection, PopupModal, LabelVal } from 'components/common/others'
import { Toast } from 'Snackbar/useToast'

import { get, isEmpty, set } from 'lodash'
import enums from 'Constants/enums'
import { snakifyKeys } from 'helpers/formatters'

import preventativeMaintenance from 'Services/preventative-maintenance'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { nanoid } from 'nanoid'
import { IconButton, Tooltip } from '@material-ui/core'

const EditForm = ({ open, onClose, data, submisson, obj, afterSubmit, canBeSkipped, anyPmList, currentPmIndex, handleSkip, handleCancel, isInReview = false, isQuote, equipmentListOptions = [] }) => {
  const theme = useTheme()
  const metaData = { planType: { label: 'De Energized', value: 'deEnergized', isDisable: false }, isEnhanced: false }
  const [submissionData, setSubmissionData] = useState(submisson || { metaData })
  const [photoKey, setPhotoKey] = useState('')
  const [loadingType, setLoadingType] = useState(0)
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const uploadPhotosRef = useRef(null)
  //reject
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isEnhancedDisabled, setIsEnhancedDisabled] = useState(false)
  const defaultTorqueDetail = {
    equipment: null,
    noOfItems: '',
    locationDescription: '',
    vendorSpecs: '',
    vendorMeasureValue: null,
    netaSpecs: '',
    netaMeasureValue: null,
    torqueSpacs: '',
    torqueMeasureValue: null,
    note: '',
    id: nanoid(),
  }
  const [torqueDetailList, setTorqueDetailList] = useState(get(submissionData, 'torqueDetails', []))
  const equipmentOptions = [...equipmentListOptions.map(e => ({ label: e.equipmentNumber, value: e.equipmentNumber }))]
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
        <div className='minimal-input-label'>{label}</div>
        <div className='pt-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
          <AssetImageUploadButton loading={isPhotoUploading && photoKey === dataKey} onClick={() => handleUpload(dataKey)} />
          {photos.map((d, index) => (
            <AssetImage onRemove={() => removePhotos(index, dataKey)} key={`asset-image-${d}-${index}`} url={d} randomValue />
          ))}
        </div>
      </div>
    )
  }
  const handleOnChange = (key, value) => {
    const data = structuredClone(submissionData)
    set(data, key, value)
    setSubmissionData(data)
  }
  const handleSelectorChange = (key, value, options = []) => {
    const data = structuredClone(submissionData)
    const val = options.find(d => d.value === value)
    const labelKey = key.split('.')[0]
    const labelObj = get(body, 'components', []).find(d => d.key === labelKey)
    set(data, key, val)
    set(data, `${labelKey}.title`, labelObj.title)
    setSubmissionData(data)
  }
  // data
  const header = get(data, 'components', []).find(d => d.type === 'header')
  const footer = get(data, 'components', []).find(d => d.type === 'footer')
  const body = get(data, 'components', []).find(d => d.type === 'body')
  const torqueBody = get(data, 'components', []).find(d => d.type === 'torqueBody')
  const containerComponents = get(data, 'container', [])
  const pm = get(footer, 'components', []).find(d => d.key === 'clearPmItem')
  const additonalPhotosColumns = [
    { label: 'Type', width: '40%' },
    { label: 'Caption', width: '40%' },
    { label: 'Photo', width: '12%' },
    { label: 'Action', width: '8%' },
  ]
  const panel = get(footer, 'components', []).find(d => d.key === 'additionalPhotosPanel')
  const grid = get(panel, 'components', []).find(d => d.key === 'additionalPhotos')
  const type = get(grid, 'rows[0]', []).find(d => d.key === 'type')
  const [additionalPhotos, setAdditionalPhotos] = useState(get(submisson, 'footer.additionalPhotos', []) || [])
  //
  const handleAddNew = () => {
    const newRow = { type: null, caption: '', photo: '', id: additionalPhotos.length + 1 }
    setAdditionalPhotos([...additionalPhotos, newRow])
  }
  const handleRemoveRow = id => {
    let list = [...additionalPhotos]
    list = list.filter(component => component.id !== id)
    setAdditionalPhotos(list)
  }
  const handleAdditionalPhoto = (index, key, value) => {
    const list = [...additionalPhotos]
    list[index][key] = value
    setAdditionalPhotos(list)
  }
  //
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

  useEffect(() => {
    const planTypeDetail = get(body, 'components', [])
      .find(d => get(d, 'key') === 'metaData')
      ?.components.find(d => get(d, 'key') === 'planType')
    if (!isEmpty(planTypeDetail)) {
      const planTypeOptions = planTypeDetail.values
      planTypeOptions.forEach(item => {
        if (get(body, 'components', []).filter(d => get(d, 'type') === 'container' && d.planType === item.value).length === 0) {
          //make not available option disable
          item.isDisable = true
          const otherPlanType = planTypeDetail.values.find(e => e.value !== item.value)
          if (!isEmpty(otherPlanType) && get(body, 'components', []).filter(d => get(d, 'type') === 'container' && d.planType === otherPlanType.value).length !== 0) {
            handleTypeSelectorChange('metaData.planType', otherPlanType.value, planTypeOptions)
          } else {
            //make not available option disable
            planTypeOptions.forEach(item => {
              item.isDisable = true
            })
            handleTypeSelectorChange('metaData.planType', '', planTypeOptions)
          }
        }
      })
    } else {
      const detail = handleTypeSelectorSection()
      setIsEnhancedDisabled(detail.isEnhancedCheckboxDisabled)
      if (detail.isEnhancedCheckboxDisabled) {
        handleEnhancedChange('metaData.isEnhanced', detail.isEnhancedChecked)
      }
    }
  }, [])

  const handleTypeSelectorSection = (planType = null) => {
    if (isEmpty(planType)) {
      planType = get(submissionData, 'metaData.planType.value', '')
    }
    const totalBodyContaintersLength = get(body, 'components', []).filter(d => get(d, 'type') === 'container' && (d.planType === planType || d.type === 'typeSelector')).length
    const noEnhancedContainersLength = get(body, 'components', []).filter(d => get(d, 'type') === 'container' && (d.planType === planType || d.type === 'typeSelector') && get(d, 'isEnhanced') === false).length
    const onlyEnhancedContainersLength = get(body, 'components', []).filter(d => get(d, 'type') === 'container' && (d.planType === planType || d.type === 'typeSelector') && get(d, 'isEnhanced') === true).length
    const isEnhancedChecked = onlyEnhancedContainersLength === totalBodyContaintersLength ? true : false
    const isEnhancedCheckboxDisabled = noEnhancedContainersLength === totalBodyContaintersLength ? true : onlyEnhancedContainersLength === totalBodyContaintersLength ? true : false
    return {
      isEnhancedChecked,
      isEnhancedCheckboxDisabled,
    }
  }
  const handleTypeSelectorChange = (key, value, options = []) => {
    const data = structuredClone(submissionData)
    const val = options.find(d => d.value === value)
    set(data, key, val)
    //handle enhanced checkbox
    set(data, 'metaData.isEnhanced', false)
    if (isEmpty(value)) {
      setIsEnhancedDisabled(true)
    } else {
      const detail = handleTypeSelectorSection(value)
      setIsEnhancedDisabled(detail.isEnhancedCheckboxDisabled)
      if (detail.isEnhancedCheckboxDisabled) {
        set(data, 'metaData.isEnhanced', detail.isEnhancedChecked)
      }
    }
    setSubmissionData(data)
  }
  const handleEnhancedChange = (key, value) => {
    const data = structuredClone(submissionData)
    set(data, key, value)
    setSubmissionData(data)
  }
  //
  const postSuccess = () => {
    setLoadingType(0)
    onClose()
    closeRejectReasonModal()
    afterSubmit(obj)
    if (canBeSkipped) skip()
  }
  const postError = () => {
    setLoadingType(0)
    closeRejectReasonModal()
    onClose()
  }
  const { loading, mutate } = usePostData({ executer: preventativeMaintenance.forms.submit, postError, postSuccess, message: { success: 'Work Order Line Updated !', error: 'Something went wrong' } })
  const updateDataBasedOnType = sub => {
    const filledContainers = get(body, 'components', []).filter(d => d.planType === get(submissionData, 'metaData.planType.value', ''))
    const containersToBeSent = ['header', 'footer', 'metaData']
    filledContainers.forEach(d => {
      if (!d.isEnhanced) containersToBeSent.push(d.key)
      else if (get(submissionData, 'metaData.isEnhanced', false)) containersToBeSent.push(d.key)
    })
    Object.keys(sub).forEach(d => {
      if (!containersToBeSent.includes(d)) delete sub[d]
      else {
        if (!['header', 'footer', 'metaData'].includes(d)) {
          if (!isEmpty(sub[d])) {
            const issueContainer = filledContainers.find(q => q.key === d)
            sub[d]['title'] = get(issueContainer, 'title', '')
          }
        }
      }
    })
    return sub
  }
  const validate = async status => {
    const issueKeys = Object.keys(submissionData).filter(d => !['header', 'footer'].includes(d))
    const issueTypeFilled = [...new Set([...issueKeys.map(issue => get(submissionData, `${issue}.test.value`, '') === 'notOk' && isEmpty(get(submissionData, `${issue}.issueType`, {})))])]
    const isIssueValid = (issueTypeFilled.length === 1 && !issueTypeFilled[0]) || isEmpty(issueTypeFilled)
    if (!isIssueValid) return Toast.error('Please fill all the required fields !')
    if (isEmpty(get(submissionData, 'footer.clearPmItem', {}))) return Toast.error('Please fill all the required fields !')
    const sub = structuredClone(submissionData)
    set(sub, 'footer.additionalPhotos', additionalPhotos)
    const updatedSubmission = updateDataBasedOnType(sub)
    if (!isEmpty(torqueBody)) {
      updatedSubmission.torqueDetails = [...torqueDetailList]
    }
    setLoadingType(status)
    mutate({ assetPmId: get(obj, 'assetPmId', null), tempAssetPmId: get(obj, 'tempAssetPmId', null), pmFormOutputData: JSON.stringify(updatedSubmission), status, woonboardingassetsId: obj.woonboardingassetsId })
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

  const addNewTorqueLine = () => {
    const torqueListData = [...torqueDetailList]
    const torqueDetail = {
      ...defaultTorqueDetail,
      vendorMeasureValue: !isEmpty(get(torqueBody, 'measurementUnits', [])) ? get(torqueBody, 'measurementUnits', [])[0] : null,
      netaMeasureValue: !isEmpty(get(torqueBody, 'measurementUnits', [])) ? get(torqueBody, 'measurementUnits', [])[0] : null,
      torqueMeasureValue: !isEmpty(get(torqueBody, 'measurementUnits', [])) ? get(torqueBody, 'measurementUnits', [])[0] : null,
    }
    torqueListData.push(torqueDetail)
    setTorqueDetailList(torqueListData)
  }

  const removeTorque = item => {
    const torqueListData = [...torqueDetailList]
    const actualTorqueListData = torqueListData.filter(e => e !== item)
    setTorqueDetailList(actualTorqueListData)
  }

  const handleTorqueDetailChange = (id, value, key) => {
    const updatedTorqueDetail = [...torqueDetailList]
    const currentTorqueDetail = updatedTorqueDetail.find(d => d.id === id)
    currentTorqueDetail[key] = value
    setTorqueDetailList(updatedTorqueDetail)
  }

  const copyTorque = id => {
    const torqueList = [...torqueDetailList]
    const torqueDetail = torqueList.find(d => d.id === id)
    if (!isEmpty(torqueDetail)) {
      torqueList.push({ ...torqueDetail, id: nanoid() })
      setTorqueDetailList(torqueList)
    }
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <FormTitle title='Edit Form' closeFunc={handleClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '620px' }}>
          {/* HEADER */}
          <div key='header-container' style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <input key='input' ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
            <Header title={header.title} subtitle={header.subTitle}>
              <LabelVal label='Building' value={get(obj, 'building', 'N/A')} />
              <LabelVal label='Floor' value={get(obj, 'floor', 'N/A')} />
              <LabelVal label='Room' value={get(obj, 'room', 'N/A')} />
              <LabelVal label='Section' value={get(obj, 'section', 'N/A')} />
              {get(header, 'components', []).map(s => {
                const key = `${header.type}.${s.key}`
                const value = get(submissionData, key, '')
                if (s.type === 'input') return <MinimalInput key={key} onChange={value => handleOnChange(key, value)} value={value} type={get(s, 'inputType', 'text')} label={s.label} placeholder={s.label} hasSuffix={!isEmpty(s.suffix)} suffix={s.suffix} baseStyles={{ margin: 0 }} />
                if (s.type === 'textarea') return <MinimalTextArea rows={3} onChange={e => handleOnChange(key, e.target.value)} key={key} value={value} label={s.label} placeholder={`Add ${s.label}`} baseStyles={{ marginRight: 0 }} />
                if (s.type === 'select') return <MinimalAutoComplete key={key} onChange={value => handleOnChange(key, value)} value={value} label={s.label} options={get(s, 'values', [])} placeholder={`Select ${s.label}`} isClearable baseStyles={{ marginRight: 0 }} />
                else return ''
              })}
            </Header>
          </div>
          {get(body, 'components', [])
            .filter(d => d.planType === get(submissionData, 'metaData.planType.value', '') || d.type === 'typeSelector')
            .map(container => {
              if (container.type === 'container') {
                if (container.isEnhanced && !get(submissionData, 'metaData.isEnhanced', false)) return ''
                return (
                  <div key={`container-${container.key}`} style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
                    {containerComponents.map(d => {
                      const key = `${container.key}.${d.key}`
                      const show = evaluateConditions(d.show, container.key)
                      const label = !isEmpty(d.dynamicLabel) ? get(container, d.dynamicLabel.split('.').slice(1).join('.'), '') : d.label
                      const test = !isEmpty(get(submissionData, key, '')) ? get(submissionData, key, '') : {}
                      if (d.type === 'selector' && show) return <MinimalButtonGroup key={key} value={get(test, 'value', '')} onChange={value => handleSelectorChange(key, value, get(d, 'values', []))} label={label} options={get(d, 'values', [])} w={100} baseStyles={{ marginRight: 0 }} />
                      if (d.type === 'textarea' && show) return <MinimalTextArea rows={3} key={key} value={get(submissionData, key, '')} onChange={e => handleOnChange(key, e.target.value)} label={label} placeholder={`Add ${d.label}`} baseStyles={{ marginRight: 0 }} />
                      if (d.key === 'beforePhoto' && show) return <Photos label={label} key={key} dataKey={key} photos={get(submissionData, key, [])} />
                      if (d.type === 'select' && show) return <MinimalAutoComplete key={key} value={get(submissionData, key, '')} onChange={value => handleOnChange(key, value)} label={label} options={get(d, 'values', [])} placeholder={`Select ${label}`} isClearable baseStyles={{ marginRight: 0 }} isRequired={d.key === 'issueType'} />
                      if (d.key === 'afterPhoto' && show) return <Photos label={label} key={key} dataKey={key} photos={get(submissionData, key, [])} />
                      if (d.type === 'input' && show) return <MinimalInput key={key} onChange={value => handleOnChange(key, value)} value={get(submissionData, key, '')} type={get(d, 'inputType', 'text')} label={label} placeholder={label} hasSuffix={!isEmpty(d.suffix)} suffix={d.suffix} baseStyles={{ margin: 0 }} />
                      return ''
                    })}
                  </div>
                )
              }
              if (container.type === 'typeSelector') {
                return (
                  <div key={`container-${container.key}`} style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
                    {get(container, 'components', []).map(d => {
                      const key = `${container.key}.${d.key}`
                      const test = !isEmpty(get(submissionData, key, '')) ? get(submissionData, key, '') : {}
                      if (d.type === 'selector') return <MinimalButtonGroup key={key} value={get(test, 'value', '')} onChange={value => handleTypeSelectorChange(key, value, get(d, 'values', []))} label={d.label} options={get(d, 'values', [])} w={100} baseStyles={{ marginRight: 0 }} disableCustomClass={'disable-button'} />
                      if (d.type === 'checkbox')
                        return (
                          <div key={key} className='d-flex align-items-center mt-2'>
                            <Checkbox color='primary' size='small' checked={get(submissionData, key, false)} style={{ padding: 0 }} onChange={e => handleEnhancedChange(key, e.target.checked)} disabled={isEnhancedDisabled} />
                            <div className='text-bold ml-2' style={{ opacity: isEnhancedDisabled ? 0.5 : 1 }}>
                              {d.label}
                            </div>
                          </div>
                        )
                      return ''
                    })}
                  </div>
                )
              }
              return ''
            })}
          {!isEmpty(torqueBody) && (
            <div key='torque-body-container' style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
              <div className='d-flex align-items-center justify-content-between'>
                <div className='minimal-input-label text-sm'>{get(torqueBody, 'title', '')}</div>
                <MinimalButton size='small' startIcon={<AddIcon />} text={get(torqueBody, 'btnTitle', '')} onClick={addNewTorqueLine} variant='contained' color='primary' />
              </div>
              {!isEmpty(torqueDetailList) &&
                torqueDetailList.map((d, index) => (
                  <div key={d.id} className='torque-section mt-3'>
                    <div className='d-flex justify-content-between p-2' style={{ borderBottom: '1px solid #dee2e6' }}>
                      <div className='d-flex align-items-center'>
                        <div style={{ fontWeight: 600 }}>Record No : </div>
                        <div style={{ wordWrap: 'break-word', marginLeft: '4px' }}>{index + 1}</div>
                      </div>
                      <div className='d-flex align-items-center'>
                        <Tooltip title='Copy' placement='top'>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              copyTorque(d.id)
                            }}
                          >
                            <FileCopyOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete' placement='top'>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              removeTorque(d)
                            }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                    <div className='d-flex mt-2 ml-2'>
                      <MinimalAutoComplete options={equipmentOptions} value={get(d, 'equipment', null)} onChange={value => handleTorqueDetailChange(d.id, value, 'equipment')} placeholder='Select Torque Equipment' label='Torque Equipment' w={60} />
                      <MinimalInput value={get(d, 'noOfItems', '')} onChange={value => handleTorqueDetailChange(d.id, value, 'noOfItems')} placeholder='Enter No. Of Items' label='No. Of Items' w={40} type='number' min={0} />
                    </div>
                    <div className='d-flex ml-2'>
                      <MinimalInput value={get(d, 'locationDescription', '')} onChange={value => handleTorqueDetailChange(d.id, value, 'locationDescription')} placeholder='Description/ Location' label='Description/ Location' w={100} />
                    </div>
                    <div className='d-flex ml-2'>
                      <MinimalInput value={get(d, 'vendorSpecs', '')} onChange={value => handleTorqueDetailChange(d.id, value, 'vendorSpecs')} placeholder='Vendor Specs' label='Vendor Specs' w={70} type='number' min={0} />
                      <MinimalAutoComplete options={get(torqueBody, 'measurementUnits', [])} value={get(d, 'vendorMeasureValue', null)} onChange={value => handleTorqueDetailChange(d.id, value, 'vendorMeasureValue')} placeholder='Select Unit' label='Unit' w={30} />
                    </div>
                    <div className='d-flex ml-2'>
                      <MinimalInput value={get(d, 'netaSpecs', '')} onChange={value => handleTorqueDetailChange(d.id, value, 'netaSpecs')} placeholder='NETA Specs' label='NETA Specs' w={70} type='number' min={0} />
                      <MinimalAutoComplete options={get(torqueBody, 'measurementUnits', [])} value={get(d, 'netaMeasureValue', null)} onChange={value => handleTorqueDetailChange(d.id, value, 'netaMeasureValue')} placeholder='Select Unit' label='Unit' w={30} />
                    </div>
                    <div className='d-flex ml-2'>
                      <MinimalInput value={get(d, 'torqueSpacs', '')} onChange={value => handleTorqueDetailChange(d.id, value, 'torqueSpacs')} placeholder='Torque Value' label='Torque Value' w={70} type='number' />
                      <MinimalAutoComplete options={get(torqueBody, 'measurementUnits', [])} value={get(d, 'torqueMeasureValue', null)} onChange={value => handleTorqueDetailChange(d.id, value, 'torqueMeasureValue')} placeholder='Select Unit' label='Unit' w={30} />
                    </div>
                    <div className='d-flex ml-2'>
                      <MinimalTextArea value={get(d, 'note', '')} onChange={e => handleTorqueDetailChange(d.id, e.target.value, 'note')} placeholder='Add Note...' label='Note' w={100} />
                    </div>
                  </div>
                ))}
            </div>
          )}
          {/* FOOTER */}
          <div key='footer-container' style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <MinimalAutoComplete value={get(submissionData, `footer.clearPmItem`, '')} onChange={value => handleOnChange(`footer.clearPmItem`, value)} label='Clear PM Item' options={get(pm, 'values', [])} placeholder='Select Clear PM Item' isRequired isClearable baseStyles={{ marginRight: 0 }} />
            <MinimalTextArea rows={3} value={get(submissionData, `footer.comments`, '')} onChange={e => handleOnChange(`footer.comments`, e.target.value)} label='Comments' placeholder='Add Comments' baseStyles={{ marginRight: 0 }} />
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
                    <MinimalAutoComplete w={40} value={get(additionalPhotos, `[${index}].type`, '')} onChange={value => handleAdditionalPhoto(index, 'type', value)} options={get(type, 'values', [])} placeholder={`Select Type`} isClearable baseStyles={{ marginBottom: 0 }} menuPlacement='top' />
                    <MinimalInput w={40} value={get(additionalPhotos, `[${index}].caption`, '')} onChange={value => handleAdditionalPhoto(index, 'caption', value)} placeholder='Add Caption' baseStyles={{ margin: 0, marginRight: isEmpty(get(additionalPhotos, `[${index}].photo`, '')) ? 0 : '10px' }} />
                    {isEmpty(get(additionalPhotos, `[${index}].photo`, '')) ? (
                      <FloatingButton w={12} onClick={() => handleUpload(`additionalPhotos.${index}.photo`)} icon={<AddAPhotoOutlinedIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
                    ) : (
                      <AssetImage readOnly url={get(additionalPhotos, `[${index}].photo`, '')} width='42px' baseMargin='0px' randomValue />
                    )}
                    <FloatingButton onClick={() => handleRemoveRow(d.id)} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
                  </div>
                ))}
                <div onClick={handleAddNew} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
                  Add New
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      </div>
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
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={reject}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
    </Drawer>
  )
}

export default EditForm
