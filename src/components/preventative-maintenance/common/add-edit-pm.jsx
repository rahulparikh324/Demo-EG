import React, { useState, useEffect, useRef } from 'react'

import Drawer from '@material-ui/core/Drawer'

import { FormAccordian, FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from 'components/Assets/components'
import { MinimalButton } from 'components/common/buttons'
import { AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'
import { AttachmentContainer } from 'components/preventative-maintenance/common/components'

import { typeOptions, conditionTypes, conditionTableColumns, timePeriodOptions, validate } from 'components/preventative-maintenance/common/utils'
import preventativeMaintenance from 'Services/preventative-maintenance'

import { get, isEmpty, orderBy } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const AddEditPM = ({ open, onClose, obj, afterSubmit, isEdit, pmPlanId }) => {
  const title = isEdit ? 'Edit PM' : 'Add PM'
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
      ...pm,
      pmId: isEdit ? obj.pmId : null,
      pmPlanId,
      status: 1,
      pmTriggerBy: 26,
      isTriggerOnStartingAt: true,
      isArchive: false,
      pmTriggerType: get(pm, 'pmTriggerType.value', ''),
      pmTriggerConditionMappingRequestModel: conditions.map((d, index) => ({
        datetimeRepeatesEvery: parseInt(d.frequency),
        datetimeRepeatTimePeriodType: get(d, 'period.value', ''),
        conditionTypeId: index + 1,
        pmTriggerConditionMappingId: isEdit ? d.pmTriggerConditionMappingId : null,
        pmId: isEdit ? obj.pmId : null,
        isArchive: false,
        siteId: getApplicationStorageItem('siteId'),
      })),
      pmAttachments: attachments,
    }
    setIsProcessing(true)
    try {
      const res = await preventativeMaintenance.pm.addUpdate(payload)
      if (res.success > 0) Toast.success(`PM ${isEdit ? 'Updated' : 'Added'} Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error ${isEdit ? 'updating' : 'adding'} Plan. Please try again !`)
    }
    setIsProcessing(false)
    afterSubmit()
    onClose()
  }
  // edit
  useEffect(() => {
    if (isEdit) {
      setPM({ title: obj.title, description: obj.description, estimationTime: obj.estimationTime, pmTriggerType: typeOptions.find(d => d.value === obj.pmTriggerType) })
      const conditions = orderBy(obj.pmTriggerConditionMappingResponseModel, z => z.conditionTypeId)
      conditions.forEach(d => {
        d.frequency = `${d.datetimeRepeatesEvery}`
        d.period = timePeriodOptions.find(x => x.value === d.datetimeRepeatTimePeriodType)
      })
      setConditions(conditions)
      setAttachments(obj.pmAttachments)
    }
  }, [obj, isEdit])
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={title} closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
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
              <MinimalAutoComplete value={get(pm, 'pmTriggerType', '')} onChange={value => handleInputChange('pmTriggerType', value)} placeholder='Select type' options={typeOptions} label='Type' isClearable w={100} error={error.pmTriggerType} onFocus={() => setError({ ...error, pmTriggerType: null })} />
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
                    <div className='d-flex justify-content-center align-items-center text-bold mr-2' style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#e0e0e0', textAlign: 'center' }}>
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
        <MinimalButton variant='contained' color='primary' text={isEdit ? 'Save' : 'Add'} loadingText={isEdit ? 'Saving...' : 'Adding...'} loading={isProcessing} disabled={isProcessing} onClick={validateForm} />
      </div>
    </Drawer>
  )
}
export default AddEditPM
