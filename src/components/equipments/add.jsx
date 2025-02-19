import React, { useState, useEffect } from 'react'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalDatePicker } from 'components/Assets/components'
import { MinimalButtonGroup } from 'components/common/buttons'

import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { utils } from 'react-modern-calendar-datepicker'

import equipments from 'Services/equipments'

import * as yup from 'yup'
import { equipmentOptions } from './utils'
import { validateSchema } from 'helpers/schemaValidation'
import enums from 'Constants/enums'
import { get, isEmpty } from 'lodash'

import usePostData from 'hooks/post-data'

const AddEquipment = ({ open, onClose, isEdit, reFetch, obj }) => {
  const [error, setError] = useState({})
  const [formData, setFormData] = useState({
    equipmentNumber: '',
    equipmentName: '',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    calibrationInterval: 0,
    calibrationDate: utils().getToday(),
    calibrationStatus: enums.EQUIPMENT.NA,
  })

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = async () => {
    const schema = yup.object().shape({
      equipmentNumber: yup.string().max(25, 'ID can not be more than 25 Characters').required('ID is required !'),
      equipmentName: yup.string().max(100, 'Name can not be more than 100 Characters').required('Name is required !'),
      manufacturer: yup.string().required('Manufacturer is required !'),
      modelNumber: yup.string().required('Model Number is required !'),
      serialNumber: yup.string().required('Serial Number is required !'),
      calibrationInterval: yup.string().required('Calibration Interval is required !'),
    })
    const isValid = await validateSchema(formData, schema)
    setError(isValid)
    if (isValid === true) submitData(formData)
  }

  const postSuccess = () => {
    onClose()
    reFetch()
  }

  const { loading: isLoading, mutate: Equipment } = usePostData({ executer: equipments.addUpdateEquipment, postSuccess, message: { success: `Equipment ${isEdit ? 'Updated' : 'Created'} successfully!`, error: 'Something went wrong' } })

  const submitData = async payload => Equipment({ ...payload, calibrationDate: !isEmpty(formData.calibrationDate) ? new Date(formData.calibrationDate.year, formData.calibrationDate.month - 1, formData.calibrationDate.day, 12).toISOString() : null })

  useEffect(() => {
    if (isEdit) {
      const _date = new Date(obj.calibrationDate)
      setFormData({
        equipmentId: get(obj, 'equipmentId', ''),
        equipmentNumber: get(obj, 'equipmentNumber', ''),
        equipmentName: get(obj, 'equipmentName', ''),
        manufacturer: get(obj, 'manufacturer', ''),
        modelNumber: get(obj, 'modelNumber', ''),
        serialNumber: get(obj, 'serialNumber', ''),
        calibrationInterval: get(obj, 'calibrationInterval', ''),
        calibrationDate: { month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() },
        calibrationStatus: obj.calibrationStatus,
      })
    }
  }, [isEdit, obj])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title={`${isEdit ? 'Edit' : 'Create'} Equipment`} closeFunc={onClose} style={{ width: '100%' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalInput value={get(formData, 'equipmentNumber', '') || ''} onChange={value => handleInputChange('equipmentNumber', value)} error={error.equipmentNumber} label='ID#' placeholder='Add ID' w={100} onFocus={() => setError({ ...error, equipmentNumber: null })} />
            <MinimalInput value={get(formData, 'equipmentName', '') || ''} onChange={value => handleInputChange('equipmentName', value)} error={error.equipmentName} label='Name' placeholder='Add Name' w={100} onFocus={() => setError({ ...error, equipmentName: null })} />
            <MinimalInput value={get(formData, 'manufacturer', '') || ''} onChange={value => handleInputChange('manufacturer', value)} error={error.manufacturer} label='Manufacturer' placeholder='Add Manufacturer' w={100} onFocus={() => setError({ ...error, manufacturer: null })} />
            <MinimalInput value={get(formData, 'modelNumber', '') || ''} onChange={value => handleInputChange('modelNumber', value)} error={error.modelNumber} label='Model Number' placeholder='Add Model Number' w={100} onFocus={() => setError({ ...error, modelNumber: null })} />
            <MinimalInput value={get(formData, 'serialNumber', '') || ''} onChange={value => handleInputChange('serialNumber', value)} error={error.serialNumber} label='Serial Number' placeholder='Add Serial Number' w={100} onFocus={() => setError({ ...error, serialNumber: null })} />
            <MinimalInput value={get(formData, 'calibrationInterval', '') || ''} onChange={value => handleInputChange('calibrationInterval', parseInt(value))} error={error.calibrationInterval} label='Calibration Interval' placeholder='Add Calibration Interval' w={100} onFocus={() => setError({ ...error, calibrationInterval: null })} />
            <MinimalDatePicker date={get(formData, 'calibrationDate', '') || ''} setDate={value => handleInputChange('calibrationDate', value)} maximumDate={utils().getToday()} label='Calibration Date' placeholder='Calibration Date' w={100} />
            <MinimalButtonGroup label='Status' value={get(formData, 'calibrationStatus', '') || ''} onChange={value => handleInputChange('calibrationStatus', value)} options={equipmentOptions} w={100} />
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' onClick={validateForm} disableElevation disabled={isLoading}>
          {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update' : 'Create'}
          {isLoading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      </div>
    </Drawer>
  )
}

export default AddEquipment
