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
import getWOToAssign from '../../Services/Requests/getWOToAssign'
import TableLoader from '../TableLoader'
import TableContainer from '@material-ui/core/TableContainer'
import CircularProgress from '@material-ui/core/CircularProgress'
import Radio from '@material-ui/core/Radio'
import '../Maintainance/maintainance.css'
import _ from 'lodash'

function AddWOModal({ open, handleClose, setLinkedWO, assetID }) {
  const [loading, setLoading] = useState(true)
  const [isFetchingMore, setFetchingMore] = useState(false)
  const [workOrders, setWorkOrders] = useState([])
  const [loadedTasks, setLoadedTasks] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [selectedWO, setSelectedWO] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  let typingTimer = null
  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const allTasks = await getWOToAssign({ assetID, pageIndex, searchString })
        setWorkOrders(allTasks.data.list)
        setLoadedTasks([...loadedTasks, ...allTasks.data.list])
        if (allTasks.data.list.length <= 20) setHasMore(false)
        setLoading(false)
      } catch (error) {
        setWorkOrders([])
        setLoading(false)
      }
    })()
    return () => clearTimeout(typingTimer)
  }, [searchString])

  const linkWorkOrderToRequest = () => {
    const selectedWorkOrder = loadedTasks.find(w => w.wo_id === selectedWO)
    setLinkedWO(selectedWorkOrder)
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
      if (listboxNode.scrollTop + 65 + listboxNode.clientHeight > listboxNode.scrollHeight) {
        if (hasMore) {
          setFetchingMore(true)
          const allTasks = await getWOToAssign({ assetID, pageIndex: pageIndex + 1, searchString })
          if (allTasks.data.list.length !== 0) {
            setWorkOrders([...workOrders, ...allTasks.data.list])
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
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Work Order</div>
        <IconButton onClick={handleClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div className='content-bar d-flex flex-row-reverse'>
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
              <TableLoader cols={3} rows={5} />
            ) : _.isEmpty(workOrders) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='3' className='Pendingtbl-no-datafound'>
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell> Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrders.map(task => (
                    <TableRow key={task.wo_id}>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.wo_number}</TableCell>
                      <TableCell style={{ padding: '0 24px 0 16px' }}>{task.title}</TableCell>
                      <TableCell align='left' padding='normal' style={{ padding: '0 24px 0 16px' }}>
                        <Radio checked={selectedWO === task.wo_id} onChange={() => setSelectedWO(task.wo_id)} value={task.wo_id} name='radio-wo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
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
        <Button variant='contained' color='primary' className='nf-buttons' disableElevation style={{ marginLeft: '10px' }} onClick={linkWorkOrderToRequest}>
          Add
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
  width: '30%',
}

export default AddWOModal
