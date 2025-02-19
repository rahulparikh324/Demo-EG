import React, { useEffect, useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { get, isEmpty } from 'lodash'

import { FormTitle } from 'components/Maintainance/components'
import { Toast } from 'Snackbar/useToast'
import { MinimalInput, MinimalAutoComplete, MinimalPhoneInput, MinimalTextArea } from 'components/Assets/components'
import { vendorCategoryOptions } from 'components/preventative-maintenance/common/utils'
import { snakifyKeys } from 'helpers/formatters'
import jobScheduler from 'Services/jobScheduler'

const AddVendor = ({ open, onClose, reFetch, obj, isEdit }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({})
  const [vendorName, setVendorName] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [vendorPhoneNumber, setVendorPhoneNumber] = useState('')
  const [vendorCategoryId, setVendorCategoryId] = useState(null)
  const [vendorAddress, setVendorAddress] = useState('')

  const validateForm = async () => {
    const schema = yup.object().shape({
      vendorName: yup.string().required('Vendor Name is required !'),
      vendorEmail: yup.string().email('Enter a valid Email !').required('Email is required !'),
      vendorPhoneNumber: yup.string().nullable(),
      vendorCategoryId: yup.string().required('Category is required !'),
      vendorAddress: yup.string().nullable().max(1024, 'Address can not be more than 1024 characters !'),
    })

    const payload = {
      vendorName,
      vendorEmail,
      vendorPhoneNumber,
      vendorCategoryId: get(vendorCategoryId, 'value', ''),
      vendorAddress: isEmpty(vendorAddress) ? null : vendorAddress,
      isDeleted: false,
      vendorId: isEdit && obj ? obj.vendorId : null,
    }
    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) submitData(payload)
  }

  const submitData = async payload => {
    setIsLoading(true)
    try {
      const res = await jobScheduler.addUpdateVendor(snakifyKeys(payload))
      if (res.success > 0) {
        if (isEdit && obj) {
          Toast.success('Vendor updated successfully !')
        } else {
          Toast.success('Vendor created successfully !')
        }
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setIsLoading(false)
    onClose()
    reFetch()
  }

  useEffect(() => {
    if (isEdit && obj) {
      setVendorName(obj.vendorName ? obj.vendorName : '')
      setVendorEmail(obj.vendorEmail ? obj.vendorEmail : '')
      setVendorPhoneNumber(obj.vendorPhoneNumber ? obj.vendorPhoneNumber : '')
      setVendorAddress(obj.vendorAddress ? obj.vendorAddress : '')
      setVendorCategoryId(obj.vendorCategoryId ? vendorCategoryOptions.find(d => d.value === obj.vendorCategoryId) : '')
    }
  }, [])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title={`${isEdit ? 'Edit' : 'Create'} Vendor`} closeFunc={onClose} style={{ width: '100%' }} />
      <div style={{ padding: '10px', height: 'calc(100vh - 65px)', width: '450px', background: '#efefef' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
          <MinimalInput value={vendorName} onChange={setVendorName} error={error.vendorName} label='Vendor Name' placeholder='Enter Vendor Name' w={100} onFocus={() => setError({ ...error, vendorName: null })} />
          <MinimalInput value={vendorEmail} onChange={setVendorEmail} error={error.vendorEmail} label='Email' placeholder='Enter Email' w={100} onFocus={() => setError({ ...error, vendorEmail: null })} />
          <MinimalPhoneInput value={vendorPhoneNumber} onChange={setVendorPhoneNumber} error={error.vendorPhoneNumber} label='Phone Number' placeholder='Enter Phone Number' w={100} onFocus={() => setError({ ...error, vendorPhoneNumber: null })} />
          <MinimalAutoComplete onFocus={e => setError({ ...error, vendorCategoryId: null })} placeholder='Select Category' value={vendorCategoryId} onChange={setVendorCategoryId} options={vendorCategoryOptions} label='Category' w={100} isClearable isLoading={false} error={error.vendorCategoryId} />
          <MinimalTextArea rows={3} value={vendorAddress} onChange={e => setVendorAddress(e.target.value)} error={error.vendorAddress} onFocus={() => setError({ ...error, vendorAddress: null })} placeholder='Enter Address' label='Address' w={100} baseStyles={{ marginBottom: 0 }} />
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

export default AddVendor
