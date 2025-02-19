import React, { useState } from 'react'
import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import { MinimalButton, ActionButton } from 'components/common/buttons'
import { TableComponent } from 'components/common/table-components'
import { MinimalFilterSelector } from 'components/Assets/components'

import SearchComponent from 'components/common/search'
import { StatusComponent } from 'components/common/others'
import DialogPrompt from 'components/DialogPrompt'

import AddIcon from '@material-ui/icons/Add'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import TablePagination from '@material-ui/core/TablePagination'

import equipments from 'Services/equipments'

import { getChip, equipmentOptions } from './utils'
import { getFormatedDate } from 'helpers/getDateTime'
import { get, isEmpty } from 'lodash'

import ViewEquipment from 'components/equipments/view'
// import AddEquipment from 'components/Equipments/add'
import AddEquipment from 'components/equipments/add'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const Equipments = () => {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [isAddOpen, setAddOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [deleteEquipmentOpen, setDeleteEquipmentOpen] = useState(false)
  const [isEditOpen, setEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [statusFilter, setStatusFilter] = useState([])
  const [isViewOpen, setViewOpen] = useState(false)
  const [equipmentNumber, setEquipmentNumber] = useState(null)
  const [manufacturer, setManufacturer] = useState(null)
  const [modelNumber, setModelNumber] = useState(null)

  const payload = {
    pageSize,
    pageIndex,
    siteId: getApplicationStorageItem('siteId'),
    searchString,
    equipmentNumber: !isEmpty(equipmentNumber) ? [equipmentNumber.label] : [],
    manufacturer: !isEmpty(manufacturer) ? [manufacturer.label] : [],
    modelNumber: !isEmpty(modelNumber) ? [modelNumber.label] : [],
    calibrationStatus: !isEmpty(statusFilter) ? [statusFilter.value] : [],
  }
  const { loading, data, reFetch } = useFetchData({ fetch: equipments.getAllEquipmentList, payload })

  const formatOptions = d => {
    const options = {
      ...d,
      equipmentNumber: get(d, 'equipmentNumber', []).map(q => ({ label: q, value: q })),
      manufacturer: get(d, 'manufacturer', []).map(q => ({ label: q, value: q })),
      modelNumber: get(d, 'modelNumber', []).map(q => ({ label: q, value: q })),
      calibrationStatus: get(d, 'calibrationStatus', []).map(q => ({ label: q === 1 ? 'Calibrated' : q === 2 ? 'Not Calibrated' : q === 3 ? 'N/A' : '', value: q })),
    }
    return options
  }
  // const { data: filterData } = useFetchData({ fetch: equipments.filterAttributesEquipment, formatter: d => formatOptions(get(d, 'data', {})), defaultValue: {} })
  const columns = [
    {
      name: 'ID#',
      accessor: 'equipmentNumber',
      // filter: () => <MinimalFilterSelector options={get(filterData, 'equipmentNumber', [])} value={equipmentNumber} onChange={d => setEquipmentNumber(d)} placeholder='ID' w={100} isClearable baseStyles={{ marginTop: '6px' }} />,
    },
    { name: 'Name', accessor: 'equipmentName' },
    {
      name: 'Manufacturer ',
      accessor: 'manufacturer',
      // filter: () => <MinimalFilterSelector options={get(filterData, 'manufacturer', [])} value={manufacturer} onChange={d => setManufacturer(d)} placeholder='Manufacturer' w={100} isClearable baseStyles={{ marginTop: '6px' }} />,
    },
    {
      name: 'Model Number',
      accessor: 'modelNumber',
      // filter: () => <MinimalFilterSelector options={get(filterData, 'modelNumber', [])} value={modelNumber} onChange={d => setModelNumber(d)} placeholder='Model' w={100} isClearable baseStyles={{ marginTop: '6px' }} />,
    },
    { name: 'Serial Number', accessor: 'serialNumber' },
    { name: 'Calibration Interval', render: d => d.calibrationInterval },
    { name: 'Calibration Date', render: d => getFormatedDate(d.calibrationDate.split('T')[0]) },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.calibrationStatus, equipmentOptions)
        if (label === 'N/A') return 'N/A'
        return <StatusComponent color={color} label={label} size='small' />
      },
      // filter: () => <MinimalFilterSelector options={get(filterData, 'calibrationStatus', [])} value={statusFilter} onChange={d => setStatusFilter(d)} placeholder='Status' w={100} isClearable baseStyles={{ marginTop: '6px' }} />,
    },

    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton action={e => handleAction(e, 'EDIT', d)} icon={<EditOutlinedIcon fontSize='small' />} tooltip='EDIT' />
          <ActionButton action={e => handleAction(e, 'DELETE', d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} tooltip='DELETE' />
        </div>
      ),
    },
  ]

  const handleAction = async (event, type, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    if (type === 'DELETE') setDeleteEquipmentOpen(true)
    if (type === 'EDIT') setEditOpen(true)
  }
  const handleChangePage = (e, newPage) => {
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

  const postSuccess = () => {
    reFetch()
    setDeleteEquipmentOpen(false)
  }
  const { loading: deleteLoading, mutate: deleteEquipment } = usePostData({ executer: equipments.deleteEquipment, postSuccess, message: { success: 'Equipment deleted successfully !', error: 'Something went wrong !' } })

  const handleDeleteEquipment = () => deleteEquipment(anchorObj.equipmentId)

  const onView = data => {
    setAnchorObj(data)
    setViewOpen(true)
  }

  return (
    <div style={{ height: '92vh', padding: '20px', background: '#fff' }}>
      <div style={{ height: '5vh' }} className='d-flex justify-content-between align-items-center mb-2'>
        <MinimalButton size='small' startIcon={<AddIcon />} text='Create Equipment' onClick={() => setAddOpen(true)} variant='contained' color='primary' />
        <SearchComponent postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '77vh', height: '700px' }}>
        <TableComponent loading={loading} columns={columns} data={get(data, 'data.list', [])} onRowClick={d => onView(d)} isForViewAction={true} />
      </div>
      {!isEmpty(get(data, 'data.list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'data.listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {isAddOpen && <AddEquipment reFetch={reFetch} open={isAddOpen} onClose={() => setAddOpen(false)} />}
      {isEditOpen && <AddEquipment obj={anchorObj} isEdit reFetch={reFetch} open={isEditOpen} onClose={() => setEditOpen(false)} />}
      {isViewOpen && <ViewEquipment open={isViewOpen} onClose={() => setViewOpen(false)} obj={anchorObj} />}
      <DialogPrompt title='Delete Equipment' text='Are you sure you want to delete this equipment?' open={deleteEquipmentOpen} ctaText='Delete' actionLoader={deleteLoading} action={handleDeleteEquipment} handleClose={() => setDeleteEquipmentOpen(false)} />
    </div>
  )
}

export default Equipments
