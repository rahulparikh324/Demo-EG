import React, { useEffect, useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../../Maintainance/components'
import { OkNotOkAttControl, LRCAttControl } from '../../Inspection/localComponents.js'
import { MinimalInput } from '../components'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import createInspection from '../../../Services/Inspection/createInspection.js'
import { Toast } from '../../../Snackbar/useToast'
import _ from 'lodash'

const styles = {
  paneHeader: { display: 'flex', alignItems: 'center', padding: '12px' },
  bottomBar: { borderTop: '1px solid #c7c7c7', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
}

function PerformChecklist({ open, onClose, obj, afterSubmit }) {
  const [formObj, setFormObj] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    // console.log(obj)
    if (obj.inspectionForms) setFormObj(obj.inspectionForms.categoryAttributeList)
    else setFormObj([])
  }, [])

  const getDefaultValue = id => (id === 3 ? 'LEFT' : 'Not Ok')
  const handleOnFormChange = (attr, v) => {
    const obj = [...formObj]
    obj.forEach(cat => {
      if (cat.category_id === attr.category_id) {
        cat.form_attributes.forEach(att => {
          if (!att.value) att.value = getDefaultValue(att.values_type)
          if (att.attributes_id === attr.attributes_id) att.value = v
        })
      }
    })
    setFormObj(obj)
  }

  const checkForAutoApprove = arr => {
    const values = arr.map(d => d.value)
    const setValues = [...new Set(values)]
    if (!obj.isAutoApprove) return 8
    if (setValues.length === 1 && setValues[0] === 'OK') return 10
    else return 8
  }
  const submitData = async () => {
    const cat = [...formObj]
    cat.forEach(cat => {
      cat.form_attributes.forEach(att => {
        att.id = att.attributes_id
        if (!att.value) att.value = getDefaultValue(att.values_type)
      })
    })
    const attrs = []
    cat.forEach(cat => attrs.push(cat.form_attributes))
    // console.log(cat)
    setLoading(true)
    try {
      const formData = new FormData()
      const loginData = JSON.parse(localStorage.getItem('loginData'))
      formData.append('asset_id', obj.asset_id)
      formData.append('requested_datetime', new Date().toISOString().replace(/([^T]+)T([^\.]+).*/g, '$1 $2'))
      formData.append('created_datetime', new Date().toISOString().replace(/([^T]+)T([^\.]+).*/g, '$1 $2'))
      formData.append('attribute_values', JSON.stringify(attrs.flat()))
      formData.append('status', JSON.stringify(checkForAutoApprove(attrs.flat())))
      formData.append('operator_id', loginData.uuid)
      formData.append('site_id', obj.site_id)
      formData.append('company_id', obj.company_id)
      const res = await createInspection(formData)
      // console.log(res)
      if (res.success > 0) Toast.success(`Form submitted successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    onClose()
    afterSubmit()
  }
  const LabelVal = ({ label, value, w }) => (
    <div style={{ width: `${w}%` }}>
      <div style={{ fontWeight: 600 }}>{label} : </div>
      <div style={{ wordWrap: 'break-word' }}>{value}</div>
    </div>
  )

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Perform Checklist' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)' }}>
        {_.isEmpty(formObj) && (
          <div className='d-flex justify-content-center align-items-center' style={{ height: '90%', fontWeight: 800, color: 'grey' }}>
            No Inspection form present for this asset !
          </div>
        )}
        <div style={{ padding: '10px', width: '55vw', padding: '10px' }}>
          {!_.isEmpty(formObj) && (
            <div style={{ background: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '14px' }}>Asset Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <LabelVal value={obj.name} label='Asset Name' w={100} />
                <LabelVal value={obj.internal_asset_id} label='Asset #' w={100} />
              </div>
            </div>
          )}
          {formObj.map((attr, key) => (
            <div key={key} style={{ background: '#fafafa', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '14px' }}>{attr.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {attr.form_attributes.map((val, k) => {
                  if ([0, 1].includes(val.values_type)) return <OkNotOkAttControl onChange={v => handleOnFormChange(val, v)} enable key={val.attributes_id} label={val.name} value={val.value === 'Ok' ? 'OK' : 'NOT_OK'} />
                  if (val.values_type === 3) return <LRCAttControl key={val.attributes_id} label={val.name} value={val.value === 'LEFT' ? 'LEFT' : val.value === 'RIGHT' ? 'RIGHT' : 'CENTER'} />
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!_.isEmpty(formObj) && (
        <div style={{ ...styles.paneHeader, ...styles.bottomBar }}>
          <Button variant='contained' color='primary' className='nf-buttons mr-3' onClick={submitData} disableElevation disabled={loading} style={{ width: '30%' }}>
            {loading ? 'Saving...' : 'Save'}
            {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
          </Button>
          <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose} style={{ width: '30%' }}>
            Cancel
          </Button>
        </div>
      )}
    </Drawer>
  )
}

export default PerformChecklist
