import React, { useEffect, useState, useCallback, useRef } from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import getActivityLogs from '../../Services/Asset/getActivityLogs'
import AssignmentTurnedInOutlined from '@material-ui/icons/AssignmentTurnedInOutlined'
import RecentActorsOutlinedIcon from '@material-ui/icons/RecentActorsOutlined'
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined'
import { ActivtyLoader } from '../Assets/AssetDetail/components'
import { getDateTime } from '../../helpers/getDateTime'
import _ from 'lodash'

const useStyles = makeStyles(theme => ({
  root: { paddingTop: '10px', flexGrow: 1 },
  paper: { height: '88vh' },
  infoTitle: { fontSize: '16px', fontWeight: 800, padding: '12px 18px', fontFamily: 'Manrope-Medium' },
  activityBox: {
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
    },
  },
}))

function Activity({ activity, elementRef }) {
  return (
    <>
      <div className='p-3 d-flex' ref={elementRef}>
        <div style={{ width: '20px' }}>
          {[1, 2, 8].includes(activity.activity_type) && <RecentActorsOutlinedIcon style={{ fontSize: '18px', color: '#474747' }} />}
          {[3, 4, 5, 9, 10, 11, 12, 13].includes(activity.activity_type) && <AssignmentTurnedInOutlined style={{ fontSize: '18px', color: '#474747' }} />}
          {[14, 15, 16, 17, 18].includes(activity.activity_type) && <BuildOutlinedIcon style={{ fontSize: '18px', color: '#474747' }} />}
          {activity.activity_type === 6 && <ReportProblemOutlinedIcon style={{ fontSize: '18px', color: '#ff0000' }} />}
          {activity.activity_type === 7 && <ReportProblemOutlinedIcon style={{ fontSize: '18px', color: '#00B407' }} />}
        </div>
        <div className='px-2 d-flex flex-column' style={{ width: '100%' }}>
          <div className='d-flex justify-content-between'>
            <div>{activity.activity_message}</div>
            <div></div>
          </div>
          <div className='d-flex justify-content-between pt-2'>
            <div>
              {[3, 5, 9, 10, 11, 12, 7, 13].includes(activity.activity_type) && (
                <i style={{ color: '#7E7E7E' }}>
                  {activity.activity_type === 3 ? `Requested` : `Reviewed`} By: {activity.updated_by_name}
                </i>
              )}
            </div>
            <div>
              <i style={{ color: '#7E7E7E' }}>{getDateTime(activity.created_at, activity.timezone)}</i>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderBottom: '1px solid #f1f1f1', width: '80%', marginTop: '10px', margin: '0 auto' }}></div>
    </>
  )
}

function ActivityFeed() {
  const classes = useStyles()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasNext, setHasNext] = useState(true)
  const [page, setPage] = useState(1)
  const observer = useRef()

  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [])
  //
  useEffect(() => {
    ;(async () => {
      try {
        if (hasNext) {
          const _logs = await getActivityLogs(page, 0)
          const data = [...logs, ..._logs.data.list]
          setLogs(prev => [...prev, ..._logs.data.list])
          setHasNext(data.length < _logs.data.listsize)
          setLoading(false)
        }
      } catch (err) {
        console.log(err)
        setLoading(false)
      }
    })()
  }, [page])
  return (
    <Paper elevation={0} className={classes.paper}>
      <div className={`${classes.infoTitle} d-flex justify-content-between`}>
        <span>Activity Feed</span>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: ' calc(100% - 50px)', height: ' calc(100% - 50px)' }}>
        {loading ? (
          <ActivtyLoader n={20} />
        ) : !_.isEmpty(logs) ? (
          logs.map((log, index) => <Activity activity={log} key={log.activity_id} elementRef={logs.length === index + 1 ? lastElementRef : null} />)
        ) : (
          <div className='d-flex justify-content-center align-items-center' style={{ height: '100%', fontWeight: 800 }}>
            No Activities{' '}
          </div>
        )}
      </div>
    </Paper>
  )
}

export default ActivityFeed
