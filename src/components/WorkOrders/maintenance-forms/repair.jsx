import React, { useState, useRef, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { get, isEmpty, orderBy, differenceBy } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { components } from 'react-select'

import Drawer from '@material-ui/core/Drawer'
import AddIcon from '@material-ui/icons/Add'
import { useTheme } from '@material-ui/core/styles'
import LinkOutlinedIcon from '@material-ui/icons/LinkOutlined'
import LinkOffOutlinedIcon from '@material-ui/icons/LinkOffOutlined'

import { FormTitle, FormAccordian } from 'components/Maintainance/components'
import { MinimalTextArea, MinimalAutoComplete, MinimalDatePicker, MinimalInput } from 'components/Assets/components'
import { validate, repairResolutionOptions, inspectionStatusOptions, formatOptions, replacementResolutionOptions, recommendedActionOptions, actionScheduleOptions, issueResolutionOptions, LinkedIssueTableHeader } from './utils'
import { typeOptions } from 'components/Issues/utlis'
import ImagePreview from 'components/common/image-preview'
import { PopupModal, MiniTableEmptyState } from 'components/common/others'
import Install from 'components/WorkOrders/maintenance-forms/install'

import { AssetImage, AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'
import { MinimalButton, FloatingButton, ActionButton } from 'components/common/buttons'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import CreateFedBy from 'components/WorkOrders/onboarding/create-fed-by'
import assetClass from 'Services/WorkOrder/asset-class'
// import deleteBucketObject from 'Services/WorkOrder/delete-bucket-obj'
// import uploadQrCodeImage from 'Services/WorkOrder/upload-qr'
import getAllAssetForTree from 'Services/Asset/getAllAssetTree'
import LinkedIssues from 'components/WorkOrders/maintenance-forms/linked-issues'
import issues from 'Services/issues'

import enums from 'Constants/enums'

const Repair = ({ open, onClose, isEdit, obj, afterSubmit, workOrderID, isReplace, isRepair, isTroblecall, isInReview, lineObj = {} }) => {
  const sortClassCodes = d => {
    const list = get(d, 'data', {})
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    const classCodeForAsset = isInReview ? get(obj, 'form_data.data.assetClassCode', '') : obj.asset_class_code
    if (isEdit) setClassCode(sortedList.find(d => d.label === classCodeForAsset))
    return sortedList
  }
  const formatAssetOptions = d => {
    const mainList = get(d, 'data.mainAssets', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
    const tempList = get(d, 'data.tempAssets', []).map(d => ({ label: d.assetName, assetName: d.assetName, value: d.woonboardingassetsId, isTemp: true }))
    return [...tempList, ...mainList]
  }
  const { loading, data: assetOptions, reFetch: reFetchAssetOptions } = useFetchData({ fetch: issues.getAssetList, payload: { woId: workOrderID }, formatter: d => formatAssetOptions(camelizeKeys(d)), defaultValue: [] })
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  //form data
  const [asset, setAsset] = useState(null)
  const [assetIfNew, setAssetIfNew] = useState('')
  const [replacedByAsset, setReplacedByAsset] = useState(null)
  const [inspectionStatus, setInspectionStatus] = useState(null)
  const [repairResolution, setRepairResolution] = useState(null)
  const [replacementResolution, setReplacementResolution] = useState(null)
  const [issueResolution, setIssueResolution] = useState(null)
  const [recommendedAction, setRecommendedAction] = useState(null)
  const [recommendedActionSchedule, setRecommendedActionSchedule] = useState(null)
  const [date, setDate] = useState(null)
  const [problemDesc, setProblemDesc] = useState('')
  const [solutionDesc, setSolutionDesc] = useState('')
  const [otherDesc, setOtherDesc] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [photoErrorType, setPhotoErrorType] = useState('')
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [comments, setComments] = useState('')
  const [isSaving, setIsSaving] = useState('')
  const [error, setError] = useState({})
  const uploadRef = useRef(null)
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [assetClassCode, setClassCode] = useState(null)
  //form labels
  const title = isReplace ? 'Replace' : isTroblecall ? 'General Issue Resolution' : 'Repair'
  const [beforeAfterPhoto, setBeforeAfterPhoto] = useState(false)
  const [isbeforePhoto, setIsBeforePhoto] = useState(true)
  const [isCreateNewAssetOpen, setIsCreateNewAssetOpen] = useState(false)
  const showSolution = (isRepair || isReplace) && (get(repairResolution, 'value', '') || get(replacementResolution, 'value', '')) !== 2
  const showFurtherDetails = (isRepair || isReplace) && (get(repairResolution, 'value', '') || get(replacementResolution, 'value', '')) === 2
  //tabs
  const tabs = { NEW: 'NEW', EXISTING: 'EXISTING' }
  const [selectedTab, setTab] = useState(tabs.EXISTING)
  const theme = useTheme()
  //fedby
  const [selectedFedBy, setSelectedFedBy] = useState([])
  const [fedByOptions, setFedByOptions] = useState([])
  const [fedByLoading, setFedByLoading] = useState(false)
  const [isCreateFedByOpen, setCreateFedByOpen] = useState(false)
  //reject
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  //issues
  const [linkissuesToOpen, setLinkissuesToOpen] = useState(false)
  const [selectedLinkedIssues, setSelectedLinkedIssues] = useState([])
  const [deletedLinkIssues, setDeletedLinkedIssues] = useState([])
  const [imageOrder, setImageOrder] = useState(0)
  //new asset
  const [installingNew, setInstallingNew] = useState(false)
  const [installedAsset, setInstalledAsset] = useState({})
  const [rendomValue, setRandomValue] = useState()
  //
  const validateForm = async status => {
    const isValid = await validate(
      {
        assetName: selectedTab === tabs.EXISTING ? get(asset, 'label', '') : assetIfNew,
        assetClassCode: get(assetClassCode, 'value', ''),
        replacedAssetId: get(replacedByAsset, 'value', null),
        problemDesc,
      },
      selectedTab === tabs.EXISTING,
      isReplace
      // isRepair
    )
    setError(isValid)
    if (isValid === true) submitData(status)
  }
  const submitData = async status => {
    const payload = {
      ...asset,
      status,
      commisiionDate: date !== null ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null,
      woId: workOrderID,
      mwoInspectionTypeStatus: get(inspectionStatus, 'value', null),
      problemDescription: problemDesc,
      solutionDescription: solutionDesc,
      inspectionType: isRepair ? enums.MWO_INSPECTION_TYPES.REPAIR : isTroblecall ? enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK : enums.MWO_INSPECTION_TYPES.REPLACE,
      assetImageList: uploadedImages.filter(d => !(d.isDeleted && !d.woonboardingassetsimagesmappingId)),
      inspectionFurtherDetails: otherDesc,
      comments,
      repairResolution: get(repairResolution, 'value', null),
      replacementResolution: get(replacementResolution, 'value', null),
      recommendedAction: get(recommendedAction, 'value', null),
      generalIssueResolution: get(issueResolution, 'value', null),
      recommendedActionSchedule: get(recommendedActionSchedule, 'value', null),
      isWoLineForExisitingAsset: selectedTab === tabs.EXISTING,
      replacedAssetId: get(replacedByAsset, 'value', null),
      assetIssueId: asset.isTemp ? [] : selectedLinkedIssues.map(d => d.assetIssueId || d.woLineIssueId),
      deletedAssetIssueId: asset.isTemp ? [] : deletedLinkIssues,
      wolineIssueId: asset.isTemp ? selectedLinkedIssues.map(d => d.assetIssueId || d.woLineIssueId) : [],
      deletedWolineIssueId: asset.isTemp ? deletedLinkIssues : [],
    }
    if (selectedTab === tabs.NEW) {
      payload.assetName = assetIfNew
      payload.assetClassCode = get(assetClassCode, 'label', '')
      const fedByMapping = []
      const viewObj = camelizeKeys(obj)
      const old = get(viewObj, 'formData.data.woObAssetFedByMapping', [])
      if (!isEmpty(selectedFedBy) || !isEmpty(old)) {
        selectedFedBy.forEach(d => {
          const obj = old.find(x => x.parentAssetId === d.value)
          fedByMapping.push({
            woObAssetFedById: get(obj, 'woObAssetFedById', null),
            parentAssetId: d.value,
            isParentFromObWo: !!d.isOB,
            woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
            isDeleted: false,
          })
        })
        const deleted = differenceBy(old, fedByMapping, 'parentAssetId')
        deleted.forEach(d => fedByMapping.push({ ...d, isDeleted: true }))
        payload.woObAssetFedByMapping = fedByMapping
      }
    }
    if (isEdit) payload.woonboardingassetsId = get(obj, 'form_data.data.woonboardingassetsId', null)
    if (asset.isTemp) payload.issuesTempAssetId = asset.value
    setIsSaving(status)
    try {
      const res = await onBoardingWorkorder.updateAssetDetails(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Updated Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error uploading Asset. Please try again !`)
    }
    setIsSaving('')
    onClose()
    afterSubmit(lineObj)
  }
  const handleUpload = type => {
    setPhotoError('')
    setPhotoErrorType(type)
    uploadRef.current && uploadRef.current.click()
  }
  const removeImage = image => {
    const images = [...uploadedImages]
    const imageToDelete = images.find(img => img.assetPhoto === image.assetPhoto)
    imageToDelete.isDeleted = true
    setUploadedImages(images)
  }
  const addPhoto = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) setPhotoError('Invalid Image format !')
      else {
        setPhotoError('')
        uploadPhoto(file, photoErrorType)
      }
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }
  const uploadPhoto = async (file, assetPhotoType) => {
    const formData = new FormData()
    formData.append('file', file)
    setPhotoUploading(true)
    try {
      const res = await onBoardingWorkorder.uploadPhoto(formData)
      if (res.success) {
        setUploadedImages([
          ...uploadedImages,
          {
            url: res.data.fileUrl,
            assetPhoto: res.data.filename,
            assetPhotoType,
            imageDurationTypeId: assetPhotoType,
            woonboardingassetsimagesmappingId: null,
            isDeleted: false,
            thumbnailFileUrl: res.data.thumbnailFileUrl,
            assetThumbnailPhoto: res.data.thumbnailFilename,
            //woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
          },
        ])
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setPhotoUploading(false)
  }
  const handleProblemBlur = () => {
    if (!isRepair || isEmpty(problemDesc)) return
    setBeforeAfterPhoto(true)
    setIsBeforePhoto(true)
  }
  const handleSolutionBlur = () => {
    if (!isRepair || isEmpty(solutionDesc)) return
    setBeforeAfterPhoto(true)
    setIsBeforePhoto(false)
  }
  const uploadBeforeAfterPhoto = () => {
    handleUpload(1)
    setBeforeAfterPhoto(false)
  }
  const createFedBy = async id => {
    try {
      setFedByLoading(true)
      const viewObj = camelizeKeys(obj)
      const assetNameOpts = await onBoardingWorkorder.fedBy.getList(snakifyKeys({ woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null), woId: workOrderID }))
      const mainList = get(assetNameOpts, 'data.mainAssetList', []) || []
      const obList = get(assetNameOpts, 'data.obWoAssetList', []) || []
      const mainOpts = mainList.map(asset => ({ ...asset, label: asset.name, value: asset.assetId }))
      const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
      const options = [...mainOpts, ...obOpts]
      setFedByOptions(options)
      const fed = options.find(d => d.value === id)
      setSelectedFedBy(p => [...p, fed])
    } catch (error) {
      setFedByOptions([])
    }
    setFedByLoading(false)
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const rejectAsset = async () => {
    const payload = { taskRejectedNotes: reason, status: enums.woTaskStatus.Reject, woonboardingassetsId: get(obj, 'form_data.data.woonboardingassetsId', null) }
    setRejectLoading(true)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Rejected Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting asset. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    afterSubmit(lineObj)
    onClose()
    setReason('')
  }
  //
  useEffect(() => {
    if (isEdit) {
      const editObj = camelizeKeys(obj)
      const assetId = editObj.assetId || get(editObj, 'formData.data.assetId', '') || get(editObj, 'formData.data.issuesTempAssetId', '')
      const asset = assetOptions.find(d => d.value === assetId)
      const formData = get(editObj, 'formData.data', {})
      setAsset(asset)
      if (get(formData, 'commisiionDate', null)) {
        const dueD = new Date(get(formData, 'commisiionDate', null))
        setDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
      }
      const _status = inspectionStatusOptions.find(d => d.value === formData.mwoInspectionTypeStatus)
      setInspectionStatus(_status)
      const _resolution = repairResolutionOptions.find(d => d.value === formData.repairResolution)
      setRepairResolution(_resolution)
      const _replaceResolution = replacementResolutionOptions.find(d => d.value === formData.replacementResolution)
      setReplacementResolution(_replaceResolution)
      const reccAcc = recommendedActionOptions.find(d => d.value === formData.recommendedAction)
      setRecommendedAction(reccAcc)
      const issueRes = issueResolutionOptions.find(d => d.value === formData.generalIssueResolution)
      setIssueResolution(issueRes)
      const reccAccSch = actionScheduleOptions.find(d => d.value === formData.recommendedActionSchedule)
      setRecommendedActionSchedule(reccAccSch)
      setProblemDesc(get(formData, 'problemDescription', '') || '')
      setSolutionDesc(get(formData, 'solutionDescription', '') || '')
      setOtherDesc(get(formData, 'inspectionFurtherDetails', '') || '')
      const linkedMainIssues = get(formData, 'linkedIssues.mainIssueList', []) || []
      const linkedTempIssues = get(formData, 'linkedIssues.tempIssueList', []) || []
      setSelectedLinkedIssues([...linkedMainIssues, ...linkedTempIssues])
      setComments(get(formData, 'comments', ''))
      if (!formData.isWoLineForExisitingAsset) setTab(tabs.NEW)
      const images = get(formData, 'assetImageList', [])
      images.forEach(im => {
        im.url = im.assetPhoto
        im.assetPhoto = im.assetPhoto.split('/')[5]
        im.assetPhotoType = isTroblecall ? im.assetPhotoType : im.imageDurationTypeId
        im.imageDurationTypeId = isTroblecall ? im.assetPhotoType : im.imageDurationTypeId
      })
      setUploadedImages(images)
      if (isReplace) {
        const asset = assetOptions.find(d => d.value === formData.replacedAssetId)
        setReplacedByAsset(asset)
      }
    } else {
      const asset = assetOptions.find(d => d.value === installedAsset.woonboardingassetsId)
      setAsset(asset)
    }
  }, [obj, isEdit, assetOptions])
  //
  useEffect(() => {
    ;(async () => {
      try {
        setFedByLoading(true)
        const viewObj = camelizeKeys(obj)
        const assetNameOpts = await onBoardingWorkorder.fedBy.getList(snakifyKeys({ woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null), woId: workOrderID }))
        const mainList = get(assetNameOpts, 'data.mainAssetList', []) || []
        const obList = get(assetNameOpts, 'data.obWoAssetList', []) || []
        const mainOpts = mainList.map(asset => ({ ...asset, label: asset.name, value: asset.assetId }))
        const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
        const options = [...mainOpts, ...obOpts]
        setFedByOptions(options)
        if (isEdit) {
          const formData = get(viewObj, 'formData.data', {})
          const fedIDs = get(formData, 'woObAssetFedByMapping', []).map(d => d.parentAssetId)
          const fed = options.filter(d => fedIDs.includes(d.value))
          setSelectedFedBy(fed)
          setAssetIfNew(get(formData, 'assetName', ''))
        }
      } catch (error) {
        setFedByOptions([])
      }
      setFedByLoading(false)
    })()
  }, [])

  const handleRemoveIssuesRow = id => {
    let list = [...selectedLinkedIssues].map(d => ({ ...d, _id: d.assetIssueId || d.woLineIssueId }))
    list = list.filter(component => component._id !== id)
    setSelectedLinkedIssues(list)
    setDeletedLinkedIssues([...deletedLinkIssues, id])
  }

  const handleGetIssueType = val => {
    const type = typeOptions.find(q => q.value === val)
    return type.label
  }

  const handleAssetChange = val => {
    setAsset(val)
    // const deleteList = selectedLinkedIssues.map(d => d.assetIssueId || d.woLineIssueId)
    // setDeletedLinkedIssues([...deletedLinkIssues, ...deleteList])
    // setSelectedLinkedIssues([])
  }
  //
  const afterInstall = d => {
    setInstalledAsset(d)
    reFetchAssetOptions()
  }
  return (
    <>
      <Drawer anchor='right' open={open} onClose={onClose}>
        <FormTitle title={title} closeFunc={onClose} style={{ width: '100%', minWidth: '475px' }} />
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
          <div style={{ padding: '10px', width: '475px' }}>
            <div className='mt-2' style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <div className='d-flex'>
                <MinimalAutoComplete isLoading={loading} value={asset} onChange={v => handleAssetChange(v)} options={assetOptions} label='Asset Name' placeholder='Select Asset' w={97} error={error.assetName} isClearable onFocus={() => setError({ ...error, assetName: null })} isRequired />
                <FloatingButton onClick={() => setInstallingNew(true)} icon={<AddIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px', borderRadius: '8px' }} />
              </div>
              {(!isEmpty(asset) || isEdit) && (
                <>
                  <div className='text-bold text-sm'>Linked Issue(s)</div>
                  <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                    <LinkedIssueTableHeader />
                    {isEmpty(selectedLinkedIssues) ? (
                      <MiniTableEmptyState text='No Issues linked !' />
                    ) : (
                      <>
                        {selectedLinkedIssues.map(({ issueTitle, issueType, assetIssueId, woLineIssueId }, index) => (
                          <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                            <div style={{ width: '40%' }}>{issueTitle}</div>
                            <div style={{ width: '50%' }}>{handleGetIssueType(issueType)}</div>
                            <ActionButton action={() => handleRemoveIssuesRow(assetIssueId || woLineIssueId)} icon={<LinkOffOutlinedIcon fontSize='small' />} tooltip='UNLINK' />
                          </div>
                        ))}
                      </>
                    )}
                    <div onClick={() => setLinkissuesToOpen(true)} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
                      Link Issue
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className='mt-2' style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              {isReplace && <MinimalAutoComplete loading={loading} value={replacedByAsset} onChange={v => setReplacedByAsset(v)} options={assetOptions} label='To be Replaced' placeholder='Select Asset' w={100} error={error.replacedAssetId} isClearable onFocus={() => setError({ ...error, replacedAssetId: null })} isRequired />}
              <MinimalTextArea rows={3} value={problemDesc} onChange={e => setProblemDesc(e.target.value)} placeholder='Describe here ...' label='Please describe the Problem' w={100} error={error.problemDesc} onFocus={() => setError({ ...error, problemDesc: null })} isRequired />
              {/* <div className='d-flex'>
              <MinimalDatePicker date={date} setDate={setDate} label='Date' w={!isTroblecall ? 50 : 100} />
              {!isTroblecall && <MinimalAutoComplete value={inspectionStatus} onChange={v => setInspectionStatus(v)} options={inspectionStatusOptions} label='Status' placeholder='Select Status' w={50} />}
            </div> */}
              {isTroblecall && <MinimalAutoComplete value={issueResolution} onChange={v => setIssueResolution(v)} options={issueResolutionOptions} label='Resolution' placeholder='Select Resolution' w={100} />}
            </div>

            <FormAccordian title={!isTroblecall ? 'Before Photos' : 'Photos'} style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg>
              {!isEmpty(photoError) && photoErrorType === 0 && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{photoError}</span>}
              <div className='p-3 mb-2'>
                <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                  <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
                  <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 1} disabled={isPhotoUploading} onClick={() => handleUpload(1)} />
                  {uploadedImages.filter(d => d.assetPhotoType === 1).map(d => d.assetPhotoType === 1 && !d.isDeleted && <AssetImage onClick={() => setPreview([true, 1])} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.url}?value=${rendomValue}`} randomValue />)}
                </div>
              </div>
            </FormAccordian>

            {!isTroblecall && (
              <div className='mt-2' style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
                {isRepair && <MinimalAutoComplete value={repairResolution} onChange={v => setRepairResolution(v)} options={repairResolutionOptions} label='Repair Resolution' placeholder='Select Resolution' w={100} error={error.repairResolution} onFocus={() => setError({ ...error, repairResolution: null })} />}
                {isReplace && <MinimalAutoComplete value={replacementResolution} onChange={v => setReplacementResolution(v)} options={replacementResolutionOptions} label='Replacement Resolution' placeholder='Select Resolution' w={100} />}
                {showSolution && <MinimalTextArea rows={3} value={solutionDesc} onChange={e => setSolutionDesc(e.target.value)} placeholder='Describe here ...' label='Please describe the Solution' w={100} />}
                {showFurtherDetails && <MinimalTextArea rows={3} value={otherDesc} onChange={e => setOtherDesc(e.target.value)} placeholder='Details ...' label='Please provide further details' w={100} />}
                {/* <MinimalTextArea rows={3} value={comments} onChange={e => setComments(e.target.value)} placeholder='Add comment ...' label='Comments' w={100} /> */}
              </div>
            )}
            {!isTroblecall && (
              <FormAccordian title={!isTroblecall ? 'After Photos' : 'Photos'} style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg>
                {!isEmpty(photoError) && photoErrorType === 0 && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{photoError}</span>}
                <div className='p-3 mb-2'>
                  <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                    <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
                    <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 2} disabled={isPhotoUploading} onClick={() => handleUpload(2)} />
                    {uploadedImages.filter(d => d.assetPhotoType === 2).map(d => d.assetPhotoType === 2 && !d.isDeleted && <AssetImage onClick={() => setPreview([true, 2])} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.url}?value=${rendomValue}`} randomValue />)}
                  </div>
                </div>
              </FormAccordian>
            )}
          </div>
        </div>
        <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
          {isInReview ? (
            <MinimalButton variant='contained' color='primary' text='Save & Accept' loadingText='Saving...' onClick={() => validateForm(enums.woTaskStatus.Complete)} loading={isSaving === enums.woTaskStatus.Complete} disabled={isSaving === enums.woTaskStatus.Complete} style={{ background: '#37d482' }} />
          ) : (
            <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          )}
          {isInReview ? (
            <div>
              <MinimalButton variant='contained' color='primary' text='Hold' loadingText='Holding...' onClick={() => validateForm(enums.woTaskStatus.Hold)} loading={isSaving === enums.woTaskStatus.Hold} disabled={isSaving === enums.woTaskStatus.Hold} baseClassName='mr-2 yellow_button' />
              <MinimalButton variant='contained' color='primary' text='Reject' onClick={() => setIsRejectOpen(true)} baseClassName='red_button' />
            </div>
          ) : isEdit ? (
            <div>
              <MinimalButton variant='contained' color='primary' text='Save' loadingText='Saving...' onClick={() => validateForm(enums.woTaskStatus.InProgress)} loading={isSaving === enums.woTaskStatus.InProgress} disabled={isSaving === enums.woTaskStatus.InProgress} baseClassName='mr-2' />
              <MinimalButton variant='contained' color='primary' text='Submit' loadingText='Submitting...' onClick={() => validateForm(enums.woTaskStatus.ReadyForReview)} loading={isSaving === enums.woTaskStatus.ReadyForReview} disabled={isSaving === enums.woTaskStatus.ReadyForReview} style={{ background: '#37d482' }} />
            </div>
          ) : (
            <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' onClick={() => validateForm(enums.woTaskStatus.Open)} loading={isSaving === enums.woTaskStatus.Open} disabled={isSaving === enums.woTaskStatus.Open} />
          )}
        </div>
        {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={uploadedImages.filter(d => d.assetPhotoType === isPreviewOpen[1] && !d.isDeleted)} urlKey='url' reFetch={() => setRandomValue(Math.random())} />}
        {beforeAfterPhoto && (
          <PopupModal open={beforeAfterPhoto} onClose={() => setBeforeAfterPhoto(false)} cta='Upload' title='Upload Photo' handleSubmit={uploadBeforeAfterPhoto}>
            Please upload {isbeforePhoto ? 'Before ' : 'After '} Photo !
          </PopupModal>
        )}
        {isCreateFedByOpen && <CreateFedBy obj={camelizeKeys(obj)} open={isCreateFedByOpen} onClose={() => setCreateFedByOpen(false)} afterSubmit={createFedBy} classCodeOptions={classCodeOptions} woId={workOrderID} />}
        {isRejectOpen && (
          <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
            <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
          </PopupModal>
        )}
        {linkissuesToOpen && <LinkedIssues open={linkissuesToOpen} onClose={() => setLinkissuesToOpen(false)} obj={asset} setSelectedLinkedIssues={setSelectedLinkedIssues} woId={workOrderID} />}
        {installingNew && <Install classCodeOptions={classCodeOptions} isOnboarding isNew isInstalling viewObj={{}} open={installingNew} onClose={() => setInstallingNew(false)} afterSubmit={afterInstall} workOrderID={workOrderID} />}
      </Drawer>
    </>
  )
}
export default Repair
