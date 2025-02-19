import React, { useState, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import { camelizeKeys } from 'helpers/formatters'
import enums from 'Constants/enums'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'
import { MinimalCheckbox, ElipsisWithTootip } from 'components/common/others'
import AddPM from 'components/preventative-maintenance/work-order/add-pms/pm-list'

import viewWorkOrderDetailsById from 'Services/WorkOrder/viewWorkOrderDetailsById'

const TempAssets = ({ onClose, workOrderID, afterSubmit }) => {
  const [searchString, setSearchString] = useState('')
  const [selectedAsset, setSelectedAsset] = useState('')
  const [showPMs, setShowPMs] = useState(false)
  const [data, setData] = useState([])
  //
  const formatData = data =>
    get(data, 'data.mwoObAssets', [])
      .filter(d => d.inspectionType === enums.MWO_INSPECTION_TYPES.INSTALL)
      .map(d => ({ ...d, classId: d.inspectiontemplateAssetClassId }))
  const { loading, data: list } = useFetchData({ fetch: viewWorkOrderDetailsById, payload: workOrderID, formatter: d => formatData(camelizeKeys(d)), defaultValue: [] })
  //
  const columns = [
    { name: 'Asset Name', render: d => <ElipsisWithTootip title={get(d, 'assetName', '') || ''} size={35} /> },
    { name: 'Asset Class', render: d => <ElipsisWithTootip title={get(d, 'assetClassName', '') || ''} size={35} /> },
    { name: 'Class Code', render: d => <ElipsisWithTootip title={get(d, 'assetClassCode', '') || ''} size={35} /> },
    { name: 'Action', render: d => <MinimalCheckbox selected={selectedAsset.woonboardingassetsId === d.woonboardingassetsId} onClick={() => setSelectedAsset(d)} type='radio' style={{ padding: '2px 0' }} /> },
  ]
  useEffect(() => {
    let filteredAssets = [...list]
    if (!isEmpty(searchString))
      filteredAssets = filteredAssets.filter(x => (x.assetName !== null && x.assetName.toLowerCase().includes(searchString.toLowerCase())) || (x.assetClassName !== null && x.assetClassName.toLowerCase().includes(searchString.toLowerCase())) || (x.assetClassCode !== null && x.assetClassCode.toLowerCase().includes(searchString.toLowerCase())))
    setData(filteredAssets)
  }, [searchString, loading, list])

  return (
    <>
      <div style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 176px)', background: '#fff', padding: '0 16px 16px 16px', width: '85vw' }}>
        <div className='d-flex flex-row-reverse align-items-center mb-2'>
          <SearchComponent placeholder='Search Assets' setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - 80px)` }}>
          <TableComponent loading={loading} columns={columns} data={data} />
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Next' onClick={() => setShowPMs(true)} disabled={isEmpty(selectedAsset)} />
      </div>
      {showPMs && <AddPM asset={selectedAsset} open={showPMs} onClose={onClose} workOrderID={workOrderID} afterSubmit={afterSubmit} isForClass />}
    </>
  )
}

export default TempAssets
