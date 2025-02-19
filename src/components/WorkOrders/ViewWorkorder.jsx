import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle, FormAccordian } from '../Maintainance/components'
import '../Maintainance/maintainance.css'
import { NavigatLinkToNewTab } from '../Requests/components'
import _ from 'lodash'
import { TaskItem, IssueItem, AttachmentItem, TaskProgress, TaskProgressDetail } from './components'
import { useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  strong: { fontWeight: 600 },
  containerDiv: { display: 'flex', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  containerSubDiv: { borderRadius: '4px', margin: '8px', display: 'flex', flexDirection: 'column', background: '#fff', maxHeight: '830px', overflowY: 'scroll', '&::-webkit-scrollbar': { width: '0.2em' }, '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' } },
  printButton: { background: theme.palette.primary.main, borderRadius: '8px', border: 'none', outline: 'none', padding: '10px' },
}))

function ViewWorkorder({ open, onClose, viewObj }) {
  const classes = useStyles()
  const [totalEstTime, setTotalEstTime] = useState('')
  const [totalSpentTime, setTotalSpentTime] = useState('')
  const [progress, setProgress] = useState(0)
  const [overspent, setOverSpent] = useState(false)
  const [tasks, setTasks] = useState([])
  const theme = useTheme()

  const LabelVal = ({ label, value }) => (
    <div className='px-3 py-2 d-flex'>
      <div className={classes.strong}>{label} : </div>
      <div>{value}</div>
    </div>
  )
  //
  const getTimeSpentAndEst = (hrs, mins) => {
    if (!hrs && !mins) return
    else if (!hrs) return `${mins} mins`
    else if (!mins) return `${hrs} hrs`
    else return `${hrs} hrs ${mins} mins`
  }
  // console.log(!_.isEmpty(viewObj.maintenanceRequests))

  useEffect(() => {
    // console.log(viewObj)
    const totEst = { hrs: 0, mins: 0 }
    const totSpd = { hrs: 0, mins: 0 }
    const tasks_ = []
    viewObj.workOrderTasks.forEach(task => {
      tasks_.push({
        ...task.tasks,
        status: task.status,
        time_spent_hours: task.time_spent_hours,
        time_spent_minutes: task.time_spent_minutes,
      })
      totEst.hrs += task.tasks.task_est_hours
      totEst.mins += task.tasks.task_est_minutes
      totSpd.hrs += task.time_spent_hours
      totSpd.mins += task.time_spent_minutes
    })
    totEst.hrs += Math.floor(totEst.mins / 60)
    totEst.mins %= 60
    totSpd.hrs += Math.floor(totSpd.mins / 60)
    totSpd.mins %= 60
    //console.log(totEst, totSpd)
    if (totSpd.hrs * 60 + totSpd.mins > totEst.hrs * 60 + totEst.mins) {
      setOverSpent(true)
      setProgress(((totEst.hrs * 60 + totEst.mins) / (totSpd.hrs * 60 + totSpd.mins)) * 100)
    } else {
      setOverSpent(false)
      setProgress(((totSpd.hrs * 60 + totSpd.mins) / (totEst.hrs * 60 + totEst.mins)) * 100)
    }
    setTotalEstTime(getTimeSpentAndEst(totEst.hrs, totEst.mins))
    setTotalSpentTime(getTimeSpentAndEst(totSpd.hrs, totSpd.mins))
    setTasks(tasks_)
  }, [viewObj])

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={`#${viewObj.wo_number} - ${viewObj.title}`} closeFunc={onClose} />
      <div className={classes.containerDiv}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', overflowX: 'hidden' }}>
          <div className={classes.containerSubDiv}>
            <div className='px-3 pt-3 pb-2'>
              <div className={classes.strong}>Description</div>
              <div>{viewObj.description}</div>
            </div>
            <div className='d-flex'>
              <LabelVal label='Created Date' value={viewObj.created_at.split('T')[0]} />
              <LabelVal label='Status' value={viewObj.status_name} />
            </div>
            <div className='d-flex'>
              <LabelVal label='Work Type' value={viewObj.wo_type_name} />
              <LabelVal label='Priority' value={viewObj.priority_name} />
            </div>
            <div className='d-flex pb-1'>
              <LabelVal label='Due at' value={viewObj.due_at.split('T')[0]} />
            </div>
          </div>
          <NavigatLinkToNewTab title='Asset Info' func={() => window.open(`assets/details/${viewObj.asset.asset_id}`, '_blank')}>
            {viewObj.asset && (
              <>
                <i>
                  <strong style={{ color: theme.palette.primary.main }}>#{viewObj.asset.internal_asset_id}</strong> - {viewObj.asset.name}
                </i>
                <div>
                  <i>
                    Current Meter Hours: <strong style={{ color: theme.palette.primary.main }}>{viewObj.asset.meter_hours}</strong>
                  </i>
                </div>
              </>
            )}
          </NavigatLinkToNewTab>
          <FormAccordian title='Issues' count={viewObj.maintenanceRequests.length} style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks' style={{ gap: '0' }}>
              {!_.isEmpty(viewObj.maintenanceRequests) ? (
                viewObj.maintenanceRequests.map(issue => <IssueItem key={issue.mr_id} inspectionID={issue.inspection_id} meters={issue.meter_at_inspection} code={`#${issue.issue[0].issue_number}`} title={issue.issue[0].name} noDelete />)
              ) : (
                <div className='schedule-task-item d-flex justify-content-center'>No Issues !</div>
              )}
            </div>
          </FormAccordian>
          <FormAccordian extra={<TaskProgressDetail totalEstTime={totalEstTime} totalSpentTime={totalSpentTime} />} progress={<TaskProgress overspent={overspent} val={progress} />} title='Tasks' count={viewObj.workOrderTasks.length} style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks' style={{ gap: '0' }}>
              {!_.isEmpty(viewObj.workOrderTasks) ? tasks.map(task => <TaskItem readOnly isViewEdit task={task} key={task.task_id} code={`#${task.task_code}`} status={task.status} title={task.task_title} time={task.task_est_display} noDelete />) : <div className='schedule-task-item d-flex justify-content-center'>No Tasks !</div>}
            </div>
          </FormAccordian>
          {/* <FormAccordian title='Service Dealer' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks justify-content-start align-items-center'>
              {!_.isEmpty(viewObj.serviceDealers) ? (
                <div className='schedule-triggers tasks justify-content-start'>
                  <div style={{ padding: '16px', background: '#f4f4f4', borderRadius: '8px', fontWeight: 800 }}>
                    <div>Name: {!_.isEmpty(viewObj.serviceDealers) && viewObj.serviceDealers.name}</div>
                    <div>Email: {!_.isEmpty(viewObj.serviceDealers) && viewObj.serviceDealers.email}</div>
                  </div>
                </div>
              ) : (
                <div className='schedule-task-item  d-flex justify-content-center'>No Service Dealer added !</div>
              )}
            </div>
          </FormAccordian> */}
          <FormAccordian title='Attachments' count={viewObj.workOrderAttachments.length} style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks justify-content-start align-items-center'>
              {!_.isEmpty(viewObj.workOrderAttachments) ? viewObj.workOrderAttachments.map(att => <AttachmentItem url={att.file_url} key={att.wo_attachment_id} name={att.user_uploaded_name} noDelete />) : <div className='schedule-task-item d-flex justify-content-center'>No Attachments !</div>}
            </div>
          </FormAccordian>
        </div>
      </div>
    </Drawer>
  )
}

export default ViewWorkorder
