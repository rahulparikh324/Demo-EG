import React, { useState, useEffect, memo, useRef } from 'react'

import { Form } from 'react-formio'
import CircularProgress from '@material-ui/core/CircularProgress'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import { MinimalButton } from 'components/common/buttons'
import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'
import RejectCategoryTask from 'components/WorkOrders/RejectCategoryTask'

import addUpdateAssetForm from 'Services/FormIO/addUpdateAssetForm'
import updateWOCategoryTaskStatus from 'Services/WorkOrder/updateWOCategoryTaskStatus'
import { cloneDeep } from 'lodash'

const Loader = () => (
  <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
    <CircularProgress size={20} thickness={5} />
  </div>
)
const EmptyState = () => (
  <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
    <strong>No Data Found</strong>
  </div>
)

const renderReadOnlyModeControls = ({ setModeAsEdit, currentForm, submitForm, loadingStatus, reject, woStatusId, isForReview = false }) => {
  const isDisabled = currentForm.status !== enums.woTaskStatus.ReadyForReview || woStatusId === enums.woTaskStatus.Complete
  const isEditDisabled = [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(currentForm.status) || woStatusId === enums.woTaskStatus.Complete
  return (
    <div className='d-flex justify-content-between align-items-center'>
      <div>
        <MinimalButton
          onClick={() => submitForm(enums.woTaskStatus.Complete)}
          loading={loadingStatus === enums.woTaskStatus.Complete}
          text={isForReview ? 'Save & Accept' : 'Accept'}
          loadingText='Accepting...'
          variant='contained'
          color='primary'
          disabled={isDisabled || loadingStatus === enums.woTaskStatus.Complete}
          baseClassName={`green_button mr-2`}
        />
        <MinimalButton onClick={() => submitForm(enums.woTaskStatus.Hold)} loading={loadingStatus === enums.woTaskStatus.Hold} text='Hold' loadingText='Holding...' variant='contained' color='primary' disabled={isDisabled || loadingStatus === enums.woTaskStatus.Hold} baseClassName={`yellow_button mr-2`} />
        <MinimalButton onClick={reject} text='Reject' loadingText='Rejecting...' variant='contained' color='primary' disabled={isDisabled} baseClassName={`red_button mr-2`} />
      </div>
      {!isForReview && <MinimalButton onClick={setModeAsEdit} text='Edit' variant='contained' color='primary' startIcon={<EditOutlinedIcon />} disabled={isEditDisabled} />}{' '}
    </div>
  )
}
const renderEditModeControls = ({ setModeAsReadOnly, submitForm, loadingStatus }) => (
  <div className='d-flex justify-content-between align-items-center'>
    <div>
      <MinimalButton loading={loadingStatus === enums.woTaskStatus.ReadyForReview} disabled={loadingStatus === enums.woTaskStatus.ReadyForReview} text='Submit' loadingText='Submiting...' onClick={() => submitForm(enums.woTaskStatus.ReadyForReview)} variant='contained' color='primary' baseClassName='mr-2' />
      <MinimalButton loading={loadingStatus === enums.woTaskStatus.InProgress} disabled={loadingStatus === enums.woTaskStatus.InProgress} text='Save' loadingText='Saving...' onClick={() => submitForm(enums.woTaskStatus.InProgress)} variant='contained' color='primary' />
    </div>
    <MinimalButton text='Cancel' onClick={setModeAsReadOnly} variant='contained' color='default' />
  </div>
)

const RenderFrom = ({ loading, form, submission = {}, currentForm = {}, reFetchList, woStatusId, isEmpty, isForReview }) => {
  const formRef = useRef(null)
  // console.log({ loading, form, submission, currentForm, reFetchList, woStatusId, isEmpty, isForReview })
  const clonedSubmission = structuredClone(submission)
  const viewSubmission = structuredClone(submission)
  const [isRenderModeEdit, setEditRenderMode] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(0)
  const [isRejectOpen, setRejectOpen] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [prevFormData, setPrevFormData] = useState(clonedSubmission)
  const [currentFormData, setCurrentFormData] = useState(clonedSubmission)
  const [isSubmissionDataValid, setisSubmissionDataValid] = useState(false)
  const [newSubmissionData, setNewSubmissionData] = useState({})
  //
  const handleChangeInFormData = d => {
    if (typeof d?.changed?.value === 'string') {
      setIsChanged(true)
    }
    setNewSubmissionData({ ...newSubmissionData, data: d.data })
    // newSubmissionData.data = d.data
    setisSubmissionDataValid(d.isValid)
  }

  const handleCancel = () => {
    setNewSubmissionData({})
    setCurrentFormData({ ...prevFormData })
    setIsChanged(false)
    setEditRenderMode(false)
  }
  const submitFormData = async status => {
    if (formRef.current && formRef.current.formio && formRef.current.formio.checkValidity) {
      const isValid = formRef.current.formio.checkValidity(newSubmissionData, true)
      console.log(formRef.current.formio.errors)
      if (!isValid) {
        //This code is for show actual validation message
        // const validationErrorMessage = formRef.current.formio.errors.reduce((message, error) => {
        //   return message + error.message + '. \n' // Concatenate all error messages
        // }, '')

        // Toast.error(validationErrorMessage)
        const firstInputElementWithError = document.querySelector('.formio-error-wrapper') // Adjust the selector as needed
        console.log('first error - ', firstInputElementWithError)
        if (firstInputElementWithError) {
          // Scroll the page to the position of the input element
          firstInputElementWithError.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        Toast.error('Fill all the required fields !')
        return
      }
      console.log('Form data validity', isValid)
    } else {
      console.error('Form reference or onSubmit function not available')
    }
    setIsChanged(false)
    if (!isSubmissionDataValid) {
      Toast.error('Fill all the required fields !')
      return
    }

    const { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description } = currentForm
    const asset_form_data = JSON.stringify(newSubmissionData)
    const payload = { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description, asset_form_data, status }
    setLoadingStatus(status)
    try {
      const res = await addUpdateAssetForm(payload)
      if (res.success > 0) Toast.success(`Form submitted successfully !`)
      else Toast.error(res.message)
      reFetchList()
      setLoadingStatus(0)
      setEditRenderMode(false)
    } catch (error) {
      setLoadingStatus(0)
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  const updateFormStatus = async status => {
    setIsChanged(false)
    try {
      setLoadingStatus(status)
      const payload = { wOcategorytoTaskMapping_id: currentForm.wOcategorytoTaskMapping_id, status }
      const res = await updateWOCategoryTaskStatus(payload)
      if (res.success > 0) Toast.success(`Status updated successfully !`)
      else Toast.error(res.message)
      setLoadingStatus(0)
      reFetchList()
    } catch (error) {
      Toast.error('Something went wrong !')
      setLoadingStatus(0)
    }
  }
  useEffect(() => {
    setCurrentFormData({ ...submission })
    setPrevFormData({ ...submission })
  }, [submission])
  //
  useEffect(() => {
    setFormLoading(true)
    setTimeout(() => setFormLoading(false), 600)
  }, [isRenderModeEdit])
  useEffect(() => {
    setEditRenderMode(false)
  }, [currentForm])

  if (isForReview) {
    const isDisabled = woStatusId === enums.woTaskStatus.Complete

    return (
      <>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', padding: '10px', borderRight: '1px solid #eee', position: 'relative' }}>
          {loading || formLoading ? <Loader /> : isEmpty ? <EmptyState /> : <Form form={form} onChange={d => handleChangeInFormData(d)} submission={currentFormData} options={{ readOnly: isDisabled }} />}
        </div>
        <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          {renderReadOnlyModeControls({ setModeAsEdit: () => setEditRenderMode(true), loadingStatus, woStatusId, submitForm: status => submitFormData(status), currentForm, reject: () => setRejectOpen(true), isForReview: true })}
          <div>
            {/* <MinimalButton loading={loadingStatus === enums.woTaskStatus.ReadyForReview} disabled={!isChanged || isDisabled || loadingStatus === enums.woTaskStatus.ReadyForReview} text='Submit' loadingText='Submiting...' onClick={() => submitFormData(enums.woTaskStatus.ReadyForReview)} variant='contained' color='primary' baseClassName='mr-2' />
            <MinimalButton disabled={!isChanged} text='Cancel' loadingText='Saving...' onClick={() => handleCancel()} variant='contained' color='primary' /> */}
          </div>
        </div>
        {isRejectOpen && <RejectCategoryTask woTaskCategoryMappingId={currentForm.wOcategorytoTaskMapping_id} open={isRejectOpen} afterSubmit={reFetchList} onClose={() => setRejectOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', padding: '10px', borderRight: '1px solid #eee', position: 'relative' }}>
        {loading || formLoading ? <Loader /> : isEmpty ? <EmptyState /> : isRenderModeEdit ? <Form form={form} onChange={d => handleChangeInFormData(d)} submission={currentFormData} ref={formRef} /> : <Form form={form} submission={viewSubmission} options={{ readOnly: () => true }} />}
      </div>
      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid #eee' }}>
        {isRenderModeEdit
          ? renderEditModeControls({ setModeAsReadOnly: () => handleCancel(), submitForm: status => submitFormData(status), loadingStatus })
          : renderReadOnlyModeControls({ setModeAsEdit: () => setEditRenderMode(true), loadingStatus, woStatusId, submitForm: status => updateFormStatus(status), currentForm, reject: () => setRejectOpen(true) })}
      </div>
      {isRejectOpen && <RejectCategoryTask woTaskCategoryMappingId={currentForm.wOcategorytoTaskMapping_id} open={isRejectOpen} afterSubmit={reFetchList} onClose={() => setRejectOpen(false)} />}
    </>
  )
}
export default memo(RenderFrom)
