import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DialogPrompt from '../DialogPrompt'
import TablePagination from '@material-ui/core/TablePagination'
import getAllTask from '../../Services/Maintainance/getAllTask.service'
import deleteTask from '../../Services/Maintainance/deleteTask.service'
import _ from 'lodash'
import Input from '@material-ui/core/Input'
import AddEditTask from './AddEditTask'
import ViewTask from './ViewTask'
import { Toast } from '../../Snackbar/useToast'

const style = {
  tableCell: { fontSize: '12px', fontWeight: 400 },
}

function Tasklist() {
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [size, setSize] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const [editObj, setEditObj] = useState({})
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState({})
  const [viewTaskOpen, setViewTaskOpen] = useState(false)
  const [taskToView, setTaskToView] = useState({})

  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const allTasks = await getAllTask(pageIndex, searchString, rowsPerPage)
        //console.log(allTasks.list)
        setTasks(allTasks.list)
        setSize(allTasks.listsize)
        setLoading(false)
      } catch (error) {
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
  const handleSearchOnKeyDown = e => {
    setPage(0)
    setPageIndex(1)
    setSearchString(searchStringValue)
  }
  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
    setPage(0)
    setPageIndex(1)
  }
  //
  const handleAction = (type, obj) => {
    if (type === 'NEW') setIsCreateOpen(true)
    if (type === 'EDIT') {
      setEditObj(obj)
      setIsEditOpen(true)
    }
    if (type === 'DELETE') {
      setTaskToDelete(obj)
      setDeleteTaskOpen(true)
    }
    if (type === 'VIEW') {
      setTaskToView(obj)
      setViewTaskOpen(true)
    }
  }
  const deleteSelectedTask = async () => {
    try {
      const res = await deleteTask(taskToDelete.task_id)
      if (res.success === 1) Toast.success('Task deleted successfully !')
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setDeleteTaskOpen(false)
    setReload(prev => prev + 1)
  }
  //
  return (
    <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
      <div className='bg-white' style={{ height: '100%', borderRadius: '4px', padding: '16px' }}>
        <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%', marginBottom: '16px' }}>
          <Button startIcon={<AddIcon />} onClick={() => handleAction('NEW')} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
            Create Task
          </Button>
          <div>
            <Input
              placeholder='Search Tasks'
              startAdornment={
                <InputAdornment position='start'>
                  <SearchOutlined color='primary' />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment className='pointerCursor' position='end' onClick={clearSearch}>
                  {searchStringValue ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
                </InputAdornment>
              }
              value={searchStringValue}
              onChange={e => setSearchStringValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchOnKeyDown()}
            />
          </div>
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '700px', height: '700px' }}>
          <Table size='small' stickyHeader={true}>
            <TableHead>
              <TableRow>
                <TableCell>Task Code</TableCell>
                <TableCell>Task Title </TableCell>
                <TableCell>Form Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <TableLoader cols={4} />
            ) : _.isEmpty(tasks) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='4' className={' Pendingtbl-no-datafound'}>
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.task_id}>
                    <TableCell style={style.tableCell}>{task.task_code}</TableCell>
                    <TableCell style={style.tableCell}>{task.task_title}</TableCell>
                    <TableCell style={style.tableCell}>{task.form_name}</TableCell>
                    <TableCell align='left' padding='normal' style={style.tableCell}>
                      <Tooltip title='View Task' placement='top'>
                        <IconButton size='small' onClick={() => handleAction('VIEW', task)}>
                          <VisibilityOutlinedIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Edit Task' placement='top'>
                        <IconButton size='small' onClick={() => handleAction('EDIT', task)}>
                          <EditOutlinedIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete Task' placement='top'>
                        <IconButton size='small' onClick={() => handleAction('DELETE', task)}>
                          <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
        {!_.isEmpty(tasks) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={size} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      {isCreateOpen && <AddEditTask open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {isEditOpen && <AddEditTask obj={editObj} open={isEditOpen} onClose={() => setIsEditOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {viewTaskOpen && <ViewTask viewObj={taskToView} open={viewTaskOpen} onClose={() => setViewTaskOpen(false)} />}
      <DialogPrompt title='Delete Task' text='Are you sure you want to delete this Task ?' open={deleteTaskOpen} ctaText='Delete' action={deleteSelectedTask} handleClose={() => setDeleteTaskOpen(false)} />
    </div>
  )
}

export default Tasklist
