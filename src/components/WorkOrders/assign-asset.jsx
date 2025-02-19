import React, { useState, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'

import assetClass from 'Services/WorkOrder/asset-class'
import enums from 'Constants/enums'

import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import { TableComponent } from 'components/common/table-components'
import SearchComponent from 'components/common/search'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { Toast } from 'Snackbar/useToast'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { PopupModal } from 'components/common/others'
import AddIcon from '@material-ui/icons/Add'

const AssignAsset = ({ open, onClose, afterSubmit, obj, openCreateNew }) => {
  const { woType, woId } = camelizeKeys(obj)
  const format = data => {
    const mainList = get(data, 'data.mainAssetList', []) || []
    const obList = get(data, 'data.obWoAssetList', []) || []
    const mainOpts = mainList.map(asset => ({ ...asset, label: asset.name, value: asset.assetId }))
    const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
    const options = [...mainOpts, ...obOpts]
    return options
  }
  const [searchString, setSearchString] = useState('')
  const { loading, data } = useFetchData({ fetch: assetClass.getAssetsToAssignInMWOInspection, payload: snakifyKeys({ woType, woId }), formatter: d => format(camelizeKeys(d)) })
  const [formList, setFormList] = useState(get(data, 'data', []))
  const [selected, setSelected] = useState([])
  const [isAssigning, setIsAssigning] = useState(false)

  const [isWarningPopupOpen, setWarningPopupOpen] = useState(false)
  //
  const handleCheckBoxChange = data => {
    if (selected.includes(data.assetId)) setSelected(p => p.filter(d => d !== data.assetId))
    else setSelected(p => [...p, data.assetId])
  }
  const columns = [
    { name: 'Asset Name', accessor: 'label' },
    { name: 'Asset Class', accessor: 'assetClassName' },
    { name: 'Form Name', accessor: 'formName' },
    { name: 'Action', render: d => <RenderCheckBox data={d} /> },
  ]
  const RenderCheckBox = ({ data }) => {
    if (selected.includes(data.assetId)) return <ActionButton tooltip='DESELECT' icon={<CheckCircleIcon fontSize='small' />} action={e => handleCheckBoxChange(data)} />
    return <ActionButton tooltip='SELECT' icon={<RadioButtonUncheckedIcon fontSize='small' />} action={e => handleCheckBoxChange(data)} />
  }
  useEffect(() => {
    if (!isEmpty(data)) setFormList(data)
  }, [data])
  useEffect(() => {
    if (!isEmpty(data)) {
      const list = [...data]
      if (isEmpty(searchString)) setFormList(list)
      else {
        const filteredList = list.filter(l => (l.formName && l.formName.toLowerCase().includes(searchString.toLowerCase())) || (l.assetClassName && l.assetClassName.toLowerCase().includes(searchString.toLowerCase())) || (l.name && l.name.toLowerCase().includes(searchString.toLowerCase())))
        setFormList(filteredList)
      }
    }
  }, [searchString, data])
  //
  const submit = async () => {
    try {
      const assignInspectionAssetClassList = []
      data.forEach(({ inspectiontemplateAssetClassId, formId, assetId }) => {
        if (selected.includes(assetId)) assignInspectionAssetClassList.push({ inspectiontemplateAssetClassId, formId, woId, woType, assetId, inspectionType: enums.MWO_INSPECTION_TYPES.INSPECTION, woObAssetId: null, newCreateAssetName: null })
      })
      setIsAssigning(true)
      const res = await assetClass.assignMultipleAssetToInspection(snakifyKeys({ assignInspectionAssetClassList, woId }))
      if (res.success > 0) Toast.success('Assets Added successfully !')
      else Toast.error(res.message)
      setIsAssigning(false)
      onClose()
      afterSubmit()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  //
  const proceedToCreateNew = () => {
    setWarningPopupOpen(false)
    onClose()
    openCreateNew()
  }
  const handleCreateNew = () => {
    if (!isEmpty(selected)) setWarningPopupOpen(true)
    else proceedToCreateNew()
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title='Add Asset' closeFunc={onClose} style={{ width: '100%' }} />
      <div style={{ height: 'calc(100vh - 65px)', width: '700px' }}>
        <div className='d-flex justify-content-between align-items-center py-3 px-2'>
          <MinimalButton startIcon={<AddIcon />} variant='contained' color='primary' size='small' text='Create New' onClick={handleCreateNew} />
          <SearchComponent setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll px-2' id='style-1' style={{ height: 'calc(100% - 125px)' }}>
          <TableComponent loading={loading} columns={columns} data={formList} />
        </div>
        <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
          <MinimalButton variant='contained' color='primary' text='Assign' loadingText='Assigning...' onClick={submit} loading={isAssigning} disabled={isAssigning || isEmpty(selected)} />
        </div>
      </div>
      {isWarningPopupOpen && (
        <PopupModal open={isWarningPopupOpen} onClose={() => setWarningPopupOpen(false)} cta='Proceed' title='Warning' handleSubmit={proceedToCreateNew}>
          By creating new asset, all the selected asset will be discarded <br />
          Are you sure, you want to proceed ?
        </PopupModal>
      )}
    </Drawer>
  )
}

export default AssignAsset
