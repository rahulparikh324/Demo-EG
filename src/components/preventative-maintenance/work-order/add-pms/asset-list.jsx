import React, { useState } from 'react'

import TablePagination from '@material-ui/core/TablePagination'
import FilterListOutlinedIcon from '@material-ui/icons/FilterListOutlined'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import AddIcon from '@material-ui/icons/Add'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import { snakifyKeys, camelizeKeys } from 'helpers/formatters'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { MinimalCheckbox, ElipsisWithTootip } from 'components/common/others'
import { MinimalAutoComplete } from 'components/Assets/components'
import AddPM from 'components/preventative-maintenance/work-order/add-pms/pm-list'
import Install from 'components/WorkOrders/maintenance-forms/install'

import getAllAsset from 'Services/Asset/getAllAssetAndFilter'
import assetClass from 'Services/WorkOrder/asset-class'

const AssetList = ({ onClose, workOrderID, afterSubmit, classCodeOptions }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchString, setSearchString] = useState('')
  const [selectedAsset, setSelectedAsset] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [options, setOptions] = useState({})
  const [filterPayload, setFilterPayload] = useState({ formiobuildingId: [], formiofloorId: [], formioroomId: [], formiosectionId: [], inspectiontemplateAssetClassId: [] })
  const [filters, setFilters] = useState({})
  const [showPMs, setShowPMs] = useState(false)
  const [showPmsForClass, setShowPmsForClass] = useState(false)
  const [installedAsset, setInstalledAsset] = useState({})
  const [isInstallDrawerOpen, setInstallDrawerOpen] = useState(false)
  //
  const formatData = d => {
    const data = camelizeKeys(d)
    setSelectedAsset({})
    return data
  }
  const formatClassOptions = data => {
    const list = data.map(d => ({ ...d, label: d.className, code: d.label }))
    const classes = list.map(d => ({ ...d, label: d.className }))
    setOptions({ classes, codes: list })
  }
  const payload = { pagesize: pageSize, pageindex: pageIndex, searchString, ...filterPayload }
  const { loading, data } = useFetchData({ fetch: getAllAsset, payload: snakifyKeys(payload), formatter: d => formatData(d), defaultValue: {} })
  const { loading: classOptionsLoading } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => formatClassOptions(get(d, 'data', [])), defaultValue: [] })
  //
  const columns = [
    { name: 'Asset Name', render: d => <ElipsisWithTootip title={get(d, 'name', '') || ''} size={40} /> },
    { name: 'Asset Class', render: d => <ElipsisWithTootip title={get(d, 'assetClassName', '') || ''} size={30} /> },
    { name: 'Class Code', render: d => <ElipsisWithTootip title={get(d, 'assetClassCode', '') || ''} size={30} /> },
    { name: 'Action', render: d => <MinimalCheckbox selected={selectedAsset.assetId === d.assetId} onClick={() => setSelectedAsset(d)} type='radio' style={{ padding: '2px 0' }} /> },
  ]
  // handle pagination & filter
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  // filters
  const handleChangeInFilter = (key, value) => {
    if (['code', 'class'].includes(key)) setFilters({ ...filters, class: !isEmpty(value) ? { ...value, label: value.className } : value, code: !isEmpty(value) ? { ...value, label: value.code } : value })
    else setFilters({ ...filters, [key]: value })
    updatePayload(key, value)
  }
  const updatePayload = (key, value) => {
    const obj = { ...filterPayload }
    if (['code', 'class'].includes(key)) obj.inspectiontemplateAssetClassId = isEmpty(value) ? [] : [value.value]
    if (key === 'building') obj.formiobuildingId = isEmpty(value) ? [] : [value.value]
    if (key === 'floor') obj.formiofloorId = isEmpty(value) ? [] : [value.value]
    if (key === 'room') obj.formioroomId = isEmpty(value) ? [] : [value.value]
    if (key === 'section') obj.formiosectionId = isEmpty(value) ? [] : [value.value]
    setFilterPayload(obj)
  }
  const resetFilter = () => {
    setFilters({})
    setFilterPayload({ formiobuildingId: [], formiofloorId: [], formioroomId: [], formiosectionId: [], inspectiontemplateAssetClassId: [], pageindex: 1 })
  }
  const postSubmit = d => {
    setInstalledAsset(d)
    setShowPmsForClass(true)
  }
  return (
    <>
      <div style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 176px)', background: '#fff', padding: '0 16px 16px 16px', width: '85vw' }}>
        <div className='d-flex justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
          <div>
            <MinimalButton text='Create New' onClick={() => setInstallDrawerOpen(true)} size='small' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' />
          </div>
          <div className='d-flex flex-row-reverse align-items-center'>
            <MinimalButton text='Reset Filter' onClick={resetFilter} disabled={isEmpty(filters)} size='small' startIcon={<RotateLeftSharpIcon fontSize='small' />} variant='contained' color='primary' />
            <ActionButton action={() => setShowFilter(!showFilter)} icon={<FilterListOutlinedIcon fontSize='inherit' />} tooltip='' style={{ padding: '6px', color: 'white', backgroundColor: '#778899', borderRadius: '4px', marginRight: '4px' }} />
            <SearchComponent postClear={postSearch} postSearch={postSearch} placeholder='Search Assets' setSearchString={setSearchString} />
          </div>
        </div>
        {showFilter && (
          <div className='d-flex my-2' style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '4px' }}>
            <MinimalAutoComplete w={32} value={get(filters, 'code', null)} placeholder='Class Code' label='Class Code' isClearable baseStyles={{ zIndex: '6' }} options={get(options, 'codes', [])} onChange={val => handleChangeInFilter('code', val)} isLoading={classOptionsLoading} />
            <MinimalAutoComplete w={32} value={get(filters, 'class', null)} placeholder='Class Name' label='Class Name' isClearable baseStyles={{ zIndex: '6' }} options={get(options, 'classes', [])} onChange={val => handleChangeInFilter('class', val)} isLoading={classOptionsLoading} />
            <MinimalAutoComplete w={32} value={get(filters, 'building', null)} placeholder='Building' label='Building' isClearable baseStyles={{ zIndex: '6' }} options={get(data, 'filterassetbuildingbocationoptions.buildings', [])} onChange={val => handleChangeInFilter('building', val)} />
            <MinimalAutoComplete w={32} value={get(filters, 'floor', null)} placeholder='Floor' label='Floor' isClearable baseStyles={{ zIndex: '6' }} options={get(data, 'filterassetbuildingbocationoptions.floors', [])} onChange={val => handleChangeInFilter('floor', val)} />
            <MinimalAutoComplete w={32} value={get(filters, 'room', null)} placeholder='Room' label='Room' isClearable baseStyles={{ zIndex: '6' }} options={get(data, 'filterassetbuildingbocationoptions.rooms', [])} onChange={val => handleChangeInFilter('room', val)} />
            <MinimalAutoComplete w={32} value={get(filters, 'section', null)} placeholder='Section' label='Section' isClearable baseStyles={{ zIndex: '6' }} options={get(data, 'filterassetbuildingbocationoptions.sections', [])} onChange={val => handleChangeInFilter('section', val)} />
          </div>
        )}
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - ${showFilter ? '200px ' : '80px'})` }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Next' onClick={() => setShowPMs(true)} disabled={isEmpty(selectedAsset)} />
      </div>
      {showPMs && <AddPM asset={selectedAsset} open={showPMs} onClose={onClose} workOrderID={workOrderID} afterSubmit={afterSubmit} />}
      {showPmsForClass && <AddPM asset={installedAsset} open={showPmsForClass} onClose={onClose} workOrderID={workOrderID} afterSubmit={afterSubmit} isForClass />}
      {isInstallDrawerOpen && <Install classCodeOptions={classCodeOptions} isOnboarding isNew isInstalling viewObj={{}} open={isInstallDrawerOpen} onClose={() => setInstallDrawerOpen(false)} afterSubmit={postSubmit} workOrderID={workOrderID} />}
    </>
  )
}

export default AssetList
