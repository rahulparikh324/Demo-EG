import React, { useEffect, useState } from 'react'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import Refresh from '@material-ui/icons/Refresh'
import PauseCircleOutlineOutlined from '@material-ui/icons/PauseCircleOutlineOutlined'
import SettingsOutlined from '@material-ui/icons/SettingsOutlined'
import getMetrics from '../../Services/Maintainance/getMetrics'
import './maintainance.css'
import { useTheme } from '@material-ui/core/styles'

function Metrics({ setState, render }) {
  const theme = useTheme()
  const Metric = ({ count, title, icon, overdue, onClick }) => (
    <div onClick={onClick} className='d-flex flex-row justify-content-between align-items-center metric-container' style={{ background: overdue ? '#FFE6E6' : '#fafafa' }}>
      {icon}
      <div className='d-flex flex-column justify-content-end align-items-end'>
        <div style={{ fontSize: 22, color: theme.palette.primary.main, fontWeight: 800 }}>{count}</div>
        <div style={{ fontWeight: 800 }}>{title}</div>
      </div>
    </div>
  )
  const [metricsCount, setMetricsCount] = useState({ inProgressCount: 'Loading...', openCount: 'Loading...', overdueCount: 'Loading...', waitingCount: 'Loading...' })

  useEffect(() => {
    ;(async () => {
      try {
        const metrics = await getMetrics()
        //console.log(metrics.data)
        setMetricsCount(metrics.data)
      } catch (error) {
        console.log(error)
        setMetricsCount({ inProgressCount: 'X', openCount: 'X', overdueCount: 'X', waitingCount: 'X' })
      }
    })()
  }, [render])

  return (
    <div className='metrics-container'>
      <Metric onClick={() => setState(31)} count={metricsCount.overdueCount} title={'Overdue PMs'} icon={<ReportProblemOutlinedIcon style={{ color: '#6b6b6b' }} />} overdue />
      <Metric onClick={() => setState(33)} count={metricsCount.inProgressCount} title={'In Progress PMs '} icon={<Refresh style={{ color: '#6b6b6b' }} />} />
      <Metric onClick={() => setState(42)} count={metricsCount.waitingCount} title={'Waiting PMs'} icon={<PauseCircleOutlineOutlined style={{ color: '#6b6b6b' }} />} />
      <Metric onClick={() => setState(43)} count={metricsCount.openCount} title={'Open PMs'} icon={<SettingsOutlined style={{ color: '#6b6b6b' }} />} />
    </div>
  )
}

export default Metrics
