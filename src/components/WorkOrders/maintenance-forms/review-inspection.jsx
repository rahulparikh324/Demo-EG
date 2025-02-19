import React, { useState, memo } from 'react'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import { snakifyKeys } from 'helpers/formatters'

import { Form } from 'react-formio'
import { isEmpty, get } from 'lodash'

import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'

import addUpdateAssetForm from 'Services/FormIO/addUpdateAssetForm'

import RejectCategoryTask from 'components/WorkOrders/RejectCategoryTask'

const ReviewInspection = ({ open, onClose, obj, data, afterSubmit, equipmentListOptions }) => {
  const [loadingStatus, setLoadingStatus] = useState(0)
  const [isRejectOpen, setRejectOpen] = useState(false)
  console.log(equipmentListOptions)
  const removeSubmitFromForm = form => {
    if (isEmpty(form)) return {}
    const newForm = form
    const comps = []
    form.components.forEach(d => {
      if (d.key === 'footer') {
        const footerComp = d.components[0].components
        const finalFooter = footerComp.find(q => q.key === 'finalFooter')
        if (!isEmpty(finalFooter)) {
          const calibrationTable = finalFooter.components.find(x => x.key === 'testEquipmentCalibrationTable')
          if (!isEmpty(calibrationTable)) {
            if (!isEmpty(get(calibrationTable, 'components[0].data.values', ''))) {
              calibrationTable.components[0].data.values = equipmentListOptions.map(d => ({ ...d, label: d.equipmentNumber, value: d.equipmentId }))
            }
          }
        }
      }
      if (d.key !== 'submit') comps.push(d)
    })
    newForm.components = comps
    return newForm
  }
  const form = removeSubmitFromForm({ display: 'form', components: obj.components })
  let newSubmissionData = {}
  let isSubmissionDataValid = true
  //
  const handleChangeInFormData = d => {
    newSubmissionData = { data: d.data }
    isSubmissionDataValid = d.isValid
  }
  const submitForm = async status => {
    if (!isSubmissionDataValid) return Toast.error('Fill all the required fields !')
    const { assetFormId, formName, formId } = data
    const assetFormData = JSON.stringify(newSubmissionData)
    const payload = { assetFormId, formName, formId, assetFormData, status }
    setLoadingStatus(status)
    try {
      const res = await addUpdateAssetForm(snakifyKeys(payload))
      if (res.success > 0) {
        Toast.success(`Form submitted successfully !`)
        afterSubmit(data)
      } else Toast.error(res.message)
      setLoadingStatus(0)
    } catch (error) {
      setLoadingStatus(0)
      console.log(error)
      Toast.error('Something went wrong !')
    }
    onClose()
  }
  const afterReject = () => {
    afterSubmit(data)
    onClose()
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Inspection' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 126px)', background: '#efefef' }}>
        <div style={{ padding: '10px', width: '95vw' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <Form form={form} onChange={d => handleChangeInFormData(d)} submission={{ data: obj.data }} />
          </div>
        </div>
      </div>
      <div className='d-flex align-items-center' style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid #eee' }}>
        <MinimalButton onClick={() => submitForm(enums.woTaskStatus.Complete)} loading={loadingStatus === enums.woTaskStatus.Complete} text='Save & Accept' loadingText='Accepting...' variant='contained' color='primary' disabled={loadingStatus === enums.woTaskStatus.Complete} baseClassName={`green_button mr-2`} />
        <MinimalButton onClick={() => submitForm(enums.woTaskStatus.Hold)} loading={loadingStatus === enums.woTaskStatus.Hold} text='Hold' loadingText='Holding...' variant='contained' color='primary' disabled={loadingStatus === enums.woTaskStatus.Hold} baseClassName={`yellow_button mr-2`} />
        <MinimalButton onClick={() => setRejectOpen(true)} text='Reject' variant='contained' color='primary' baseClassName={`red_button mr-2`} />
      </div>
      {isRejectOpen && <RejectCategoryTask woTaskCategoryMappingId={data.wOcategorytoTaskMappingId} open={isRejectOpen} afterSubmit={afterReject} onClose={() => setRejectOpen(false)} />}
    </Drawer>
  )
}

export default memo(ReviewInspection)
