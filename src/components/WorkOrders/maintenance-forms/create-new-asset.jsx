import React, { useState } from 'react'

import { MinimalAutoComplete, MinimalInput } from 'components/Assets/components'
import { PopupModal } from 'components/common/others'

import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import enums from 'Constants/enums'

import { validate } from './utils'
import { get } from 'lodash'
import { Toast } from 'Snackbar/useToast'

import assetClass from 'Services/WorkOrder/asset-class'
import useFetchData from 'hooks/fetch-data'

const CreateNewAsset = ({ open, onClose, obj, afterSubmit, openForm }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [assetClassCode, setClassCode] = useState(null)
  const [error, setError] = useState({})
  const { woType, woId } = camelizeKeys(obj)
  const formatData = d => {
    const data = camelizeKeys(d)
    const list = get(data, 'data', []).map(d => ({ ...d, label: d.assetClassName, value: d.inspectiontemplateAssetClassId }))
    return list
  }
  const { data } = useFetchData({ fetch: assetClass.getAllAssetClassToAdd, payload: snakifyKeys({ woType }), formatter: d => formatData(d) })
  //
  const validateForm = async () => {
    const isValid = await validate({ assetName, assetClassCode: get(assetClassCode, 'label', '') }, true, false, false, true)
    setError(isValid)
    if (isValid === true) submitData()
  }
  const submitData = async () => {
    setIsCreating(true)
    try {
      const res = await assetClass.assignAssetClassToWorkOrder(snakifyKeys({ ...assetClassCode, woId, woType, assetName, assetId: null }))
      if (res.success > 0) {
        Toast.success(`New Asset Created Successfully !`)
        onClose()
        afterSubmit()
        openForm('EDIT_MW', { ...res.data, inspection_type: enums.MWO_INSPECTION_TYPES.INSPECTION })
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error creating Asset. Please try again !`)
    }
    setIsCreating(false)
  }
  return (
    <PopupModal open={open} onClose={onClose} title='Create New Asset' loading={isCreating} handleSubmit={validateForm} cta='Create' loadingText='Creating...'>
      <MinimalInput value={assetName} onChange={setAssetName} label='Asset Name' placeholder='Add Asset Name' w={100} error={error.assetName} onFocus={() => setError({ ...error, assetName: null })} />
      <MinimalAutoComplete placeholder='Select Class' value={assetClassCode} onChange={v => setClassCode(v)} options={data} label='Asset Class' isClearable w={100} error={error.assetClassCode} onFocus={() => setError({ ...error, assetClassCode: null })} />
    </PopupModal>
  )
}

export default CreateNewAsset
