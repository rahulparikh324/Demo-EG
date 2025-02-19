import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle, FormAccordian, TaskItem, AttachmentItem } from '../../Maintainance/components'
import '../../Maintainance/maintainance.css'
import _ from 'lodash'
import { history } from '../../../helpers/history'

const useStyles = makeStyles(theme => ({
  strong: { fontWeight: 600 },
  radio: { margin: '16px 16px 0 16px', fontSize: '14px' },
  radioLabel: { fontSize: '14px', margin: 0 },
  containerDiv: { display: 'flex', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  containerSubDiv: { borderRadius: '4px', margin: '8px', display: 'flex', flexDirection: 'column', background: '#fff', maxHeight: '830px', overflowY: 'scroll', '&::-webkit-scrollbar': { width: '0.2em' }, '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' } },
  subTitile: { padding: '12px 16px', background: '#eee', fontSize: '16px', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
}))

function ViewPlan({ open, onClose, viewObj, isFromList }) {
  const classes = useStyles()
  const closeFunction = () => {
    onClose(false)
    if (isFromList) history.push({ pathname: `../../preventative-maintenance-list` })
  }
  //console.log(viewObj)
  const getStatusName = () => {
    const status = _.get(viewObj, 'active_PMTrigger.asset_pm_status', '')
    if (status === 31) return 'Overdue'
    if (status === 32) return 'Due'
    if (status === 33) return 'In Progress'
    if (status === 42) return 'Waiting'
    if (status === 43) return 'Open'
    if (status === 44) return 'Completed'
    else return ''
  }
  //
  return (
    <Drawer anchor='right' open={open} onClose={closeFunction}>
      <FormTitle title={viewObj.title} closeFunc={closeFunction} />
      <div className={classes.containerDiv}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 126px)', height: 'calc(100vh - 126px)', overflowX: 'hidden' }}>
          <div className={classes.containerSubDiv}>
            <div className='p-3'>
              <div className={classes.strong}>Description</div>
              <div>{viewObj.description}</div>
            </div>
            <div className='p-3 d-flex'>
              <div className={classes.strong}>Status : </div>
              <div>{getStatusName()}</div>
            </div>
          </div>
          <FormAccordian title='Schedule Triggers' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks justify-content-start'>
              <div style={{ padding: '16px', background: '#f4f4f4', borderRadius: '8px', fontWeight: 800 }}>
                <div>
                  {viewObj.pm_trigger_by === 28 && (
                    <>
                      <div>
                        Due on: {new Date(viewObj.active_PMTrigger.due_datetime).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} or at: {viewObj.active_PMTrigger.due_meter_hours} meter hours
                      </div>
                      <i style={{ fontSize: '11px' }}>*whichever comes first</i>
                    </>
                  )}
                  {viewObj.pm_trigger_by === 26 && <div>Due on: {new Date(viewObj.active_PMTrigger.due_datetime).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>}
                  {viewObj.pm_trigger_by === 27 && <div>Due on: {viewObj.active_PMTrigger.due_meter_hours} meter hours</div>}
                </div>
                <div className='d-flex align-items-center justify-content-between mt-2' style={{ width: '100%' }}>
                  <div>Type: {viewObj.pm_type_status_name}</div>
                  <div>By: {viewObj.pm_by_status_name}</div>
                </div>
              </div>
            </div>
          </FormAccordian>

          <FormAccordian title='Tasks' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks'>{!_.isEmpty(viewObj.assetPMTasks) && viewObj.assetPMTasks.map(task => <TaskItem key={task.task_id} code={task.tasks.task_code} title={task.tasks.task_title} time={task.tasks.task_est_display} noDelete />)}</div>
          </FormAccordian>

          <FormAccordian title='Attachments' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            <div className='schedule-triggers tasks justify-content-start align-items-center'>
              {!_.isEmpty(viewObj.assetPMAttachments) ? viewObj.assetPMAttachments.map(att => <AttachmentItem url={att.file_url} key={att.asset_pm_attachment_id} name={att.user_uploaded_name} noDelete />) : <div className='schedule-task-item d-flex justify-content-center'>No Attachments !</div>}
            </div>
          </FormAccordian>

          <FormAccordian title='Service Dealer' style={{ borderRadius: '4px', margin: '8px', background: '#fff' }} bg>
            {!_.isEmpty(viewObj.serviceDealers) ? (
              <div className='schedule-triggers tasks justify-content-start'>
                <div style={{ padding: '16px', background: '#f4f4f4', borderRadius: '8px', fontWeight: 800 }}>
                  <div>Name: {!_.isEmpty(viewObj.serviceDealers) && viewObj.serviceDealers.name}</div>
                  <div>Email: {!_.isEmpty(viewObj.serviceDealers) && viewObj.serviceDealers.email}</div>
                </div>
              </div>
            ) : (
              <div className='d-flex justify-content-center' style={{ width: 'inherit' }}>
                No Service Dealer added !
              </div>
            )}
          </FormAccordian>
        </div>
      </div>
    </Drawer>
  )
}

export default ViewPlan
