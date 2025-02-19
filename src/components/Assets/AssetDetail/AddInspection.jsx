import React, { useEffect, useState } from 'react'
import Box from '@material-ui/core/Box'
import { history } from '../../../helpers/history'
import getUserRole from '../../../helpers/getUserRole'
import $ from 'jquery'
import _ from 'lodash'
import assetDetail from '../../../Services/Asset/assetDetailService'
import { OkNotOkAttControl, LRCAttControl } from '../../Inspection/localComponents.js'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import createInspection from '../../../Services/Inspection/createInspection.js'
import { Toast } from '../../../Snackbar/useToast'

function AddInspection({ assetId }) {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const [obj, setObj] = useState({})
  const [formObj, setFormObj] = useState([])
  const [loading, setLoading] = useState(false)
  //
  const LabelVal = ({ label, value, w }) => (
    <div style={{ width: `${w}%` }}>
      <div style={{ fontWeight: 600 }}>{label} : </div>
      <div style={{ wordWrap: 'break-word' }}>{value}</div>
    </div>
  )
  //
  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      try {
        const assetDetailsData = await assetDetail({ asset_id: assetId })
        setObj(assetDetailsData.data.data)
        if (assetDetailsData.data.data.inspectionForms) {
          const notOkAttrs = []
          const objForm = [...assetDetailsData.data.data.inspectionForms.categoryAttributeList]
          assetDetailsData.data.data.issues.forEach(d => d.status !== 15 && notOkAttrs.push(d.attribute_id))
          objForm.forEach(cat => {
            cat.form_attributes.forEach(att => {
              if (notOkAttrs.includes(att.attributes_id)) {
                att.value = 'Not Ok'
                att.isDisabled = true
              }
            })
          })
          // console.log(notOkAttrs)
          setFormObj(objForm)
        } else setFormObj([])
        console.log(assetDetailsData.data.data)
      } catch (err) {
        console.log(err)
      }
      $('#pageLoading').hide()
    })()
  }, [loginData.uuid, assetId])
  //
  const getDefaultValue = id => (id === 3 ? 'LEFT' : 'Ok')
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
        att.date_time = new Date().toISOString().replace(/([^T]+)T([^\.]+).*/g, '$1 $2')
        att.type = ''
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
    history.goBack()
  }
  //
  return (
    <div style={{ height: 'calc(100vh - 64px)', background: '#fff' }}>
      <Box style={{ padding: '0 20px', background: '#fff' }}>
        <Box className='inspection-title bottom-lines' style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Perform Checklist</div>
        </Box>
      </Box>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 209px)', height: 'calc(100vh - 209px)', padding: '0 20px 20px 20px' }}>
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
                if ([0, 1].includes(val.values_type)) return <OkNotOkAttControl onChange={v => handleOnFormChange(val, v)} enable key={val.attributes_id} label={val.name} disabled={val.isDisabled} value={val.value === 'Not Ok' ? 'NOT_OK' : 'OK'} />
                if (val.values_type === 3) return <LRCAttControl key={val.attributes_id} label={val.name} value={val.value === 'LEFT' ? 'LEFT' : val.value === 'RIGHT' ? 'RIGHT' : 'CENTER'} />
              })}
            </div>
          </div>
        ))}
      </div>
      {!_.isEmpty(formObj) && (
        <div style={{ padding: '16px' }}>
          <Button variant='contained' color='primary' className='nf-buttons mr-3' onClick={submitData} disableElevation disabled={loading} style={{ width: '15%' }}>
            {loading ? 'Saving...' : 'Save'}
            {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
          </Button>
          <Button variant='contained' color='default' className='nf-buttons' onClick={() => history.goBack()} disableElevation style={{ width: '15%' }}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

export default AddInspection
