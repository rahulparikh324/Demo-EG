import React, { useState, useEffect, useRef } from 'react'

import Drawer from '@material-ui/core/Drawer'

import { FormAccordian, FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete, MinimalDatePicker } from 'components/Assets/components'
import { MinimalButton } from 'components/common/buttons'
import { AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'
import { AttachmentContainer } from 'components/preventative-maintenance/common/components'
import { PopupModal } from 'components/common/others'

import { typeOptions, conditionTypes, conditionTableColumns, timePeriodOptions, validate } from 'components/preventative-maintenance/common/utils'
import preventativeMaintenance from 'Services/preventative-maintenance'

import { get, isEmpty, orderBy } from 'lodash'
import { Toast } from 'Snackbar/useToast'

const EditAssetPM = ({ open, onClose, obj, afterSubmit }) => {
  const [error, setError] = useState({})
  const [conditionError, setConditionError] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [pm, setPM] = useState({ title: '', description: '', pmTriggerType: null, estimationTime: null })
  const [conditions, setConditions] = useState([
    { frequency: '', period: null },
    { frequency: '', period: null },
    { frequency: '', period: null },
  ])
  const uploadRef = useRef(null)
  const [attachments, setAttachments] = useState([])
  const [date, setDate] = useState(null)
  const [isCompleteOpen, setCompleteOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [completeLoading, setCompleteLoading] = useState(false)
  // handle value change
  const handleInputChange = (name, value) => setPM({ ...pm, [name]: value })
  const handleConditionChange = (index, value, type) => {
    const cond = [...conditions]
    cond[index][type] = value
    setConditions(cond)
  }
  // attachments
  const addAttechment = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    uploadAttachment(file)
    e.target.value = null
  }
  const uploadAttachment = async file => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      setIsUploading(true)
      const res = await preventativeMaintenance.pm.uploadAttachment(formData)
      setIsUploading(false)
      if (res.success <= 0) return Toast.error(res.message)
      setAttachments([...attachments, { fileUrl: res.data.fileUrl, userUploadedName: res.data.userUploadedName, filename: res.data.filename }])
    } catch (error) {
      Toast.error(error)
    }
  }
  const deleteAttachment = attachment => setAttachments(attachments.filter(att => att.filename !== attachment))
  // validate & submit
  const validateForm = async () => {
    const payload = { ...pm, pmTriggerType: get(pm, 'pmTriggerType.label', '') }
    const isValid = await validate(payload)
    let conditionError = false
    for (let index = 0; index < 3; index++) {
      const value = conditions[index]
      if (isEmpty(value.frequency) || isEmpty(value.period)) {
        conditionError = true
        break
      }
    }
    setConditionError(conditionError)
    setError(isValid)
    if (isValid === true && !conditionError) submit()
  }
  const submit = async () => {
    const payload = {
      ...obj,
      ...pm,
      pmTriggerType: get(pm, 'pmTriggerType.value', ''),
      assetPmTriggerConditionMappingRequestModel: conditions.map((d, index) => ({
        datetimeRepeatesEvery: parseInt(d.frequency),
        datetimeRepeatTimePeriodType: get(d, 'period.value', ''),
        conditionTypeId: index + 1,
        assetPmTriggerConditionMappingId: d.assetPmTriggerConditionMappingId,
      })),
      assetPmAttachments: attachments,
      datetimeStartingAt: !isEmpty(date) ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null,
    }
    setIsProcessing(true)
    try {
      const res = await preventativeMaintenance.asset.update(payload)
      if (res.success > 0) Toast.success(`PM Updated Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error updating Plan. Please try again !`)
    }
    setIsProcessing(false)
    afterSubmit()
    onClose()
  }
  // complete
  const onComplete = async () => {
    setComment('')
    setCompleteOpen(true)
  }
  const completePM = async () => {
    setCompleteLoading(true)
    try {
      const res = await preventativeMaintenance.asset.markComplete({ assetPmId: obj.assetPmId, completedNotes: comment })
      if (res.success > 0) Toast.success(`PM Completed Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error completing PM. Please try again !`)
    }
    setCompleteLoading(false)
    setCompleteOpen(false)
    onClose()
    afterSubmit()
  }
  // edit
  useEffect(() => {
    setPM({ title: obj.title, description: obj.description, estimationTime: obj.estimationTime, pmTriggerType: typeOptions.find(d => d.value === obj.pmTriggerType) })
    const conditions = orderBy(get(obj, 'assetPmTriggerConditionMapping', []), z => z.conditionTypeId)
    conditions.forEach(d => {
      d.frequency = `${d.datetimeRepeatesEvery}`
      d.period = timePeriodOptions.find(x => x.value === d.datetimeRepeatTimePeriodType)
    })
    setConditions(conditions)
    setAttachments(obj.assetPmAttachments)
    if (obj.datetimeStartingAt) {
      const _date = new Date(obj.datetimeStartingAt)
      setDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
    }
  }, [obj])
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Edit PM' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalInput value={get(pm, 'title', '') || ''} onChange={value => handleInputChange('title', value)} error={error.title} label='PM Title' placeholder='Add title' onFocus={() => setError({ ...error, title: null })} baseStyles={{ marginRight: 0 }} isRequired />
            <MinimalTextArea rows={3} value={get(pm, 'description', '') || ''} onChange={e => handleInputChange('description', e.target.value)} placeholder='Add description ..' label='PM Description' w={100} baseStyles={{ marginBottom: 0 }} />
            <MinimalInput
              min={0}
              type='number'
              value={get(pm, 'estimationTime', null) || null}
              onChange={value => handleInputChange('estimationTime', isEmpty(value) ? null : parseInt(value))}
              error={error.estimationTime}
              label='Estimated Time (In Minutes)'
              placeholder='Estimated Time'
              onFocus={() => setError({ ...error, estimationTime: null })}
              baseStyles={{ marginRight: 0, marginTop: 10 }}
            />
          </div>
        </div>
        <div style={{ padding: '0 10px' }}>
          <FormAccordian title='Schedule Triggers' style={{ borderRadius: '4px', background: '#fff' }} bg keepOpen>
            <div className='p-3 mb-2'>
              <div className='d-flex'>
                <MinimalDatePicker date={date} setDate={setDate} label='Starting / Last Completed At' w={100} />
                <MinimalAutoComplete value={get(pm, 'pmTriggerType', '')} onChange={value => handleInputChange('pmTriggerType', value)} placeholder='Select type' options={typeOptions} label='Type' isClearable w={100} error={error.pmTriggerType} onFocus={() => setError({ ...error, pmTriggerType: null })} />
              </div>
              <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%', marginTop: '15px' }}>
                <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                  {conditionTableColumns.map(({ label, width }) => (
                    <div key={label} className='text-bold' style={{ width }}>
                      {label}
                    </div>
                  ))}
                </div>
                {conditionTypes.map(({ label, value }) => (
                  <div key={label} className='d-flex align-items-center p-2 '>
                    <div className='d-flex justify-content-center align-items-center text-bold mr-2' style={{ width: '40px', height: '40px', borderRadius: '4px', color: obj.activeConditionTypeId === value ? '#fff' : '#000', background: obj.activeConditionTypeId === value ? '#37D482' : '#e0e0e0', textAlign: 'center' }}>
                      {label}
                    </div>
                    <MinimalInput min={1} type='number' w={45} value={get(conditions[value - 1], 'frequency', '')} onChange={v => handleConditionChange(value - 1, v, 'frequency')} baseStyles={{ marginBottom: 0 }} />
                    <MinimalAutoComplete w={40} options={timePeriodOptions} value={get(conditions[value - 1], 'period', '')} onChange={v => handleConditionChange(value - 1, v, 'period')} baseStyles={{ margin: 0 }} />
                  </div>
                ))}
                {conditionError && (
                  <div className='text-bold text-xs' style={{ color: 'red', margin: '10px 16px' }}>
                    All Conditions are required !
                  </div>
                )}
              </div>
            </div>
          </FormAccordian>
        </div>
        <div style={{ padding: '0 10px' }}>
          <FormAccordian title='Attachments' style={{ borderRadius: '4px', marginTop: '8px', background: '#fff' }} bg>
            <div className='p-3 mb-2'>
              <div className='d-flex align-items-center mb-3'>
                <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addAttechment} />
                <AssetImageUploadButton loading={isUploading} disabled={isUploading} onClick={() => uploadRef.current && uploadRef.current.click()} style={{ width: '40px', height: '40px' }} iconsize='18' isOld /> <div className='mb-0 text-accent'>Add a new file</div>
              </div>
              {attachments.map(d => (
                <AttachmentContainer onDelete={() => deleteAttachment(d.filename)} key={d.filename} url={d.fileUrl} filename={d.userUploadedName} />
              ))}
            </div>
          </FormAccordian>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <div className='d-flex'>
          <MinimalButton variant='contained' color='primary' text='Mark Completed' onClick={onComplete} baseClassName='mr-2' />
          <MinimalButton variant='contained' color='primary' text='Save' loadingText='Saving...' loading={isProcessing} disabled={isProcessing} onClick={validateForm} />
        </div>
      </div>
      {isCompleteOpen && (
        <PopupModal cta='Complete' loadingText='Completing' open={isCompleteOpen} onClose={() => setCompleteOpen(false)} title='Mark Completed' loading={completeLoading} handleSubmit={completePM}>
          <MinimalTextArea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder='Please enter note here..' w={100} />
        </PopupModal>
      )}
    </Drawer>
  )
}
export default EditAssetPM
