import React, { useState } from 'react'
import useFetchData from 'hooks/fetch-data'

import { MinimalAutoComplete, MinimalInput } from 'components/Assets/components'
import { FloatingButton } from 'components/common/buttons'
import { PopupModal } from 'components/common/others'

import AddIcon from '@material-ui/icons/Add'

// import { snakifyKeys, camelizeKeys } from 'helpers/formatters'
// import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import assetClass from 'Services/WorkOrder/asset-class'
import { get, isEmpty, orderBy } from 'lodash'
import { validate } from 'components/WorkOrders/onboarding/utils'

export const SelectOrCreateAsset = ({ asset, setAsset, onFocus, loading, options = [] }) => {
  const sortClassCodes = d => {
    const list = get(d, 'data', {})
    const sortedList = orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [assetClassCode, setClassCode] = useState(null)
  const [error, setError] = useState({})
  //
  const validateForm = async () => {
    const isValid = await validate({ assetName, assetClassCode: get(assetClassCode, 'label', '') })
    setError(isValid)
    // if (isValid === true) submitData()
  }
  //
  return (
    <div className='d-flex justify-content-center align-items-center' style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
      <MinimalAutoComplete loading={loading} value={asset} onChange={v => setAsset(v)} options={options} label='Asset Name' placeholder='Add Asset Name' w={97} baseStyles={{ marginBottom: 0 }} error={error} isClearable onFocus={onFocus} isRequired />
      <FloatingButton onClick={() => setOpen(true)} icon={<AddIcon fontSize='small' />} style={{ width: '42px', height: '42px', marginTop: '18px', borderRadius: '8px' }} />
      {open && (
        <PopupModal open={open} onClose={() => setOpen(false)} title='Create New Asset' loading={isCreating} handleSubmit={() => {}} cta='Create'>
          <MinimalInput
            //
            error={error.assetName}
            onFocus={() => setError({ ...error, assetName: null })}
            value={assetName}
            onChange={setAssetName}
            label='Asset Name'
            placeholder='Add Asset Name'
            w={100}
          />
          <MinimalAutoComplete
            //
            error={error.assetClassCode}
            onFocus={() => setError({ ...error, assetClassCode: null })}
            placeholder='Select Class Code'
            value={assetClassCode}
            onChange={v => setClassCode(v)}
            options={classCodeOptions}
            label='Asset Class Code'
            isClearable
            w={100}
          />
        </PopupModal>
      )}
    </div>
  )
}
