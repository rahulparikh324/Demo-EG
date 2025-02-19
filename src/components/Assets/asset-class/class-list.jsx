import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { history } from 'helpers/history'
import { get, isEmpty } from 'lodash'

import getAllAssetClass from 'Services/FormIO/getAllAssetClass'
import deleteAssetClass from 'Services/FormIO/delete-class'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import TablePagination from '@material-ui/core/TablePagination'
import AddIcon from '@material-ui/icons/Add'
import { MinimalButton, ActionButton } from 'components/common/buttons'

import { TableComponent } from 'components/common/table-components'
import AddClass from 'components/Assets/asset-class/add-class'
import SearchComponent from 'components/common/search'
import DialogPrompt from 'components/DialogPrompt'
import { Toast } from 'Snackbar/useToast'

const ClassList = () => {
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [isAddClassOpen, setAddClassOpen] = useState(false)
  const companyId = localStorage.getItem('companyId')
  const [searchString, setSearchString] = useState('')
  const [deleteClassOpen, setDeleteClassOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isEditOpen, setEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  //
  const payload = snakifyKeys({ pageIndex, companyId, searchString, pageSize })
  const { loading, data, reFetch } = useFetchData({ fetch: getAllAssetClass, payload, formatter: d => camelizeKeys(d) })

  //
  const columns = [
    { name: 'Asset Class Code', accessor: 'assetClassCode' },
    { name: 'Class Name', accessor: 'assetClassName' },
    {
      name: 'Default PM Plan',
      render: d => {
        const defaultPMs = get(d, 'pmplansList', []).find(def => def.isDefaultPmPlan === true)
        return get(defaultPMs, 'planName', 'N/A')
      },
    },
    { name: 'Asset Type', accessor: 'formTypeName' },
    { name: 'Expected Life', render: d => d.assetExpectedUsefullLife || 'N/A' },
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
    if (type === 'DELETE') setDeleteClassOpen(true)
    if (type === 'EDIT') setEditOpen(true)
  }
  const handleRowClick = d => history.push({ pathname: `asset-classes/${d.inspectiontemplateAssetClassId}`, search: `?asset-class-code=${d.assetClassCode}&pm-category-id=${d.pmCategoryId}` })
  //
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  //delete
  const deleteClass = async () => {
    const { inspectiontemplateAssetClassId } = anchorObj
    try {
      setDeleteLoading(true)
      const res = await deleteAssetClass(snakifyKeys({ inspectiontemplateAssetClassId }))
      if (res.success > 0) {
        Toast.success(`Class deleted successfully !`)
        reFetch()
      } else Toast.error(res.message || 'Something went wrong !')
      setDeleteLoading(false)
      setDeleteClassOpen(false)
    } catch (error) {
      setDeleteLoading(false)
      setDeleteClassOpen(false)
      Toast.error('Something went wrong !')
    }
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  return (
    <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
      <div style={{ height: '5vh' }} className={`d-flex justify-content-between align-items-center mb-2 ${!data?.data?.isAddAssetClassEnabled ? 'flex-row-reverse' : ''}`}>
        {data?.data?.isAddAssetClassEnabled && <MinimalButton size='small' startIcon={<AddIcon />} text='Add Asset Class' onClick={() => setAddClassOpen(true)} variant='contained' color='primary' />}
        <SearchComponent postClear={postSearch} postSearch={postSearch} setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '700px', height: '700px' }}>
        <TableComponent loading={loading} columns={columns} data={get(data, 'data.list', [])} onRowClick={handleRowClick} isForViewAction={true} />
      </div>
      {!isEmpty(get(data, 'data.list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'data.listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {isAddClassOpen && <AddClass reFetch={reFetch} open={isAddClassOpen} onClose={() => setAddClassOpen(false)} />}
      {isEditOpen && <AddClass obj={anchorObj} isEdit reFetch={reFetch} open={isEditOpen} onClose={() => setEditOpen(false)} />}
      <DialogPrompt title='Delete Class' text='Are you sure you want to delete the class ?' open={deleteClassOpen} ctaText='Delete' actionLoader={deleteLoading} action={deleteClass} handleClose={() => setDeleteClassOpen(false)} />
    </div>
  )
}

export default ClassList
