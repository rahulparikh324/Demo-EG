import React, { useState, useEffect } from 'react'
import { MinimalAutoComplete, MinimalInput } from 'components/Assets/components'
import { PopupModal } from 'components/common/others'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { validateAddAsset } from './utils'
import { get, isEmpty } from 'lodash'
import { Toast } from 'Snackbar/useToast'

import assetClass from 'Services/WorkOrder/asset-class'
import useFetchData from 'hooks/fetch-data'

const AddAssetClass = ({ open, onClose, afterSubmit, obj }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [assetClassCode, setClassCode] = useState(null)
  const [error, setError] = useState({})
  const [groupString, setgroupString] = useState('')
  const { woType, woId } = camelizeKeys(obj)
  const { data } = useFetchData({ fetch: assetClass.getAllAssetClassToAdd, payload: snakifyKeys({ woType }), formatter: d => camelizeKeys(d) })
  const [formList, setFormList] = useState([])

  const genrateLabelData = () => {
    const WithoutLabelData = get(data, 'data', [])
    const withLableData = WithoutLabelData.map(item => ({ ...item, label: item.assetClassName, value: item.inspectiontemplateAssetClassId }))
    setFormList(withLableData)
  }

  useEffect(() => {
    if (!isEmpty(data)) genrateLabelData()
  }, [data])

  const validateForm = async () => {
    const isValid = await validateAddAsset({ groupString, assetClassCode: get(assetClassCode, 'label', '') })
    setError(isValid)
    if (isValid === true) submitData(assetClassCode)
  }

  const submitData = async ({ inspectiontemplateAssetClassId, formId }) => {
    try {
      setIsCreating(true)
      const res = await assetClass.assignAssetClassToWorkOrder(snakifyKeys({ inspectiontemplateAssetClassId, formId, woId, woType, assetId: null, groupString }))
      if (res.success > 0) Toast.success('Form Added successfully !')
      else Toast.error(res.message)
      onClose()
      afterSubmit()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setIsCreating(false)
  }

  return (
    <PopupModal open={open} onClose={onClose} title='Add Asset Class' loading={isCreating} handleSubmit={validateForm} cta='Assign' loadingText='Assigning...'>
      <MinimalInput value={groupString} onChange={setgroupString} label='Testing Group Name' placeholder='Add Testing Group Name' w={100} error={error.groupString} onFocus={() => setError({ ...error, groupString: null })} />
      <MinimalAutoComplete placeholder='Select Class' value={assetClassCode} onChange={v => setClassCode(v)} options={formList} label='Asset Class' isClearable w={100} error={error.assetClassCode} onFocus={() => setError({ ...error, assetClassCode: null })} />
    </PopupModal>
  )
}

export default AddAssetClass
