import React, { useState, useEffect, useRef } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../../Maintainance/components'
import { Form } from 'react-formio'
import { Toast } from '../../../Snackbar/useToast'
import addUpdateAssetForm from '../../../Services/FormIO/addUpdateAssetForm'
import CircularProgress from '@material-ui/core/CircularProgress'
import enums from '../../../Constants/enums'

function StartInspection({ open, onClose, createObj, afterSubmit }) {
  const [loading, setLoading] = useState(false)
  const ref = useRef()

  useEffect(() => {
    console.log(JSON.parse(createObj.asset_form_data))
  }, [])

  const submitData = async data => {
    const asset_form_data = { ...JSON.parse(createObj.asset_form_data) }
    asset_form_data.data = data.data
    const payload = {
      asset_form_name: createObj.asset_form_name,
      asset_form_type: createObj.asset_form_type,
      asset_id: createObj.asset_id,
      asset_form_data: JSON.stringify(asset_form_data),
      status: enums.woTaskStatus.ReadyForReview,
    }
    // console.log(payload, ref.current, ref.current.clientHeight)
    setLoading(true)
    try {
      // console.log(payload)
      const res = await addUpdateAssetForm(payload)
      if (res.success > 0) Toast.success(`Form submitted successfully !`)
      else Toast.error(res.message)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
      Toast.error('Something went wrong !')
    }
    onClose()
    afterSubmit()
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={createObj.asset_form_name} closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ position: 'relative', maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div ref={ref} style={{ padding: '10px', width: '55vw' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 600 }}>Description :</div>
            <div>{createObj.asset_form_description}</div>
          </div>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <Form form={JSON.parse(createObj.asset_form_data)} submission={{ data: JSON.parse(createObj.asset_form_data).data }} onSubmit={d => submitData(d)} />
          </div>
        </div>
        {loading && (
          <div className='d-flex align-items-center justify-content-center' style={{ width: '100%', height: `${ref.current.clientHeight}px`, background: '#0000002e', position: 'absolute', top: 0 }}>
            <CircularProgress size={24} thickness={5} />
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default StartInspection
