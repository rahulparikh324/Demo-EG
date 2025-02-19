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
import getNewIssues from '../../Services/WorkOrder/getNewIssues'
import TableLoader from '../TableLoader'
import TableContainer from '@material-ui/core/TableContainer'
import CircularProgress from '@material-ui/core/CircularProgress'
import '../Maintainance/maintainance.css'

function AddIssueModal({ open, handleClose, addTasks, mr_id, prevTasks, asset }) {
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
        const payload = {
          asset_id: asset.asset_id,
          mr_id: '',
          pageindex: 1,
          pagesize: 20,
          searchstring: searchString,
        }
        const allTasks = await getNewIssues(payload)
        setTasks(allTasks.data.list)
        // console.log(allTasks.data)
        setLoadedTasks([...loadedTasks, ...allTasks.data.list])
        if (allTasks.data.list.length <= 20) setHasMore(false)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setTasks([])
      }
    })()
    return () => clearTimeout(typingTimer)
  }, [searchString])
  //
  const addTasksToPM = () => {
    const arr = []
    Object.keys(checkboxObj).forEach(key => checkboxObj[key] === true && arr.push(key))
    const prevIDs = prevTasks.map(task => task.issue_uuid)
    const arrx = [...prevIDs, ...arr]
    const uni = [...new Set(arrx)]
    const tasksToAdd = uni.map(issueID => loadedTasks.find(t => t.issue_uuid === issueID))
    addTasks(tasksToAdd)
    handleClose()
  }
  //
  const handleSearch = val => {
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      setSearchString(val)
      setPageIndex(1)
    }, 700)
  }
  const handleScroll = async e => {
    const listboxNode = e.currentTarget
    try {
      if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
        if (hasMore) {
          setFetchingMore(true)
          const payload = {
            asset_id: asset.asset_id,
            mr_id: '',
            pageindex: pageIndex + 1,
            pagesize: 20,
            searchstring: searchString,
          }
          const allTasks = await getNewIssues(payload)
          if (allTasks.data.list.length !== 0) {
            setTasks([...tasks, ...allTasks.data.list])
            setLoadedTasks([...loadedTasks, ...allTasks.data.list])
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
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Link Issues</div>
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
            ) : tasks.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='3' className={' Pendingtbl-no-datafound'}>
                    No Issues for this Asset !
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell>Issue #</TableCell>
                    <TableCell>Name </TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.issue_uuid}>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.issue_number}</TableCell>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.name}</TableCell>
                      <TableCell align='left' padding='normal' style={{ padding: '0 24px 0 16px' }}>
                        <Checkbox color='primary' size='small' checked={!!checkboxObj[task.issue_uuid]} onChange={e => setCheckBox({ ...checkboxObj, [task.issue_uuid]: e.target.checked })} />
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
          Link Issue
        </Button>
      </div>
    </div>
  )
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      {body}
    </Modal>
  )
}

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '30%',
}

export default AddIssueModal
