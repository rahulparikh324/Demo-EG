import React, { useState, useEffect, useContext } from 'react'

import AddIcon from '@material-ui/icons/Add'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import TablePagination from '@material-ui/core/TablePagination'
import CircularProgress from '@material-ui/core/CircularProgress'

import getAllForm from 'Services/FormIO/getAllForm'
import deleteForm from 'Services/FormIO/deleteForm'
import getFormJson from 'Services/FormIO/get-form-json'

import { isEmpty } from 'lodash'
import { history } from 'helpers/history'
import ViewForm from './ViewForm'
import DialogPrompt from '../DialogPrompt'
import { Toast } from 'Snackbar/useToast'
import getUserRole from 'helpers/getUserRole'
import enums from 'Constants/enums'
import getDomainName from 'helpers/getDomainName'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { StatusComponent } from 'components/common/others'
import { MainContext } from 'components/Main/provider'

function Formlist() {
  const checkUserRole = new getUserRole()
  const { featureFlag } = useContext(MainContext)
  const [pageIndex, setPageIndex] = useState(1)
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState([])
  const [size, setSize] = useState(0)
  const [page, setPage] = useState(0)
  const [reload, setReload] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [viewFormOpen, setViewFormOpen] = useState(false)
  const [deleteFormOpen, setDeleteFormOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [formToView, setFormToView] = useState({})
  const [formToDelete, setFormToDelete] = useState({})
  const [searchString, setSearchString] = useState('')
  const [actionLoader, setActionLoader] = useState({})
  // const domainName = getDomainName()
  // const logindata = JSON.parse(localStorage.getItem('loginData'))
  // const isAllowUpdate = logindata.is_allowed_to_update_formio
  // isAllowUpdate == null && isAllowUpdate == undefined ? true : !isAllowUpdate  // old logic
  const hideEdit = !featureFlag.isUpdateFormIO
  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await getAllForm({ pageIndex, pageSize: rowsPerPage, searchString })
        setForms(res.data.list)
        // console.log(res.data.list)
        setSize(res.data.listsize)
        setLoading(false)
      } catch (error) {
        setForms([])
        setLoading(false)
      }
    })()
  }, [pageIndex, rowsPerPage, searchString, reload])
  //
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  //
  const handleAction = (e, type, obj) => {
    if (type !== 'VIEW') e.stopPropagation()
    if (type === 'DELETE') {
      setDeleteFormOpen(true)
      setFormToDelete(obj)
    } else fetchFormJSON(type, obj)
  }
  const removeForm = async () => {
    setDeleteLoading(true)
    try {
      const payload = { form_id: formToDelete.form_id }
      const res = await deleteForm(payload)
      if (res.success > 0) {
        Toast.success(`Form deleted successfully !`)
        setReload(p => p + 1)
      } else Toast.error(res.message)
      setDeleteLoading(false)
      setDeleteFormOpen(false)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      setDeleteLoading(false)
      setDeleteFormOpen(false)
    }
  }
  const getStatus = status => {
    const { color, label } = enums.FORM_STATUS_CHIPS.find(d => d.value === status)
    return <StatusComponent color={color} label={label} size='small' />
  }
  const fetchFormJSON = async (type, obj) => {
    try {
      setActionLoader({ type, id: obj.form_id })
      const res = await getFormJson({ form_id: obj.form_id, asset_form_id: null })
      setActionLoader({})
      if (type === 'VIEW') {
        setFormToView(JSON.parse(res.data.asset_form_data))
        setViewFormOpen(true)
      }
      if (type === 'EDIT') history.push({ pathname: 'inspection-forms/create/', state: { ...obj, form_data: res.data.asset_form_data } })
      if (type === 'COPY') history.push({ pathname: 'inspection-forms/create/', state: { ...obj, work_procedure: '', form_name: `${obj.form_name} - Copy`, isCopy: true, form_data: res.data.asset_form_data } })
    } catch (error) {
      console.log(error)
    }
  }
  const columns = [
    { name: 'Name', accessor: 'form_name' },
    { name: 'Form Type', accessor: 'form_type' },
    { name: 'Work Procedure', accessor: 'work_procedure' },
    { name: 'Status', render: d => getStatus(d.status) },
    { name: '', render: d => <CircularProgress size={20} thickness={5} style={{ visibility: actionLoader.id === d.form_id && actionLoader.type === 'VIEW' ? 'visible' : 'hidden' }} /> },
  ]

  if (!checkUserRole.isManager()) {
    columns.push({
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton hide={hideEdit} tooltip='EDIT FORM' isLoading={actionLoader.id === d.form_id && actionLoader.type === 'EDIT'} action={e => handleAction(e, 'EDIT', d)} icon={<EditOutlinedIcon fontSize='small' />} />
          <ActionButton tooltip='COPY FORM' isLoading={actionLoader.id === d.form_id && actionLoader.type === 'COPY'} action={e => handleAction(e, 'COPY', d)} icon={<FileCopyOutlinedIcon fontSize='small' />} />
          <ActionButton tooltip='DELETE FORM' isLoading={actionLoader.id === d.form_id && actionLoader.type === 'DELETE'} action={e => handleAction(e, 'DELETE', d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} />
        </div>
      ),
    })
  }

  return (
    <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
      <div className='bg-white' style={{ height: '100%', borderRadius: '4px', padding: '16px' }}>
        <div className={`d-flex ${!checkUserRole.isManager() ? 'flex-row' : 'flex-row-reverse'} justify-content-between align-items-center`} style={{ width: '100%', marginBottom: '16px' }}>
          {!checkUserRole.isManager() && <MinimalButton text='Create Form' size='small' startIcon={<AddIcon />} onClick={() => history.push('../../inspection-forms/create/')} variant='contained' color='primary' baseClassName='nf-buttons ml-2' />}
          <SearchComponent postClear={postSearch} postSearch={postSearch} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '700px', height: '700px' }}>
          <TableComponent loading={loading} columns={columns} data={forms} onRowClick={d => handleAction({}, 'VIEW', d)} isForViewAction={true} />
        </div>
        {!isEmpty(forms) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={size} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      {viewFormOpen && <ViewForm viewObj={formToView} open={viewFormOpen} onClose={() => setViewFormOpen(false)} />}
      <DialogPrompt title='Delete Form' text='Are you sure you want to delete the form ?' open={deleteFormOpen} ctaText='Delete' actionLoader={deleteLoading} action={removeForm} handleClose={() => setDeleteFormOpen(false)} />
    </div>
  )
}

export default Formlist
