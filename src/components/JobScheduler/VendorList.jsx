import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import AddOutlined from '@material-ui/icons/AddOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'

import TablePagination from '@material-ui/core/TablePagination'
import { ActionButton } from 'components/common/buttons'

import useFetchData from 'hooks/fetch-data'
import { TableComponent } from 'components/common/table-components'

import { get, isEmpty } from 'lodash'
import { snakifyKeys } from 'helpers/formatters'
import SearchComponent from 'components/common/search'
import AddVendor from './AddVendor'
import DialogPrompt from 'components/DialogPrompt'
import { vendorCategoryOptions } from 'components/preventative-maintenance/common/utils'
import { Toast } from 'Snackbar/useToast'
import { history } from 'helpers/history'
import jobScheduler from 'Services/jobScheduler'
import { FilterPopup } from 'components/common/others'

const VendorList = () => {
  const [searchString, setSearchString] = useState(get(history, 'location.state.search', ''))
  const [page, setPage] = useState(get(history, 'location.state.pageIndex', 1) - 1)
  const [pageSize, setPageSize] = useState(get(history, 'location.state.pageRows', 20))
  const [pageIndex, setPageIndex] = useState(get(history, 'location.state.pageIndex', 1))
  const [categoryType, setCategoryType] = useState(get(history, 'location.state.filter', {}))

  const [addVendorOpen, setAddVendorOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteVendorOpen, setDeleteVendorOpen] = useState(false)
  const [isEditOpen, setEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})

  const payload = { pagesize: pageSize, pageindex: pageIndex, search_string: searchString, vendor_category_ids: categoryType.value ? [categoryType.value] : null }
  const { loading, data: vendorData, reFetch } = useFetchData({ fetch: jobScheduler.getFilterVendorList, payload, formatter: d => get(d, 'data', []) })

  const columns = [
    { name: 'Vendor Name', accessor: 'vendorName' },
    { name: 'Email', accessor: 'vendorEmail' },
    { name: 'Phone Number', accessor: 'vendorPhoneNumber' },
    {
      name: 'Category',
      render: d => {
        const vendorData = vendorCategoryOptions.find(id => id.value === get(d, 'vendorCategoryId', null))
        return get(vendorData, 'label', 'N/A')
      },
    },
    { name: 'Address', accessor: 'vendorAddress' },
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
    if (type === 'DELETE') setDeleteVendorOpen(true)
    if (type === 'EDIT') setEditOpen(true)
  }

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

  const handleVendorView = data => {
    history.push({ pathname: `/vendors/details/${data.vendorId}`, state: { filter: categoryType, pageRows: pageSize, search: searchString, pageIndex } })
  }

  const deleteVendor = async () => {
    const { vendorId } = anchorObj
    try {
      setDeleteLoading(true)
      const res = await jobScheduler.addUpdateVendor(snakifyKeys({ vendorId, isDeleted: true }))
      if (res.success > 0) {
        Toast.success(`Vendor deleted successfully !`)
        reFetch()
      } else Toast.error(res.message || 'Something went wrong !')
      setDeleteLoading(false)
      setDeleteVendorOpen(false)
    } catch (error) {
      setDeleteLoading(false)
      setDeleteVendorOpen(false)
      Toast.error('Something went wrong !')
    }
  }

  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)', padding: '20px' }}>
      <div className='d-flex justify-content-between align-items-center' style={{ width: '100%', marginBottom: '20px' }}>
        <div className='d-flex align-items-center'>
          <Button size='small' onClick={() => setAddVendorOpen(true)} startIcon={<AddOutlined />} variant='contained' color='primary' className='nf-buttons mr-2' disableElevation>
            Add Vendor
          </Button>
          <div style={{ margin: '1px 0 0 7px' }}>
            <FilterPopup selected={categoryType} onChange={d => setCategoryType(d)} onClear={() => setCategoryType({})} placeholder='Category Type' options={vendorCategoryOptions} />
          </div>
        </div>
        <SearchComponent placeholder='Search' postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 115px)' }}>
        <TableComponent loading={loading} columns={columns} data={get(vendorData, 'vendorsList', [])} isForViewAction={true} onRowClick={d => handleVendorView(d)} />
      </div>
      {!isEmpty(get(vendorData, 'vendorsList', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(vendorData, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {addVendorOpen && <AddVendor reFetch={reFetch} open={addVendorOpen} onClose={() => setAddVendorOpen(false)} />}
      {isEditOpen && <AddVendor obj={anchorObj} isEdit reFetch={reFetch} open={isEditOpen} onClose={() => setEditOpen(false)} />}
      <DialogPrompt title='Delete Vendor' text='Are you sure you want to delete the vendor ?' open={deleteVendorOpen} ctaText='Delete' actionLoader={deleteLoading} action={deleteVendor} handleClose={() => setDeleteVendorOpen(false)} />
    </div>
  )
}

export default VendorList
