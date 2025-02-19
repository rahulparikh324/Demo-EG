import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import usePostData from 'hooks/post-data'
import enums from 'Constants/enums'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'
import { FormTitle } from 'components/Maintainance/components'
import { MinimalCheckbox } from 'components/common/others'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { snakifyKeys } from 'helpers/formatters'

const AddPM = ({ onClose, open, workOrderID, afterSubmit, asset, isForClass }) => {
  const [searchString, setSearchString] = useState('')
  const payload = isForClass ? { searchString, inspectiontemplateAssetClassId: asset.classId } : { searchString, assetId: asset.assetId }
  const { loading, data } = useFetchData({ fetch: isForClass ? preventativeMaintenance.asset.getPMsListByAssetClassId : preventativeMaintenance.asset.getPMsByAssetId, payload, formatter: d => get(d, 'data', []), defaultValue: [] })
  const [selected, setSelected] = useState([])
  const [isAllSelected, setAllSelected] = useState(false)
  //
  const selectAndDeSelectAll = selected => {
    if (selected) setSelected(data.map(d => d.pmId))
    else setSelected([])
    setAllSelected(p => !p)
  }
  const columns = [
    { name: 'PM Plan', accessor: 'planName' },
    { name: 'PM Item', accessor: 'title' },
    // { name: 'Form Name', accessor: 'assetPlanName' },
    { name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isAllSelected} onClick={() => selectAndDeSelectAll(!isAllSelected)} />, render: d => <RenderCheckBox data={d} accessor='pmId' selected={selected} handleChange={handleCheckBoxChange} /> },
  ]
  //
  const handleCheckBoxChange = data => {
    if (selected.includes(data.pmId)) setSelected(p => p.filter(d => d !== data.pmId))
    else setSelected(p => [...p, data.pmId])
  }
  const postError = () => {
    onClose()
  }
  const postSuccess = d => {
    const location = {
      building: get(asset, 'building', '') || get(asset, 'formioBuildingName', ''),
      floor: get(asset, 'floor', '') || get(asset, 'formioFloorName', ''),
      room: get(asset, 'room', '') || get(asset, 'formioRoomName', ''),
      section: get(asset, 'section', '') || get(asset, 'formioSectionName', ''),
    }
    const lineList = isForClass ? get(d, 'data.wolinePMlist', []) : get(d, 'data.pmWolineList', [])
    const list = lineList.map(d => ({ ...d, inspectionType: enums.MWO_INSPECTION_TYPES.PM, canBeSkipped: true, ...location }))
    onClose()
    afterSubmit(snakifyKeys(list))
  }
  const { loading: isProcessing, mutate: addLine } = usePostData({ executer: isForClass ? preventativeMaintenance.workOrder.addPmToNewLine : preventativeMaintenance.workOrder.manuallyAssignPm, postError, postSuccess, message: { success: 'PM added successfully !', error: 'Error adding PM, Please Try again' } })
  const assign = async () => {
    const payload = { pmIds: selected, woId: workOrderID }
    if (isForClass) payload.woonboardingassetsId = asset.woonboardingassetsId
    else payload.assetId = asset.assetId
    addLine(payload)
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add PM' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 176px)', background: '#fff', padding: '16px', width: '85vw' }}>
        <div className='d-flex justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
          <div className='text-bold'>{get(asset, 'name', '')}</div>
          <SearchComponent placeholder='Search PMs' setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 80px)' }}>
          <TableComponent loading={loading} columns={columns} data={data} />
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Assign' loadingText='Assigning...' loading={isProcessing} disabled={isProcessing || isEmpty(selected)} onClick={assign} />
      </div>
    </Drawer>
  )
}
export default AddPM
