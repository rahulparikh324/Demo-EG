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
import { contactCategoryOptions } from 'components/preventative-maintenance/common/utils'
import { snakifyKeys } from 'helpers/formatters'
import Checkbox from '@material-ui/core/Checkbox'
import jobScheduler from 'Services/jobScheduler'

function AddContact({ vendorId, open, onClose, reFetch, obj, isEdit }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({})
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [markAsPrimary, setMarkAsPrimary] = useState(false)
  const [notes, setNotes] = useState('')

  const validateForm = async () => {
    const schema = yup.object().shape({
      name: yup.string().required('Contact Name is required !'),
      email: yup.string().email('Enter a valid Email !').required('Email is required !'),
      phoneNumber: yup.string().nullable(),
      categoryId: yup.string().required('Category is required !'),
      notes: yup.string().nullable().max(1024, 'Note can not be more than 1024 characters !'),
    })

    const payload = {
      name,
      email,
      phoneNumber,
      categoryId: get(categoryId, 'value', ''),
      notes: isEmpty(notes) ? null : notes,
      isDeleted: false,
      markAsPrimary: markAsPrimary,
      vendorId: vendorId,
      contactId: isEdit && obj ? obj.contactId : null,
    }
    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) submitData(payload)
  }

  const submitData = async payload => {
    setIsLoading(true)
    try {
      const res = await jobScheduler.createUpdateContact(snakifyKeys(payload))
      if (res.success > 0) {
        if (isEdit && obj) {
          Toast.success('Contact details have been updated successfully!')
        } else {
          Toast.success('Contact details have been created successfully!')
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
      setName(obj.name ? obj.name : '')
      setEmail(obj.email ? obj.email : '')
      setPhoneNumber(obj.phoneNumber ? obj.phoneNumber : '')
      setNotes(obj.notes ? obj.notes : '')
      setMarkAsPrimary(obj.markAsPrimary ? obj.markAsPrimary : false)
      setCategoryId(obj.categoryId ? contactCategoryOptions.find(d => d.value === obj.categoryId) : '')
    }
  }, [])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title={`${isEdit ? 'Edit' : 'Create'} Contact`} closeFunc={onClose} style={{ width: '100%' }} />
      <div style={{ padding: '10px', height: 'calc(100vh - 65px)', width: '450px', background: '#efefef' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
          <MinimalInput value={name} onChange={setName} error={error.name} label='Contact Name' placeholder='Enter Contact Name' w={100} onFocus={() => setError({ ...error, name: null })} />
          <MinimalAutoComplete onFocus={e => setError({ ...error, categoryId: null })} placeholder='Select Category' value={categoryId} onChange={setCategoryId} options={contactCategoryOptions} label='Category' w={100} isClearable isLoading={false} error={error.categoryId} />
          <MinimalInput value={email} onChange={setEmail} error={error.email} label='Email' placeholder='Enter Email' w={100} onFocus={() => setError({ ...error, email: null })} />
          <MinimalPhoneInput value={phoneNumber} onChange={setPhoneNumber} error={error.phoneNumber} label='Phone Number' placeholder='Enter Phone Number' onFocus={() => setError({ ...error, phoneNumber: null })} w={100} />
          <div className='d-flex align-items-center'>
            <Checkbox style={{ padding: '10px 10px 10px 0px' }} size='small' color='primary' checked={markAsPrimary} onChange={v => setMarkAsPrimary(!markAsPrimary)} />
            <div className='minimal-input-label'>Primary Contact for Vendor</div>
          </div>
          <MinimalTextArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} error={error.notes} onFocus={() => setError({ ...error, notes: null })} placeholder='Write here...' label='Notes' w={100} baseStyles={{ marginBottom: 0 }} />
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

export default AddContact
