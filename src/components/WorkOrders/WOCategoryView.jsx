import React, { useState, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'
import { Form } from 'react-formio'
import getFormByWOTaskId from '../../Services/WorkOrder/getFormByWOTaskId'
import { Toast } from '../../Snackbar/useToast'
import enums from '../../Constants/enums'
import CircularProgress from '@material-ui/core/CircularProgress'
import RejectCategoryTask from './RejectCategoryTask'
import { MinimalButton } from 'components/common/buttons'
import addUpdateAssetForm from 'Services/FormIO/addUpdateAssetForm'

const useStyles = makeStyles(theme => ({
  paneHeader: {
    borderTop: '1px solid #A6A6A6',
    background: '#fff',
    marginTop: 'auto',
    padding: '12px',
  },
  btnGreen: { color: '#fff !important', backgroundColor: '#48A825 !important', borderColor: '#48A825 !important', '&:hover': { backgroundColor: '#3b8c1d !important', borderColor: '#3b8c1d !important' }, '&:disabled': { opacity: '.65', boxShadow: 'none' } },
  btnRed: { color: '#fff !important', backgroundColor: '#FF0000 !important', borderColor: '#FF0000 !important', '&:hover': { backgroundColor: '#e30000 !important', borderColor: '#e30000 !important' }, '&:disabled': { opacity: '.65', boxShadow: 'none' } },
  btnOrange: { color: '#fff !important', backgroundColor: '#ff9d13 !important', borderColor: '#ff9d13 !important', '&:hover': { backgroundColor: '#e49321 !important', borderColor: '#e49321 !important' }, '&:disabled': { opacity: '.65', boxShadow: 'none' } },
}))

function WOCategoryView({ open, onClose, obj, equipmentListOptions, isEdit, isQuote, onEdit, isEditData }) {
  const classes = useStyles()
  const [taskFormDetail, setTaskFormDetail] = useState({})
  const [taskFormObject, setTaskFormObject] = useState({})
  const [formLoading, setFormLoading] = useState(true)
  const [isSubmitLoadingStatus, setSubmitLoadingStatus] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [formDataToSubmit, setFormDataToSubmit] = useState({})
  const offset = isEdit ? 126 : 72
  const newSubmissionData = {}
  let isSubmissionDataValid = false
  const formTitle = obj.isIssue ? `Issue - ${obj.issueTitle}` : `${!_.isEmpty(obj) ? `Type - ${obj.form_type}` : 'Type'}`
  // load
  useEffect(() => {
    ;(async () => {
      await fetchTaskForm()
    })()
  }, [])
  const fetchTaskForm = async () => {
    try {
      let woTaskMappingId = obj.wOcategorytoTaskMapping_id
      setFormLoading(true)
      setDataLoading(true)
      setTaskFormObject(null)
      setTaskFormDetail(null)
      const res = await getFormByWOTaskId({ id: woTaskMappingId })
      if (res.success === 1) {
        setFormLoading(false)
        setDataLoading(false)
        setTaskFormDetail(res.data)
        if (!_.isEmpty(res.data.asset_form_data)) {
          let form = JSON.parse(res.data.asset_form_data)
          const formObj = JSON.parse(obj.form_data)
          formObj.components.forEach(d => {
            if (d.key === 'footer') {
              const footerComp = d.components[0].components
              const finalFooter = footerComp.find(q => q.key === 'finalFooter')
              if (!_.isEmpty(finalFooter)) {
                const calibrationTable = finalFooter.components.find(x => x.key === 'testEquipmentCalibrationTable')
                if (!_.isEmpty(calibrationTable)) {
                  if (!_.isEmpty(_.get(calibrationTable, 'components[0].data.values', ''))) {
                    calibrationTable.components[0].data.values = equipmentListOptions.map(d => ({ ...d, label: d.equipmentNumber, value: d.equipmentId }))
                  }
                }
              }
            }
          })
          console.log(form)
          setTaskFormObject(formObj)
          setFormDataToSubmit(form)
        }
      } else {
        setFormLoading(false)
        setDataLoading(false)
      }
    } catch (error) {
      console.log(error)
      setFormLoading(false)
      setDataLoading(false)
    }
  }
  //submit & save controls
  const renderEditModeControls = () => (
    <div className='d-flex'>
      {!isQuote && <MinimalButton loading={isSubmitLoadingStatus === enums.woTaskStatus.ReadyForReview} disabled={isSubmitLoadingStatus === enums.woTaskStatus.ReadyForReview} text='Submit' loadingText='Submiting...' onClick={() => submitFormData(enums.woTaskStatus.ReadyForReview)} variant='contained' color='primary' baseClassName='mr-2' />}
      <MinimalButton
        loading={isQuote ? isSubmitLoadingStatus === enums.woTaskStatus.Open : isSubmitLoadingStatus === enums.woTaskStatus.InProgress}
        disabled={isQuote ? isSubmitLoadingStatus === enums.woTaskStatus.Open : isSubmitLoadingStatus === enums.woTaskStatus.InProgress}
        text='Save'
        loadingText='Saving...'
        onClick={() => submitFormData(isQuote ? enums.woTaskStatus.Open : enums.woTaskStatus.InProgress)}
        variant='contained'
        color='primary'
      />
    </div>
  )
  const submitFormData = async status => {
    if (!isSubmissionDataValid) {
      Toast.error('Fill all the required fields !')
      return
    }
    const { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description } = taskFormDetail
    const asset_form_data = JSON.stringify(newSubmissionData)
    const payload = { asset_form_id, asset_form_name, form_id, asset_form_type, asset_form_description, asset_form_data, status }
    setSubmitLoadingStatus(status)
    try {
      const res = await addUpdateAssetForm(payload)
      if (res.success > 0) Toast.success(`Form submitted successfully !`)
      else Toast.error(res.message)
      setSubmitLoadingStatus(0)
      onClose()
    } catch (error) {
      setSubmitLoadingStatus(0)
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  //
  const showLoader = () => (
    <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
      <CircularProgress size={20} thickness={5} />
    </div>
  )
  const handleChangeInFormData = d => {
    newSubmissionData.data = d.data
    isSubmissionDataValid = d.isValid
  }

  return (
    <div>
      <Drawer anchor='right' open={open} onClose={onClose}>
        <FormTitle title={formTitle} closeFunc={onClose} onEdit={onEdit} isEdit={isEditData} style={{ width: '100%', minWidth: '450px' }} />
        <div style={{ width: '95vw' }}>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: `calc(100vh - ${offset}px)`, height: `calc(100vh - ${offset}px)`, padding: '10px 16px', borderRight: '1px solid #eee', position: 'relative' }}>
            {formLoading || dataLoading ? (
              showLoader()
            ) : _.isEmpty(taskFormObject) ? (
              <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
                Not Data to show !
              </div>
            ) : (
              <>{!isEdit ? <div className='workorder-viewline-form'>{<Form form={taskFormObject} submission={formDataToSubmit} options={{ readOnly: true }} />}</div> : <div className='workorder-viewline-form'>{<Form form={taskFormObject} onChange={d => handleChangeInFormData(d)} submission={formDataToSubmit} />}</div>}</>
            )}
          </div>
          {isEdit && (
            <div className={classes.paneHeader} style={{ borderTop: '1px solid #eee' }}>
              {renderEditModeControls()}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}

export default WOCategoryView
