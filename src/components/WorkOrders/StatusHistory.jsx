import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import '../Maintainance/maintainance.css'
import _ from 'lodash'
import { HistoryStatus, HistoryLoader } from './components'
import getStatusHistory from '../../Services/WorkOrder/getStatusHistory'

const useStyles = makeStyles(theme => ({
  strong: { fontWeight: 600 },
  containerDiv: { display: 'flex', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  containerSubDiv: { borderRadius: '4px', margin: '8px', display: 'flex', flexDirection: 'column', maxHeight: '830px', overflowY: 'scroll', '&::-webkit-scrollbar': { width: '0.2em' }, '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' } },
}))

function StatusHistory({ open, onClose, historyObj }) {
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [statusHistoryList, setStatusHistoryList] = useState([])

  //data fetch
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await getStatusHistory(historyObj.wo_id)
        const statusHistory = data.data.list
        // console.log(statusHistory)
        setStatusHistoryList(statusHistory)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setStatusHistoryList([])
      }
    })()
  }, [])

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Status History' closeFunc={onClose} />
      <div className={classes.containerDiv}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 75px)', height: 'calc(100vh - 75px)', overflowX: 'hidden', padding: '10px' }}>
          <div>{loading ? <HistoryLoader /> : _.isEmpty(statusHistoryList) ? <div className='schedule-task-item d-flex justify-content-center bg-white'>No history to show !</div> : statusHistoryList.map(his => <HistoryStatus key={his.activity_id} obj={his} />)}</div>
        </div>
      </div>
    </Drawer>
  )
}

export default StatusHistory
