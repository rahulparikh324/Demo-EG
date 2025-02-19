import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Checkbox from '@material-ui/core/Checkbox'
import getAllTask from '../../Services/Maintainance/getAllTask.service'
import TableLoader from '../TableLoader'
import TableContainer from '@material-ui/core/TableContainer'
import CircularProgress from '@material-ui/core/CircularProgress'
import '../Maintainance/maintainance.css'

function AddTaskModal({ open, handleClose, addTasks, prevTasks }) {
  const [loading, setLoading] = useState(true)
  const [isFetchingMore, setFetchingMore] = useState(false)
  const [tasks, setTasks] = useState([])
  const [checkboxObj, setCheckBox] = useState({})
  const [loadedTasks, setLoadedTasks] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  let typingTimer = null
  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const allTasks = await getAllTask(1, searchString)
        setTasks(allTasks.list)
        setLoadedTasks([...tasks, ...allTasks.list])
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    })()
    return () => clearTimeout(typingTimer)
  }, [searchString])
  //
  const addTasksToPM = () => {
    const arr = []
    Object.keys(checkboxObj).forEach(key => checkboxObj[key] === true && arr.push(key))
    const prevIDs = []
    const prev = {}
    prevTasks.forEach(task => {
      prevIDs.push(task.task_id)
      prev[task.task_id] = task
    })
    const arrx = [...prevIDs, ...arr]
    const uni = [...new Set(arrx)]
    const tasksToAdd = uni.map(taskID => loadedTasks.find(t => t.task_id === taskID))
    // console.log(tasksToAdd)
    tasksToAdd.forEach(task => {
      const isOld = prevIDs.includes(task.task_id)
      task.status = isOld ? prev[task.task_id].status : 12
      task.time_spent_hours = isOld ? prev[task.task_id].time_spent_hours : 0
      task.time_spent_minutes = isOld ? prev[task.task_id].time_spent_minutes : 0
      task.hourly_rate = isOld ? prev[task.task_id].hourly_rate : 0
    })
    addTasks(tasksToAdd)
    handleClose()
  }
  const handleSearch = val => {
    // console.log('searched ', val)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      setSearchString(val)
      setPageIndex(1)
    }, 700)
  }
  const handleScroll = async e => {
    const listboxNode = e.currentTarget
    try {
      if (listboxNode.scrollTop + 65 + listboxNode.clientHeight > listboxNode.scrollHeight) {
        if (hasMore) {
          setFetchingMore(true)
          const allTasks = await getAllTask(pageIndex + 1, searchString)
          if (allTasks.list.length !== 0) {
            setTasks([...tasks, ...allTasks.list])
            setLoadedTasks([...loadedTasks, ...allTasks.list])
            setPageIndex(pageIndex + 1)
          } else setHasMore(false)
          setFetchingMore(false)
        }
      }
    } catch (error) {
      setFetchingMore(false)
    }
  }
  //
  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Add Task</div>
        <IconButton onClick={handleClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div className='content-bar d-flex flex-row justify-content-end'>
        <Input
          placeholder='Search'
          id='input-with-icon-adornment'
          onChange={e => handleSearch(e.target.value)}
          startAdornment={
            <InputAdornment position='start'>
              <SearchOutlined color='primary' fontSize='small' />{' '}
            </InputAdornment>
          }
        />
      </div>
      <div className='content-bar'>
        <TableContainer style={{ maxHeight: '248px' }} id='scrollableDiv' onWheel={e => handleScroll(e)}>
          <Table size='small' stickyHeader={true}>
            {loading ? (
              <TableLoader cols={4} rows={5} />
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Code</TableCell>
                    <TableCell style={{ width: '40%' }}>Task Title </TableCell>
                    <TableCell>Est Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.task_id}>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.task_code}</TableCell>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.task_title}</TableCell>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.task_est_display}</TableCell>
                      <TableCell align='left' padding='normal' style={{ padding: '0 24px 0 16px' }}>
                        <Checkbox color='primary' size='small' checked={!!checkboxObj[task.task_id]} onChange={e => setCheckBox({ ...checkboxObj, [task.task_id]: e.target.checked })} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </Table>
        </TableContainer>
      </div>
      {isFetchingMore && (
        <div className='d-flex'>
          <CircularProgress size={15} thickness={5} style={{ margin: '3px 16px' }} />
          <b>Loading...</b>
        </div>
      )}
      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' disableElevation style={{ marginLeft: '10px' }} disabled={!Object.values(checkboxObj).includes(true)} onClick={addTasksToPM}>
          Add Task
        </Button>
      </div>
    </div>
  )
  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
        {body}
      </Modal>
    </>
  )
}

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '50%',
}

export default AddTaskModal
