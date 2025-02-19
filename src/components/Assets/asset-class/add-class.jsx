import React, { useState, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import { snakifyKeys } from 'helpers/formatters'
import { formatAssetTypes } from 'components/Assets/asset-class/utils'
import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { get, isEmpty } from 'lodash'

import getAllFormTypes from 'Services/FormIO/getAllFormTypes'
import addAssetClass from 'Services/FormIO/add-class'

import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FormTitle } from 'components/Maintainance/components'
import { Toast } from 'Snackbar/useToast'
import { MinimalInput, MinimalAutoComplete } from 'components/Assets/components'

const AddClass = ({ open, onClose, reFetch, obj, isEdit }) => {
  const [error, setError] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [assetClassCode, setAssetClassCode] = useState('')
  const [assetClassName, setAssetClassName] = useState('')
  const [assetExpectedUsefullLife, setAssetExpectedUsefullLife] = useState(0)
  const [type, setType] = useState(null)
  const [pmPlan, setPmPlan] = useState(null)
  const [pmPlanOptions, setPmPlanOptions] = useState([])
  const { loading, data: typeOptions } = useFetchData({ fetch: getAllFormTypes, payload: { pageIndex: 1, searchString: '' }, formatter: d => formatAssetTypes(d) })

  const validateForm = async () => {
    const schema = yup.object().shape({
      assetClassCode: yup.string().required('Class code is required !').max(100, 'Code can not be more than 100 characters !'),
      assetClassName: yup.string().required('Class Name is required !'),
      formTypeId: yup.string().required('Asset Type is required !'),
    })
    const payload = {
      assetClassCode,
      assetClassName,
      formTypeId: get(type, 'value', ''),
      assetExpectedUsefullLife: Number(assetExpectedUsefullLife),
      inspectiontemplateAssetClassId: get(obj, 'inspectiontemplateAssetClassId', null),
      setDefaultPmPlanId: isEdit ? (!isEmpty(pmPlan) ? get(pmPlan, 'value', '') : null) : null,
      wantToRemoveDefaultPmplan: isEmpty(pmPlan) ? true : false,
    }
    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) submitData(payload)
  }

  const submitData = async payload => {
    setIsLoading(true)
    try {
      const res = await addAssetClass(snakifyKeys(payload))
      if (res.success > 0) Toast.success('New Class added successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setIsLoading(false)
    onClose()
    reFetch()
  }

  useEffect(() => {
    if (isEdit && !isEmpty(typeOptions)) {
      const pmPlanOptions = get(obj, 'pmplansList', []).map(d => ({ ...d, label: d.planName, value: d.pmPlanId }))
      setPmPlanOptions(pmPlanOptions)
      setAssetClassCode(obj.assetClassCode)
      setAssetClassName(obj.assetClassName)
      setAssetExpectedUsefullLife(obj.assetExpectedUsefullLife || 0)
      setType(typeOptions.find(d => d.value === obj.formTypeId))
      setPmPlan(pmPlanOptions.find(d => d.isDefaultPmPlan === true))
    }
  }, [typeOptions])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title={`${isEdit ? 'Edit' : 'Add'} Asset Class`} closeFunc={onClose} style={{ width: '100%' }} />
      <div style={{ padding: '10px', height: 'calc(100vh - 65px)', width: '450px', background: '#efefef' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
          <MinimalInput value={assetClassCode} onChange={setAssetClassCode} error={error.assetClassCode} label='Class Code' placeholder='Add Class Code' w={100} onFocus={() => setError({ ...error, assetClassCode: null })} />
          <MinimalInput value={assetClassName} onChange={setAssetClassName} error={error.assetClassName} label='Class Name' placeholder='Add Class Name' w={100} onFocus={() => setError({ ...error, assetClassName: null })} />
          <MinimalInput type='number' min={0} value={assetExpectedUsefullLife} onChange={setAssetExpectedUsefullLife} label='Expected Life' placeholder='Add expected life' w={100} />
          <MinimalAutoComplete onFocus={e => setError({ ...error, formTypeId: null })} placeholder='Select Type' value={type} onChange={setType} options={typeOptions} label='Select Type' w={100} isClearable isLoading={loading} error={error.formTypeId} />
          {isEdit && <MinimalAutoComplete placeholder='Select PM Plan' value={pmPlan} onChange={setPmPlan} options={pmPlanOptions} label='Default PM Plan' w={100} isClearable />}
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={isLoading}>
          {isLoading ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update' : 'Add'}
          {isLoading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      </div>
    </Drawer>
  )
}

export default AddClass
