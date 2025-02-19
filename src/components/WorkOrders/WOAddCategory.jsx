import React, { useState, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import getAllCatagoryForWO from '../../Services/WorkOrder/GetAllCatagoryForWO'
import getAllTask from '../../Services/Maintainance/getAllTask.service'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import { makeStyles } from '@material-ui/core/styles'
import DialogPrompt from '../DialogPrompt'
import assignCategoryToWO from '../../Services/WorkOrder/assignCategoryToWO'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import _ from 'lodash'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'

const useStyles = makeStyles(theme => ({
  menu: { padding: 0, fontSize: 13, boxShadow: '1px 2px 4px 1px #8080800a' },
  tableCell: { fontSize: '12px', fontWeight: 400 },
}))

function AddEditTask({ open, onClose, afterSubmit, obj, workOrderID }) {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [pageindex, setPageIndex] = useState(1)
  const [isAssignToWOPromptOpen, setAssignToWOPromptOpen] = useState(false)
  const [anchorSelectedCategory, setAnchorSelectedCategory] = useState({})
  const classes = useStyles()
  const [loadingId, setLoadingId] = useState('')
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [hasMore, setHasMore] = useState(true)
  // load
  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const res = await getAllTask(1, searchString, 20)
        setRows(res.list)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setRows([])
        setLoading(false)
      }
    })()
  }, [searchString])
  const fetchMore = async pageIndex => {
    try {
      if (!hasMore) return
      const res = await getAllTask(pageIndex, searchString, 20)
      setRows([...rows, ...res.list])
      if (res.list.length < 20) setHasMore(false)
    } catch (error) {
      console.log(error)
      setRows(rows)
    }
  }
  const handleSearchOnKeyDown = e => {
    setSearchString(searchStringValue)
  }
  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
  }
  //handle click
  const handleClickListItem = selectedObj => {
    setAnchorSelectedCategory(selectedObj)
    setAssignToWOPromptOpen(true)
  }

  const assignSelectedCategoryToWO = async () => {
    setAssignToWOPromptOpen(false)
    setLoadingId(anchorSelectedCategory.task_id)
    try {
      const payload = {
        task_id: anchorSelectedCategory.task_id,
        wo_id: workOrderID,
        form_id: anchorSelectedCategory.form_id,
      }
      const res = await assignCategoryToWO(payload)
      if (res.success > 0) Toast.success(`${obj.wo_type === 67 ? 'Task' : 'Category'} assigned successfully`)
      else Toast.error(res.message)
      setLoadingId('')
    } catch (error) {
      setLoadingId('')
      Toast.error('Something went wrong !')
    }
    onClose()
    afterSubmit()
  }

  const scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
      fetchMore(pageindex + 1)
      setPageIndex(p => p + 1)
    }
  }

  return (
    <div>
      <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
        <FormTitle title={obj.wo_type === 67 ? 'Add Tasks' : 'Add Category'} closeFunc={onClose} style={{ width: '100%' }} />
        <div style={{ padding: '10px', height: '100%', width: '640px' }}>
          <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%', marginBottom: '16px' }}>
            <div></div>
            <div>
              <Input
                placeholder='Search'
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
          <div onScroll={e => scrolledToBottom(e)} className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 150px)', height: 'calc(100vh - 150px)' }}>
            <Table size='small' stickyHeader={true}>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Form Name</TableCell>
                  <TableCell width='25%'>Action</TableCell>
                </TableRow>
              </TableHead>
              {loading ? (
                <TableLoader cols={3} />
              ) : _.isEmpty(rows) ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan='3' className={' Pendingtbl-no-datafound'}>
                      No data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {rows.map(tableRow => {
                    return (
                      <TableRow key={tableRow.task_id}>
                        <TableCell className={classes.tableCell}>{tableRow.task_title.length > 25 ? `${tableRow.task_title.slice(0, 25)}...` : tableRow.task_title}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.form_name.length > 30 ? `${tableRow.form_name.slice(0, 30)}...` : tableRow.form_name}</TableCell>
                        <TableCell width='25%'>
                          <Button size='small' startIcon={<AddIcon />} onClick={() => handleClickListItem(tableRow)} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation style={{ fontSize: '10px' }} disabled={loadingId === tableRow.task_id}>
                            {loadingId === tableRow.task_id ? 'Adding...' : 'Add to WO'}
                            {loadingId === tableRow.task_id && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </Drawer>
      <DialogPrompt title={`Add To Work Order`} text={`Are you sure you want to ${obj.wo_type === 67 ? 'add this Task' : 'assign this Category'} to Work Order?`} open={isAssignToWOPromptOpen} ctaText='Add' action={assignSelectedCategoryToWO} handleClose={() => setAssignToWOPromptOpen(false)} />
    </div>
  )
}

export default AddEditTask
