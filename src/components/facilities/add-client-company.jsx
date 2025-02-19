import React, { useEffect, useState } from 'react'

import Drawer from '@material-ui/core/Drawer'

import usePostData from 'hooks/post-data'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea } from 'components/Assets/components'
import { MinimalButtonGroup, MinimalButton } from 'components/common/buttons'

import facilities from 'Services/facilities/index'

import { get } from 'lodash'
import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import { statusOptions } from './utils'

const AddClientCompany = ({ open, onClose, isEdit, reFetch, anchorObj }) => {
  const [companyData, setCompanyData] = useState({
    clientCompanyName: '',
    status: 1,
    clientCompanyCode: '',
    owner: '',
    ownerAddress: '',
  })
  const [error, setError] = useState('')

  const handleInputChange = (name, value) => {
    setCompanyData({ ...companyData, [name]: value })
  }

  const validateForm = async () => {
    const schema = yup.object().shape({
      clientCompanyName: yup.string().required('Client Company Name is required !'),
      clientCompanyCode: yup.string().required('Client Company Code is required !'),
      owner: yup.string().required('Owner Name is required !'),
      ownerAddress: yup.string().required('Owner Address is required !'),
    })
    const isValid = await validateSchema(companyData, schema)
    setError(isValid)
    if (isValid === true) submitData(companyData)
  }

  const postSuccess = () => {
    onClose()
    reFetch()
  }

  const { loading: isLoading, mutate: clientCompany } = usePostData({ executer: facilities.company.create, postSuccess, message: { success: !isEdit ? 'Client Company Create Successfully!' : 'Client Company Updated Successfully!', error: 'Something went wrong' } })
  const submitData = async payload => clientCompany({ ...payload, status: companyData.status, clientCompanyId: !isEdit ? null : anchorObj.clientCompanyId })

  useEffect(() => {
    if (isEdit) {
      setCompanyData({
        clientCompanyName: get(anchorObj, 'clientCompanyName', ''),
        status: get(anchorObj, 'status', 1),
        clientCompanyCode: get(anchorObj, 'clientCompanyCode', ''),
        owner: get(anchorObj, 'owner', ''),
        ownerAddress: get(anchorObj, 'ownerAddress', ''),
      })
    }
  }, [isEdit, anchorObj])
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={!isEdit ? 'Add Client Company' : 'Edit Client Company'} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalInput value={get(companyData, 'clientCompanyName', '') || ''} onChange={value => handleInputChange('clientCompanyName', value)} error={error.clientCompanyName} onFocus={() => setError({ ...error, clientCompanyName: null })} label='Client Company Name' placeholder='Enter Client Company Name' w={100} />
            <MinimalButtonGroup label='Status' value={get(companyData, 'status', 1) || 1} onChange={value => handleInputChange('status', value)} options={statusOptions} w={100} />
            <MinimalInput value={get(companyData, 'clientCompanyCode', '') || ''} onChange={value => handleInputChange('clientCompanyCode', value)} error={error.clientCompanyCode} onFocus={() => setError({ ...error, clientCompanyCode: null })} label='Client Company Code' placeholder='Enter Client Company Code' w={100} />
            <MinimalInput value={get(companyData, 'owner', '') || ''} onChange={value => handleInputChange('owner', value)} label='Owner Name' error={error.owner} onFocus={() => setError({ ...error, owner: null })} placeholder='Enter Owner Name' w={100} />
            <MinimalTextArea rows={3} value={get(companyData, 'ownerAddress', '') || ''} onChange={e => handleInputChange('ownerAddress', e.target.value)} error={error.ownerAddress} onFocus={() => setError({ ...error, ownerAddress: null })} placeholder='Enter Owner Address' label='Owner Address' w={100} baseStyles={{ marginBottom: 0 }} />
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text={!isEdit ? 'Add' : 'Update'} loadingText={!isEdit ? 'Adding...' : 'Updating...'} onClick={validateForm} disabled={isLoading} loading={isLoading} style={{ marginLeft: '10px' }} />
      </div>
    </Drawer>
  )
}

export default AddClientCompany
