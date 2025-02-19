import React, { useEffect, useState } from 'react'

import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'
import Checkbox from '@material-ui/core/Checkbox'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalTextArea, MinimalAutoComplete, MinimalInput } from 'components/Assets/components'
import { MinimalButton } from 'components/common/buttons'
import { validateTimeMaterials, timeCategoty, burdenTypeOptions } from 'components/WorkOrders/utils'

import timeMaterials from 'Services/WorkOrder/timeMaterials'
import enums from 'Constants/enums'
import { get, isEmpty } from 'lodash'

const styles = {
  burdenDrpInputStyle: { fontSize: '12px', background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' },
}

const AddTimeMaterials = ({ open, onClose, isEdit, reFetch, woId, anchorObj, countUpdate }) => {
  const [errors, setErrors] = useState('')
  const [timeMaterialsData, setTimeMaterialsData] = useState({
    timeMaterialCategoryType: null,
    description: '',
    noSubFlag: false,
    quantity: '',
    quantityUnitType: null,
    rate: '',
    markup: '',
    itemCode: '',
    burdenType: burdenTypeOptions[1],
    burden: '',
    isBurdenEnabled: false,
    isMarkupEnabled: false,
  })

  const handleInputChange = (name, value) => setTimeMaterialsData({ ...timeMaterialsData, [name]: value })

  const validateForm = async () => {
    const isValid = await validateTimeMaterials({ ...timeMaterialsData, quantityUnitType: get(timeMaterialsData, 'quantityUnitType.value', ''), timeMaterialCategoryType: get(timeMaterialsData, 'timeMaterialCategoryType.value', '') })
    setErrors(isValid)
    if (isValid === true) submitData()
  }

  const payload = {
    timeMaterialCategoryType: get(timeMaterialsData, 'timeMaterialCategoryType.value', ''),
    description: get(timeMaterialsData, 'description', ''),
    noSubFlag: get(timeMaterialsData, 'noSubFlag', false),
    quantity: parseFloat(get(timeMaterialsData, 'quantity', '')),
    quantityUnitType: get(timeMaterialsData, 'quantityUnitType.value', ''),
    rate: parseFloat(get(timeMaterialsData, 'rate', '')),
    markup: !isEdit && isEmpty(timeMaterialsData.markup) ? 0 : parseFloat(get(timeMaterialsData, 'markup', 0) || 0),
    timeMaterialId: isEdit ? get(anchorObj, 'timeMaterialId', '') : null,
    itemCode: get(timeMaterialsData, 'itemCode', ''),
    burdenType: get(timeMaterialsData, 'burdenType.value', null) || null,
    burden: parseFloat(get(timeMaterialsData, 'burden', '')),
    isBurdenEnabled: get(timeMaterialsData, 'isBurdenEnabled', false),
    isMarkupEnabled: get(timeMaterialsData, 'isMarkupEnabled', false),
    woId,
  }

  const postSuccess = () => {
    onClose()
    reFetch()
    if (!isEdit) {
      countUpdate()
    }
  }

  const postError = () => {
    onClose()
  }

  const { loading, mutate: createTimeMaterial } = usePostData({ executer: timeMaterials.addUpdateTimeMaterial, postSuccess, postError, message: { success: `Time & Material ${isEdit ? 'Edited' : 'Added '} Successfully !`, error: 'Something Went Wrong !' } })
  const submitData = () => createTimeMaterial(payload)

  const unitOptions = [
    { label: 'Unit', value: enums.QUOTES.TIME_MATERIAL_UNIT.UNIT },
    { label: 'Feet (ft)', value: enums.QUOTES.TIME_MATERIAL_UNIT.FEET },
    { label: 'Blank', value: enums.QUOTES.TIME_MATERIAL_UNIT.BLANK },
  ]

  useEffect(() => {
    if (isEdit) {
      setTimeMaterialsData({
        timeMaterialCategoryType: timeCategoty.find(d => d.value === anchorObj.timeMaterialCategoryType),
        description: get(anchorObj, 'description', ''),
        noSubFlag: get(anchorObj, 'noSubFlag', false),
        quantity: get(anchorObj, 'quantity', ''),
        quantityUnitType: unitOptions.find(d => d.value === anchorObj.quantityUnitType),
        rate: get(anchorObj, 'rate', ''),
        markup: get(anchorObj, 'markup', 0),
        itemCode: get(anchorObj, 'itemCode', ''),
        burdenType: burdenTypeOptions.find(d => d.value === anchorObj.burdenType),
        burden: get(anchorObj, 'burden', ''),
        isBurdenEnabled: get(anchorObj, 'isBurdenEnabled', false),
        isMarkupEnabled: get(anchorObj, 'isMarkupEnabled', false),
      })
    }
  }, [])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title={isEdit ? 'Edit Time & Materials' : 'Add Time & Materials'} style={{ width: '100%' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalAutoComplete
              onFocus={() => setErrors({ ...errors, timeMaterialCategoryType: null })}
              error={errors.timeMaterialCategoryType}
              placeholder='Select Category'
              value={get(timeMaterialsData, 'timeMaterialCategoryType', '')}
              onChange={val => handleInputChange('timeMaterialCategoryType', val)}
              options={timeCategoty}
              label='Category'
              w={100}
              isRequired
            />
            <MinimalInput onFocus={() => setErrors({ ...errors, itemCode: null })} error={errors.itemCode} value={get(timeMaterialsData, 'itemCode', '')} onChange={val => handleInputChange('itemCode', val)} placeholder='Enter Item Code' label='Item Code' w={100} isRequired />
            <MinimalTextArea value={get(timeMaterialsData, 'description', '')} onChange={e => handleInputChange('description', e.target.value)} placeholder='Add description...' label='Description' w={100} />
            <div className='d-flex align-items-center mt-2'>
              <Checkbox color='primary' size='small' checked={get(timeMaterialsData, 'noSubFlag', false)} style={{ padding: 0 }} onChange={e => handleInputChange('noSubFlag', e.target.checked)} />
              <div className='text-xs text-bold ml-2'>No sub?</div>
            </div>
            <div className='d-flex mt-2'>
              <MinimalInput onFocus={() => setErrors({ ...errors, quantity: null })} error={errors.quantity} value={get(timeMaterialsData, 'quantity', '')} onChange={val => handleInputChange('quantity', val)} placeholder='Enter Quantity' label='Quantity' w={50} isRequired type='number' />
              <MinimalAutoComplete onFocus={() => setErrors({ ...errors, quantityUnitType: null })} error={errors.quantityUnitType} placeholder='Select Unit' value={get(timeMaterialsData, 'quantityUnitType', null)} onChange={val => handleInputChange('quantityUnitType', val)} options={unitOptions} label='Unit' w={50} isRequired />
            </div>
            <MinimalInput onFocus={() => setErrors({ ...errors, rate: null })} error={errors.rate} value={get(timeMaterialsData, 'rate', '')} onChange={val => handleInputChange('rate', val)} placeholder='Enter Rate' label='Rate' w={100} isRequired type='number' hasSuffix suffix='$' />
            <div className='d-flex align-items-center my-2'>
              <Checkbox color='primary' size='small' checked={get(timeMaterialsData, 'isBurdenEnabled', false)} style={{ padding: 0 }} onChange={e => handleInputChange('isBurdenEnabled', e.target.checked)} />
              <div className='text-xs text-bold ml-2'>Add Burden</div>
            </div>
            {timeMaterialsData.isBurdenEnabled && (
              <div className='d-flex mt-2'>
                <MinimalInput onFocus={() => setErrors({ ...errors, burden: null })} error={errors.burden} value={get(timeMaterialsData, 'burden', '')} onChange={val => handleInputChange('burden', val)} placeholder='Enter Burden' label='Burden' w={50} type='number' />
                <MinimalAutoComplete placeholder='Select Burden Type' value={get(timeMaterialsData, 'burdenType', null)} onChange={val => handleInputChange('burdenType', val)} options={burdenTypeOptions} label='Burden Type' w={50} inputStyles={styles.burdenDrpInputStyle} />
              </div>
            )}
            <div className='d-flex align-items-center my-2'>
              <Checkbox color='primary' size='small' checked={get(timeMaterialsData, 'isMarkupEnabled', false)} style={{ padding: 0 }} onChange={e => handleInputChange('isMarkupEnabled', e.target.checked)} />
              <div className='text-xs text-bold ml-2'>Add Markup</div>
            </div>
            {timeMaterialsData.isMarkupEnabled && <MinimalInput onFocus={() => setErrors({ ...errors, markup: null })} error={errors.markup} value={get(timeMaterialsData, 'markup', '')} onChange={val => handleInputChange('markup', val)} placeholder='Enter Markup' label='Markup' w={100} hasSuffix suffix='%' type='number' />}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text={isEdit ? 'Update' : 'Add'} loadingText={isEdit ? 'Updating...' : 'Adding...'} onClick={validateForm} disabled={loading} loading={loading} />
      </div>
    </Drawer>
  )
}

export default AddTimeMaterials
